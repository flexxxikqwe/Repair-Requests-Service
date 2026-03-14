const API = {
    async createRequest(data) {
        const res = await fetch('/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async getRequests(status = '') {
        const res = await fetch(`/requests${status ? `?status=${status}` : ''}`);
        return res.json();
    },

    async getUsers(role = '') {
        const res = await fetch(`/users${role ? `?role=${role}` : ''}`);
        return res.json();
    },

    async assignRequest(id, masterId) {
        const res = await fetch(`/requests/${id}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterId: Number(masterId) })
        });
        return res.json();
    },

    async takeRequest(id) {
        const res = await fetch(`/requests/${id}/take`, { method: 'POST' });
        if (res.status === 409) throw new Error('Conflict: Request already taken or status changed.');
        return res.json();
    },

    async finishRequest(id, masterId) {
        const res = await fetch(`/requests/${id}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterId: Number(masterId) })
        });
        return res.json();
    },

    async cancelRequest(id) {
        const res = await fetch(`/requests/${id}/cancel`, { method: 'POST' });
        return res.json();
    }
};
