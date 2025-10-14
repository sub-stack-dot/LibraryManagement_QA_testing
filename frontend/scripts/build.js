const fs = require('fs');
const path = require('path');
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
fs.writeFileSync(path.join(buildDir, 'index.html'), html);
fs.copyFileSync(path.join(__dirname, '..', 'public', 'main.js'), path.join(buildDir, 'main.js'));
console.log('Built frontend to', buildDir);
