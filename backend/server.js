const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const localUri = process.env.MONGO_URI || 'mongodb://localhost:27017/librarydb';

let BookModel = null;
let serverInstance = null;
const useDb = true;

// Function to start server
async function startServer(portNumber = process.env.PORT || 4000) {
  try {
    // Connect to local MongoDB
    await mongoose.connect(localUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    BookModel = require('./models/book');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Mongo connection error:', err);
    process.exit(1); // Exit if DB connection fails
  }

  return new Promise((resolve) => {
    serverInstance = app.listen(portNumber, () => {
      console.log(`Server listening on ${portNumber}`);
      resolve(serverInstance);
    });
  });
}


// Stop server function
async function stopServer() {
  if (serverInstance) serverInstance.close();
  if (BookModel) await mongoose.disconnect();
}

// Health endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: useDb }));

// In-memory fallback
let books = [];
let nextId = 1;

// Get all books
app.get('/api/books', async (req, res) => {
  if (BookModel) {
    const docs = await BookModel.find().lean();
    return res.json(docs.map(d => ({
      id: String(d._id),
      title: d.title,
      author: d.author,
      borrowed: d.borrowed
    })));
  }
  res.json(books);
});

// Add a book
app.post('/api/books', async (req, res) => {
  const { title, author } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  if (BookModel) {
    const doc = await BookModel.create({ title, author });
    return res.status(201).json({
      id: String(doc._id),
      title: doc.title,
      author: doc.author,
      borrowed: doc.borrowed
    });
  }

  const book = { id: String(nextId++), title, author: author || 'unknown', borrowed: false };
  books.push(book);
  res.status(201).json(book);
});

// Borrow a book
app.post('/api/books/:id/borrow', async (req, res) => {
  const id = req.params.id;

  if (BookModel) {
    const doc = await BookModel.findById(id);
    if (!doc) return res.status(404).json({ error: 'not found' });
    if (doc.borrowed) return res.status(400).json({ error: 'already borrowed' });

    doc.borrowed = true;
    await doc.save();
    return res.json({
      id: String(doc._id),
      title: doc.title,
      author: doc.author,
      borrowed: doc.borrowed
    });
  }

  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'not found' });
  if (book.borrowed) return res.status(400).json({ error: 'already borrowed' });

  book.borrowed = true;
  res.json(book);
});

// Serve frontend build if exists
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuild));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'not found' });
  res.sendFile(path.join(frontendBuild, 'index.html'), err => {
    if (err) res.status(404).send('Not Found');
  });
});

// Export modules for testing
module.exports = {
  app,
  startServer,
  stopServer,
  reset: async () => {
  books = [];
  nextId = 1;
  if (BookModel) await BookModel.deleteMany({});
}
};

// Start server if run directly
if (require.main === module) {
  startServer();
}
