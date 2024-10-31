require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // 导入 Message 模型

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5x4eq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// API 路由，用于获取所有消息
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 'asc' }); // 按时间排序
        res.json(messages); // 返回消息数据
    } catch (err) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// 处理 Socket.IO 连接
io.on('connection', (socket) => {
    console.log('A user connected');

    // 在用户连接时加载历史消息
    Message.find().sort({ createdAt: 'asc' }).then(messages => {
        socket.emit('load messages', messages); // 发送历史消息到客户端
    });

    // 监听客户端发送的消息
    socket.on('chat message', async (msg) => {
        console.log('Message received: ' + msg);

        // 保存消息到数据库
        const message = new Message({ content: msg });
        await message.save();

        // 广播消息到所有客户端
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});