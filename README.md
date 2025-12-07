# Simple Chat Application

A Discord-like chat application with real-time messaging using WebSockets.

## Features

- 🎨 Discord-like dark theme UI
- 💬 Real-time messaging between multiple users
- 😀 Emoji picker
- 👥 Online user count
- 📱 Responsive design

## Setup Instructions

### 1. Install Dependencies

Make sure you have Node.js installed, then run:

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Open in Browser

Open `http://localhost:3000` in your browser (or multiple browsers/computers to test with multiple users).

## How to Use

1. Enter your name when prompted
2. Start chatting! Messages will appear in real-time for all connected users
3. Use the emoji button (😀) to add emojis to your messages
4. Press Enter or click Send to send messages

## For Multiple Computers

To use on different computers on the same network:

1. Find your computer's IP address (e.g., `192.168.1.100`)
2. On the server computer, start the server
3. On other computers, open `http://YOUR_IP_ADDRESS:3000` in their browsers

## Files

- `index.html` - Main HTML structure
- `style.css` - Discord-like styling
- `script.js` - Client-side JavaScript with Socket.io
- `server.js` - Node.js server with Socket.io
- `package.json` - Dependencies and scripts

