const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
const apiBase = isLocalhost ? 'http://localhost:4000' : '';

async function fetchBooks() {
  const res = await fetch(`${apiBase}/api/books`);
  const books = await res.json();
  const ul = document.getElementById('books');
  ul.innerHTML = '';
  books.forEach(b => {
    const li = document.createElement('li');
    li.textContent = `${b.title} by ${b.author} ${b.borrowed ? '(borrowed)' : ''}`;
    if (!b.borrowed) {
      const btn = document.createElement('button');
      btn.textContent = 'Borrow';
      btn.onclick = async () => {
        await fetch(`${apiBase}/api/books/${b.id}/borrow`, { method: 'POST' });
        fetchBooks();
      };
      li.appendChild(btn);
    }
    ul.appendChild(li);
  });
}

document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  await fetch(`${apiBase}/api/books`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, author }) });
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  fetchBooks();
});

fetchBooks();
