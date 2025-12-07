# Simple Chat Application - Peer-to-Peer (No Server!)

A Discord-like chat application with real-time messaging using WebRTC peer-to-peer connections. **No server required!** Just open the HTML file and connect directly to other users.

## Features

- 🎨 Discord-like dark theme UI
- 💬 Real-time peer-to-peer messaging (no server needed!)
- 😀 Emoji picker with 20+ emojis
- 👥 Live online user count
- 📱 Responsive design
- ⚡ No message persistence - messages only exist while users are online
- 🔒 Direct connection between users (WebRTC)

## How It Works

This chat uses **WebRTC** (Web Real-Time Communication) to create direct peer-to-peer connections between users. No server is needed - users connect directly to each other!

## Setup Instructions

### No Installation Required!

1. **Just open `index.html`** in your web browser
2. That's it! No server, no npm install, nothing!

## How to Use

### Creating a Room (Room Creator):

1. Enter your name
2. Click **"Create Room"**
3. Copy the room code that appears
4. Share the code with others who want to join
5. Wait for them to send you an "answer code"
6. Paste their answer code in the input field and click "Connect"
7. Start chatting!

### Joining a Room:

1. Enter your name
2. Click **"Join Room"**
3. Enter the room code shared by the room creator
4. Click **"Connect"**
5. Copy the answer code that appears
6. Share the answer code back with the room creator
7. Once they connect, you can start chatting!

## Important Notes

- **No Server Required**: This works entirely in your browser using WebRTC
- **Direct Connection**: Users connect directly to each other (peer-to-peer)
- **No Message History**: Messages are NOT saved - they only exist while users are viewing them
- **Real-time Only**: When you refresh the page, all messages disappear
- **Internet Required**: WebRTC uses free STUN servers (Google's public servers) to establish connections
- **Works Across Networks**: Users on different networks can connect (as long as they can reach the STUN servers)

## Connection Flow

1. **User A** creates a room → gets an "offer code"
2. **User A** shares the offer code with **User B**
3. **User B** enters the offer code → gets an "answer code"
4. **User B** shares the answer code with **User A**
5. **User A** pastes the answer code → connection established!
6. Both users can now chat in real-time!

## Troubleshooting

- **Can't connect?** Make sure you're sharing the complete code (it's long and contains special characters)
- **Connection fails?** Check your internet connection (needed for STUN servers)
- **Firewall issues?** Some firewalls may block WebRTC connections
- **Not working on mobile?** Some mobile browsers have limited WebRTC support

## Technical Details

- Uses **WebRTC DataChannels** for peer-to-peer messaging
- Uses **Google's free STUN servers** for NAT traversal
- **No backend server** - everything runs in the browser
- Messages are sent directly between users' browsers

## Files

- `index.html` - Main HTML structure (just open this file!)
- `style.css` - Discord-like dark theme styling
- `script.js` - WebRTC peer-to-peer implementation
- `README.md` - This file

## Browser Support

Works best in modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (may have limitations)
- ⚠️ Older browsers may not support WebRTC

---

**That's it!** No server, no installation, just open and chat! 🚀
