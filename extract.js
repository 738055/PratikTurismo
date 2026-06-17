const fs = require('fs');
const svg = fs.readFileSync('c:/Projetos/PratikTurismo/public/brand/logopratik.svg', 'utf8');
const match = svg.match(/base64,([^"']+)/);
if (match) {
  fs.writeFileSync('c:/Projetos/PratikTurismo/public/brand/logo.png', Buffer.from(match[1], 'base64'));
  console.log('PNG extracted to logo.png');
}
