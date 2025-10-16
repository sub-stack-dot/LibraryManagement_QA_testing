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

// Simple function to escape HTML special characters
const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Add a book (secured - input validation + XSS protection)
app.post('/api/books', async (req, res) => {
  let { title, author } = req.body;

  // Validate types
  if (typeof title !== 'string' || typeof author !== 'string') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  // Trim and escape
  title = escapeHtml(title.trim());
  author = escapeHtml(author.trim() || 'unknown');

  if (!title) return res.status(400).json({ error: 'Title cannot be empty' });

  if (BookModel) {
    const doc = await BookModel.create({ title, author });
    return res.status(201).json({
      id: String(doc._id),
      title: doc.title,
      author: doc.author,
      borrowed: doc.borrowed
    });
  }

  const book = { id: String(nextId++), title, author, borrowed: false };
  books.push(book);
  res.status(201).json(book);
});



// Borrow a book (secured - validate ID and prevent injection)
app.post('/api/books/:id/borrow', async (req, res) => {
  const id = req.params.id;

  //  Validate ID format to prevent NoSQL injection
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid book ID format' });
  }

  if (BookModel) {
    try {
      const doc = await BookModel.findById(id);
      if (!doc) return res.status(404).json({ error: 'Book not found' });
      if (doc.borrowed) return res.status(400).json({ error: 'Book already borrowed' });

      doc.borrowed = true;
      await doc.save();

      return res.json({
        id: String(doc._id),
        title: doc.title,
        author: doc.author,
        borrowed: doc.borrowed
      });
    } catch (err) {
      console.error('Error borrowing book:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Fallback (in-memory)
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.borrowed) return res.status(400).json({ error: 'Book already borrowed' });

  book.borrowed = true;
  res.json(book);
});


// Start server if run directly
if (require.main === module) {
  startServer();
}
