const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('../models/Message'); // 引入 Message 模型

const username = "wengchinbusiness";
const password = "OdelKSTJEWDKD27T";
const dbName = 'sample_mflix'; // 替换为你的数据库名称
const uri = `mongodb+srv://${username}:${password}@cluster0.5x4eq.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Database connection error:', err));

module.exports = (req, res) => {
    const io = new Server(res.socket.server);

    if (req.method === 'GET') {
        Message.find().then(messages => {
            res.status(200).json(messages); // 返回所有消息
        }).catch(err => {
            res.status(500).json({ error: 'Database error' });
        });
    }

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('chat message', async (msg) => {
            console.log('Message received: ' + msg);
            const message = new Message({ content: msg });
            await message.save(); // 保存消息到数据库
            io.emit('chat message', msg); // 广播消息到所有客户端
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    if (!res.socket.server.io) {
        res.socket.server.io = io;
    }
};
