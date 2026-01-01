const express = require('express');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });
const multer = require('multer');
const path = require('path');
const db = require('./db');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

// Multer для аватарок и файлов
const uploadFiles = multer({ dest: path.join(__dirname, 'uploads/') });
const uploadAvatars = multer({ dest: path.join(__dirname, 'avatars/') });

// API: загрузка аватарки
app.post('/avatar', uploadAvatars.single('avatar'), (req,res)=>{
    if(!req.file) return res.status(400).json({error:'Нет файла'});
    res.json({url:`/avatars/${req.file.filename}`});
});

// API: загрузка файла (шифрованного)
app.post('/upload', uploadFiles.single('file'), (req,res)=>{
    if(!req.file) return res.status(400).json({error:'Нет файла'});
    res.json({url:`/uploads/${req.file.filename}`, name:req.file.originalname});
});

// WebSocket для чатов
wss.on('connection', ws=>{
    ws.on('message', msg=>{
        const data = JSON.parse(msg);
        // Сохраняем зашифрованное сообщение
        db.addMessage(data.chatId, data.senderId, data.encrypted, data.file);
        // Рассылаем только участникам чата
        wss.clients.forEach(client=>{
            if(client.readyState === WebSocket.OPEN && data.recipients.includes(client.userId)){
                client.send(JSON.stringify(data));
            }
        });
    });

    // идентификация пользователя при подключении
    ws.on('identify', userId=>{
        ws.userId = userId;
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
