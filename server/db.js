import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../repair_service.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('dispatcher', 'master')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    problemText TEXT NOT NULL,
    status TEXT CHECK(status IN ('new', 'assigned', 'in_progress', 'done', 'canceled')) DEFAULT 'new',
    masterId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export const queries = {
  createRequest: ({ clientName, phone, address, problemText }) => {
    const stmt = db.prepare('INSERT INTO requests (clientName, phone, address, problemText) VALUES (?, ?, ?, ?)');
    return stmt.run(clientName, phone, address, problemText);
  },

  getRequests: (status, masterId) => {
    let sql = `
      SELECT r.*, u.name as masterName 
      FROM requests r 
      LEFT JOIN users u ON r.masterId = u.id
    `;
    const params = [];
    const conditions = [];
    
    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }
    if (masterId) {
      conditions.push('r.masterId = ?');
      params.push(masterId);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY r.createdAt DESC';
    return db.prepare(sql).all(...params);
  },

  getRequestById: (id) => {
    return db.prepare(`
      SELECT r.*, u.name as masterName 
      FROM requests r 
      LEFT JOIN users u ON r.masterId = u.id 
      WHERE r.id = ?
    `).get(id);
  },

  getUsers: (role) => {
    let sql = 'SELECT id, name, role FROM users';
    const params = [];
    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }
    return db.prepare(sql).all(...params);
  },

  assignRequest: (id, masterId) => {
    // UPDATED: Allow resetting from 'in_progress' to 'assigned' for re-assignment/testing
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = 'assigned', masterId = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND status IN ('new', 'assigned', 'in_progress')
    `);
    return stmt.run(masterId, id);
  },

  takeRequest: (id) => {
    // ATOMIC UPDATE: This is the core of the race-condition safety.
    // The database engine ensures that only one concurrent request 
    // will find the row with status 'assigned'.
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = 'in_progress', updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'assigned'
    `);
    return stmt.run(id);
  },

  completeRequest: (id, masterId) => {
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = 'done', updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'in_progress' AND masterId = ?
    `);
    return stmt.run(id, masterId);
  },

  cancelRequest: (id) => {
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = 'canceled', updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND status != 'done'
    `);
    return stmt.run(id);
  }
};

export default db;
