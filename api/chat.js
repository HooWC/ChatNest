// api/chat.js
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const username = 'your_username'; // 替换为你的用户名
const password = 'your_password'; // 替换为你的密码
const dbName = 'sample_mflix';
const uri = mongodb + srv://${username}:${password}@cluster0.5x4eq.mongodb.net/${dbName}?retryWrites=true&w=majority;

    mongoose.connect(uri)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('Database connection error:', err));

module.exports = (req, res) => {
    if (req.method === 'GET') {
        res.status(200).send('Chat API is working');
    }

    const io = new Server(res.socket.server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('chat message', async (msg) => {
            console.log('Message received: ' + msg);
            // 这里保存消息到数据库的代码
            // 然后广播消息到所有客户端
            io.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    if (!res.socket.server.io) {
        res.socket.server.io = io;
    }
};