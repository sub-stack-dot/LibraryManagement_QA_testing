const request = require('supertest');
const { app, startServer, stopServer, reset } = require('../../backend/server');

let srv;
beforeAll(async () => {
  srv = await startServer(0); // 0 picks a free port
});
afterAll(async () => {
  await stopServer();
});

beforeEach(async () => {
  await reset();
});

test('POST /api/books creates a book', async () => {
  const res = await request(app).post('/api/books').send({ title: 'Test Book', author: 'Me' });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body.title).toBe('Test Book');
});

test('POST /api/books/:id/borrow marks book borrowed', async () => {
  const create = await request(app).post('/api/books').send({ title: 'T' });
  const id = create.body.id;
  const borrow = await request(app).post(`/api/books/${id}/borrow`);
  expect(borrow.status).toBe(200);
  expect(borrow.body.borrowed).toBe(true);
});
