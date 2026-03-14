import { queries } from './db.js';

const sendError = (res, status, message) => res.status(status).json({ error: message });

export const requestController = {
  create: (req, res) => {
    const { clientName, phone, address, problemText } = req.body;
    if (!clientName || !phone || !address || !problemText) {
      return sendError(res, 400, 'All fields are required');
    }
    try {
      const info = queries.createRequest({ clientName, phone, address, problemText });
      // Convert BigInt to Number for JSON serialization
      res.status(201).json({ id: Number(info.lastInsertRowid) });
    } catch (err) {
      console.error(err);
      sendError(res, 500, 'Database error');
    }
  },

  list: (req, res) => {
    try {
      const requests = queries.getRequests(req.query.status);
      res.json(requests);
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  },

  getById: (req, res) => {
    try {
      const request = queries.getRequestById(req.params.id);
      if (!request) return sendError(res, 404, 'Request not found');
      res.json(request);
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  },

  assign: (req, res) => {
    const id = Number(req.params.id);
    const { masterId } = req.body;
    if (!masterId) return sendError(res, 400, 'Master ID is required');

    try {
      const info = queries.assignRequest(id, masterId);
      if (info.changes === 0) return sendError(res, 404, 'Request not found or invalid status');
      res.json({ success: true });
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  },

  take: (req, res) => {
    const id = Number(req.params.id);
    try {
      // The atomic update happens here
      const info = queries.takeRequest(id);
      
      // If changes is 0, it means the WHERE clause (id=? AND status='assigned') failed.
      // This is the race-condition trigger.
      if (info.changes === 0) {
        return sendError(res, 409, 'Request already taken or not in assigned status');
      }
      
      res.json({ success: true });
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  },

  finish: (req, res) => {
    const id = Number(req.params.id);
    const { masterId } = req.body;
    if (!masterId) return sendError(res, 400, 'Master ID is required');

    try {
      const info = queries.completeRequest(id, masterId);
      if (info.changes === 0) return sendError(res, 404, 'Request not found or not in progress');
      res.json({ success: true });
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  },

  cancel: (req, res) => {
    const id = Number(req.params.id);
    try {
      const info = queries.cancelRequest(id);
      if (info.changes === 0) return sendError(res, 404, 'Request not found or already finished');
      res.json({ success: true });
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  }
};

export const userController = {
  list: (req, res) => {
    try {
      const users = queries.getUsers(req.query.role);
      res.json(users);
    } catch (err) {
      sendError(res, 500, 'Database error');
    }
  }
};
