const express = require('express');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = 3000;

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: `/uploads/${req.file.filename}` });
});

const server = app.listen(PORT, () =>
  console.log(`✅ Server running on ${PORT}`)
);

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  db.all(`SELECT * FROM messages`, (e, rows) => {
    ws.send(JSON.stringify({ type: 'history', data: rows }));
  });

  ws.on('message', msg => {
    const data = JSON.parse(msg);

    db.run(
      `INSERT INTO messages (user, text, file) VALUES (?, ?, ?)`,
      [data.user, data.text || '', data.file || '']
    );

    wss.clients.forEach(c => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify({ type: 'message', data }));
      }
    });
  });
});
