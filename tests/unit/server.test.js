const request = require('supertest');
const { app, startServer, stopServer, reset } = require('../../backend/server');

let srv;

beforeAll(async () => {
  srv = await startServer(0);
});

afterAll(async () => {
  await stopServer();
});

beforeEach(async () => {
  if (reset) await reset();
});

describe('Library API', () => {
  test('POST /api/books creates a book', async () => {
    const res = await request(app).post('/api/books').send({ title: 'Test Book', author: 'Me' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Book');
    expect(res.body.author).toBe('Me');
    expect(res.body.borrowed).toBe(false);
  });

  test('POST /api/books/:id/borrow marks book borrowed', async () => {
    const create = await request(app).post('/api/books').send({ title: 'Borrowable Book' });
    const id = create.body.id;
    const borrow = await request(app).post(`/api/books/${id}/borrow`);
    expect(borrow.status).toBe(200);
    expect(borrow.body.borrowed).toBe(true);
  });

  test('GET /api/books returns all books', async () => {
    await request(app).post('/api/books').send({ title: 'Book 1' });
    await request(app).post('/api/books').send({ title: 'Book 2' });
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('POST /api/books without title returns 400', async () => {
    const res = await request(app).post('/api/books').send({ author: 'Nobody' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'title required');
  });
});
