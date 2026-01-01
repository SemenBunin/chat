import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import pool from './db/index.js';
import authRoutes from './routes/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Аватарки
const storage = multer.diskStorage({
  destination: './server/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  const { username } = req.body;
  const avatarUrl = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE users SET avatar_url = $1 WHERE username = $2', [avatarUrl, username]);
  res.json({ avatarUrl });
});

app.use('/api', authRoutes);

// WebSocket: пересылка сообщений
const clients = new Map(); // username → ws

wss.on('connection', (ws, req) => {
  const username = new URL(req.url, 'http://dummy').searchParams.get('username');
  if (username) {
    clients.set(username, ws);
  }

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      // Сохраняем зашифрованное сообщение
      await pool.query(
        'INSERT INTO messages (from_user, to_user, encrypted_payload) VALUES ($1, $2, $3)',
        [msg.from, msg.to, msg.payload]
      );

      // Отправляем получателю, если он онлайн
      const recipientSocket = clients.get(msg.to);
      if (recipientSocket && recipientSocket.readyState === 1) {
        recipientSocket.send(JSON.stringify({ from: msg.from, payload: msg.payload }));
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on('close', () => {
    for (const [user, socket] of clients.entries()) {
      if (socket === ws) clients.delete(user);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});