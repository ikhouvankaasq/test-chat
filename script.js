// Chat Application
let userName = '';
let onlineUsers = new Set();
let messageIdCounter = 0;
let socket = null;

// DOM Elements
const nameModal = document.getElementById('nameModal');
const chatContainer = document.getElementById('chatContainer');
const nameInput = document.getElementById('nameInput');
const startChatBtn = document.getElementById('startChatBtn');
const displayName = document.getElementById('displayName');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const onlineCount = document.getElementById('onlineCount');
const emojiElements = document.querySelectorAll('.emoji');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Connect to Socket.io server (with error handling)
    try {
        socket = io({
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
        
        // Socket.io event listeners
        setupSocketListeners();
    } catch (error) {
        console.error('Socket connection error:', error);
        // Chat will still work, just won't connect to server
    }

    // No saved state - user must enter name each time

    // Name input enter key
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startChatting();
        }
    });

    // Start chat button
    startChatBtn.addEventListener('click', startChatting);

    // Message input enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button
    sendBtn.addEventListener('click', sendMessage);

    // Emoji picker toggle
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('show');
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.classList.remove('show');
        }
    });

    // Emoji selection
    emojiElements.forEach(emoji => {
        emoji.addEventListener('click', () => {
            messageInput.value += emoji.textContent;
            messageInput.focus();
            emojiPicker.classList.remove('show');
        });
    });
});

function startChatting() {
    const name = nameInput.value.trim();
    if (name.length < 1) {
        alert('Please enter a name!');
        return;
    }
    if (name.length > 20) {
        alert('Name must be 20 characters or less!');
        return;
    }
    
    userName = name;
    startChat();
}

function startChat() {
    nameModal.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    displayName.textContent = userName;
    
    // Add current user to online users
    addOnlineUser(userName);
    
    // Notify server that user joined (if connected)
    if (socket && socket.connected) {
        socket.emit('userJoin', userName);
    } else if (socket) {
        // If socket exists but not connected, try to emit when connected
        socket.once('connect', () => {
            socket.emit('userJoin', userName);
        });
    }
    
    messageInput.focus();
}

function setupSocketListeners() {
    if (!socket) return;

    // Listen for messages from other users
    socket.on('message', (data) => {
        addMessage({
            id: data.id || messageIdCounter++,
            author: data.author,
            text: data.text,
            time: new Date(data.time)
        });
    });

    // Listen for user join events
    socket.on('userJoined', (data) => {
        addOnlineUser(data.userName);
        updateOnlineCount(data.onlineCount);
        if (data.userName !== userName) {
            addSystemMessage(`${data.userName} joined the chat`);
        }
    });

    // Listen for user leave events
    socket.on('userLeft', (data) => {
        removeOnlineUser(data.userName);
        updateOnlineCount(data.onlineCount);
        addSystemMessage(`${data.userName} left the chat`);
    });

    // Receive list of current users when connecting
    socket.on('currentUsers', (users) => {
        onlineUsers.clear();
        users.forEach(user => {
            if (user !== userName) {
                addOnlineUser(user);
            }
        });
        updateOnlineCount(users.length);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        // Only show error if chat is already open
        if (userName) {
            addSystemMessage('⚠️ Connection error. Trying to reconnect...');
        }
    });

    socket.on('connect', () => {
        console.log('Connected to server');
        if (userName) {
            socket.emit('userJoin', userName);
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        if (userName) {
            addSystemMessage('⚠️ Disconnected from server. Reconnecting...');
        }
    });
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message.length === 0) return;
    
    const messageData = {
        id: messageIdCounter++,
        author: userName,
        text: message,
        time: new Date()
    };
    
    // Display message immediately (optimistic update)
    addMessage(messageData);
    
    // Send message to server (if connected)
    if (socket && socket.connected) {
        socket.emit('message', messageData);
    } else {
        addSystemMessage('⚠️ Not connected to server. Message not sent to others.');
    }
    
    messageInput.value = '';
    messageInput.focus();
}

function addMessage(messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = messageData.id;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = getAvatarEmoji(messageData.author);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = messageData.author;
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(messageData.time);
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = messageData.text;
    
    header.appendChild(author);
    header.appendChild(time);
    content.appendChild(header);
    content.appendChild(text);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.style.opacity = '0.6';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.style.fontStyle = 'italic';
    textEl.textContent = text;
    
    content.appendChild(textEl);
    messageDiv.appendChild(content);
    
    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function getAvatarEmoji(name) {
    const emojis = ['👤', '😀', '😎', '🤖', '👨', '👩', '🧑', '🎮', '🚀', '⭐'];
    const index = name.charCodeAt(0) % emojis.length;
    return emojis[index];
}

function formatTime(date) {
    const now = new Date(date);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addOnlineUser(name) {
    onlineUsers.add(name);
    updateOnlineCount();
}

function removeOnlineUser(name) {
    onlineUsers.delete(name);
    updateOnlineCount();
}

function updateOnlineCount(count) {
    if (count !== undefined) {
        onlineCount.textContent = count;
    } else {
        onlineCount.textContent = onlineUsers.size;
    }
}


