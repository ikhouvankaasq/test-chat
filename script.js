// Chat Application
let userName = '';
let onlineUsers = new Set();
let messageIdCounter = 0;

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
    // Check if name is already set
    const savedName = localStorage.getItem('chatUserName');
    if (savedName) {
        userName = savedName;
        startChat();
    }

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

    // Load previous messages from localStorage
    loadMessages();
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
    localStorage.setItem('chatUserName', userName);
    startChat();
}

function startChat() {
    nameModal.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    displayName.textContent = userName;
    
    // Add user to online users
    addOnlineUser(userName);
    
    // Send join message
    addSystemMessage(`${userName} joined the chat`);
    
    messageInput.focus();
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
    
    addMessage(messageData);
    saveMessage(messageData);
    
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

function updateOnlineCount() {
    onlineCount.textContent = onlineUsers.size;
}

function saveMessage(messageData) {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.push({
        ...messageData,
        time: messageData.time.toISOString()
    });
    
    // Keep only last 100 messages
    if (messages.length > 100) {
        messages.shift();
    }
    
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.forEach(msg => {
        addMessage({
            ...msg,
            time: new Date(msg.time)
        });
    });
}


// Note: For real online chat, you would need a WebSocket server
// Example WebSocket connection code:
/*
const ws = new WebSocket('ws://your-server.com/chat');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        addMessage(data.message);
    } else if (data.type === 'userJoined') {
        addOnlineUser(data.user);
        addSystemMessage(`${data.user} joined the chat`);
    } else if (data.type === 'userLeft') {
        removeOnlineUser(data.user);
        addSystemMessage(`${data.user} left the chat`);
    }
};

function sendMessage() {
    const message = messageInput.value.trim();
    if (message.length === 0) return;
    
    ws.send(JSON.stringify({
        type: 'message',
        text: message,
        author: userName
    }));
    
    messageInput.value = '';
}
*/

