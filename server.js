const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining
    socket.on('userJoin', (userName) => {
        users.set(socket.id, userName);
        socket.userName = userName;
        
        // Broadcast to all clients that a user joined
        io.emit('userJoined', {
            userName: userName,
            onlineCount: users.size
        });
        
        // Send list of current users to the new user
        socket.emit('currentUsers', Array.from(users.values()));
        
        console.log(`${userName} joined. Total users: ${users.size}`);
    });

    // Handle incoming messages
    socket.on('message', (data) => {
        // Broadcast message to all connected clients
        io.emit('message', {
            id: data.id,
            author: data.author,
            text: data.text,
            time: data.time
        });
        
        console.log(`Message from ${data.author}: ${data.text}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const userName = users.get(socket.id);
        if (userName) {
            users.delete(socket.id);
            
            // Broadcast to all clients that a user left
            io.emit('userLeft', {
                userName: userName,
                onlineCount: users.size
            });
            
            console.log(`${userName} left. Total users: ${users.size}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat server running on http://localhost:${PORT}`);
});

