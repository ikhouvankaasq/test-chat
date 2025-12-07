# Simple Chat Application

A Discord-like chat application with real-time messaging using WebSockets. Messages are sent instantly to all online users - no saving, no history, just pure real-time chat!

## Features

- 🎨 Discord-like dark theme UI
- 💬 Real-time messaging between multiple users
- 😀 Emoji picker with 20+ emojis
- 👥 Live online user count
- 📱 Responsive design
- ⚡ No message persistence - messages only exist while users are online

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

1. **Enter your name** when prompted (must be 1-20 characters)
2. Click **"Start Chatting"** or press Enter
3. **Start chatting!** Messages will appear in real-time for all connected users
4. Use the **emoji button (😀)** to add emojis to your messages
5. Press **Enter** or click **Send** to send messages

## Important Notes

- **No Message History**: Messages are NOT saved anywhere - they only exist while users are viewing them
- **Real-time Only**: When you refresh the page, all messages disappear
- **Server Required**: The server must be running for real-time messaging to work
- **Multiple Users**: Open the site on different computers/browsers to chat with others

## For Multiple Computers

To use on different computers on the same network:

1. Find your computer's IP address (e.g., `192.168.1.100`)
   - Windows: Open Command Prompt and type `ipconfig`
   - Mac/Linux: Open Terminal and type `ifconfig` or `ip addr`
2. On the server computer, start the server with `npm start`
3. On other computers, open `http://YOUR_IP_ADDRESS:3000` in their browsers
4. Make sure all computers are on the same network

## Troubleshooting

- **Chat won't open?** Make sure the server is running (`npm start`)
- **Messages not appearing?** Check that the server is running and all users are connected
- **Connection errors?** Verify the server is accessible and firewall isn't blocking port 3000

## Files

- `index.html` - Main HTML structure
- `style.css` - Discord-like dark theme styling
- `script.js` - Client-side JavaScript with Socket.io
- `server.js` - Node.js server with Socket.io (no message storage)
- `package.json` - Dependencies and scripts
