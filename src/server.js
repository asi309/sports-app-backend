const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const routes = require('./routes');

const app = express();
const server = http.Server(app);
const io = socketio(server);

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

try {
    mongoose.connect(process.env.MONGO_DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('MongoDB connected');
} catch (e) {
    console.log(e);
}

const connectedUsers = {};

io.on('connection', socket => {
    const { user } = socket.handshake.query;

    connectedUsers[user] = socket.id;
})

app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;
    
    return next();
});
app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.join(__dirname, '..', 'files')));
app.use(routes);

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});