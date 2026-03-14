import request from 'supertest';
import app from '../server/app.js';
import db from '../server/db.js';

describe('Repair Service API', () => {
  // Setup: Clear and seed database before tests
  beforeAll(() => {
    db.prepare('DELETE FROM requests').run();
  });

  test('Test 1: Create request', async () => {
    const res = await request(app)
      .post('/requests')
      .send({
        clientName: 'Test Client',
        phone: '123456',
        address: 'Test Address',
        problemText: 'Test Problem'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  test('Test 2: Race condition for take request', async () => {
    // 0. Seed a master user
    const master = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)').run('test_master', 'master');
    const masterId = Number(master.lastInsertRowid);

    // 1. Create a request
    const createRes = await request(app)
      .post('/requests')
      .send({
        clientName: 'Race Client',
        phone: '000',
        address: 'Race St',
        problemText: 'Race Problem'
      });
    const requestId = createRes.body.id;

    // 2. Assign it to a master
    await request(app)
      .post(`/requests/${requestId}/assign`)
      .send({ masterId });

    // 3. Fire two parallel take requests
    const [res1, res2] = await Promise.all([
      request(app).post(`/requests/${requestId}/take`),
      request(app).post(`/requests/${requestId}/take`)
    ]);

    // 4. Verify results: one 200, one 409
    const statuses = [res1.statusCode, res2.statusCode].sort();
    expect(statuses).toEqual([200, 409]);
  });
});
