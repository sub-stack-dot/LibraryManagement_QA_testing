# Library Management (MERN minimal)

This project provides a minimal MERN-like setup (Express backend + static frontend) with automated tests and a GitHub Actions CI workflow.

Features
- Add book (POST /api/books)
- Borrow book (POST /api/books/:id/borrow)
- List books (GET /api/books)

Run locally
1. Install node dependencies at root:

```powershell
npm install
npm run install:frontend
```

2. Start server:

```powershell
npm start
```

3. Run unit tests:

```powershell
npm run test:unit
```

4. Run API tests (requires server running):

```powershell
npm run test:api
```

5. Run Selenium UI tests (requires Chrome & chromedriver):

```powershell
npm run test:ui
```

CI
See `.github/workflows/ci.yml` for a GitHub Actions configuration that installs, builds, runs unit tests, Newman collection, and Selenium tests.
