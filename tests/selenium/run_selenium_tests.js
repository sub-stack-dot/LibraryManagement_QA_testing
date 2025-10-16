const { spawn } = require('child_process');
const path = require('path');
const { addBookAndBorrow } = require('./add_and_borrow.test');
const { addBookOnly } = require('./add_only.test');
const server = require('../../backend/server');

async function run() {
  const port = 4000;
  const baseUrl = `http://localhost:${port}`;
  const srv = server.app.listen(port);
  try {
    await addBookOnly(baseUrl);
    await addBookAndBorrow(baseUrl);
    console.log('Selenium tests passed');
  } catch (e) {
    console.error('Selenium tests failed', e);
    process.exitCode = 2;
  } finally {
    srv.close();
  }
}

if (require.main === module) run();
