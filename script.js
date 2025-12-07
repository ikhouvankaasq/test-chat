// Chat Application - WebRTC Peer-to-Peer (No Server Required!)
let userName = '';
let onlineUsers = new Set();
let messageIdCounter = 0;
let peerConnections = new Map();
let dataChannels = new Map();
let localPeerConnection = null;
let isRoomCreator = false;
let roomCode = '';
let pendingAnswers = new Map(); // Store answers waiting for connection

// WebRTC Configuration
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// DOM Elements
const nameModal = document.getElementById('nameModal');
const joinRoomModal = document.getElementById('joinRoomModal');
const chatContainer = document.getElementById('chatContainer');
const nameInput = document.getElementById('nameInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const displayName = document.getElementById('displayName');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const onlineCount = document.getElementById('onlineCount');
const emojiElements = document.querySelectorAll('.emoji');
const joinCodeInput = document.getElementById('joinCodeInput');
const connectBtn = document.getElementById('connectBtn');
const cancelJoinBtn = document.getElementById('cancelJoinBtn');
const roomCodeBadge = document.getElementById('roomCodeBadge');
const roomCodeDisplayText = document.getElementById('roomCodeDisplayText');
const connectionCodeModal = document.getElementById('connectionCodeModal');
const connectionCodeInput = document.getElementById('connectionCodeInput');
const copyConnectionCodeBtn = document.getElementById('copyConnectionCodeBtn');
const pasteConnectionCodeSection = document.getElementById('pasteConnectionCodeSection');
const pasteConnectionCodeInput = document.getElementById('pasteConnectionCodeInput');
const processConnectionCodeBtn = document.getElementById('processConnectionCodeBtn');
const closeConnectionCodeBtn = document.getElementById('closeConnectionCodeBtn');
const connectionCodeTitle = document.getElementById('connectionCodeTitle');
const connectionCodeMessage = document.getElementById('connectionCodeMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if elements exist
    if (!createRoomBtn || !joinRoomBtn) {
        console.error('Buttons not found!');
        return;
    }

    // Name input enter key
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                nameInput.blur();
            }
        });
    }

    // Create room button
    createRoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const name = nameInput.value.trim();
        if (name.length < 1) {
            alert('Please enter a name first!');
            return;
        }
        if (name.length > 20) {
            alert('Name must be 20 characters or less!');
            return;
        }
        userName = name;
        createRoom();
    });

    // Join room button
    joinRoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const name = nameInput.value.trim();
        if (name.length < 1) {
            alert('Please enter a name first!');
            return;
        }
        if (name.length > 20) {
            alert('Name must be 20 characters or less!');
            return;
        }
        userName = name;
        showJoinRoom();
    });

    // Connect button
    connectBtn.addEventListener('click', () => {
        const code = joinCodeInput.value.trim();
        if (code.length !== 4) {
            alert('Please enter a 4-digit room code!');
            return;
        }
        joinRoom(code);
    });

    // Join code input - only allow numbers
    joinCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });

    joinCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            connectBtn.click();
        }
    });

    // Cancel join button
    cancelJoinBtn.addEventListener('click', () => {
        joinRoomModal.classList.add('hidden');
        nameModal.classList.remove('hidden');
    });

    // Room code badge click to copy
    roomCodeBadge.addEventListener('click', () => {
        navigator.clipboard.writeText(roomCode).then(() => {
            const originalText = roomCodeBadge.innerHTML;
            roomCodeBadge.innerHTML = 'Copied!';
            setTimeout(() => {
                roomCodeBadge.innerHTML = originalText;
            }, 2000);
        });
    });

    // Copy connection code button
    copyConnectionCodeBtn.addEventListener('click', () => {
        connectionCodeInput.select();
        document.execCommand('copy');
        copyConnectionCodeBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyConnectionCodeBtn.textContent = 'Copy';
        }, 2000);
    });

    // Process connection code button
    processConnectionCodeBtn.addEventListener('click', () => {
        const code = pasteConnectionCodeInput.value.trim();
        if (code.length === 0) {
            alert('Please paste a connection code!');
            return;
        }
        processConnectionCode(code);
    });

    // Close connection code modal
    closeConnectionCodeBtn.addEventListener('click', () => {
        connectionCodeModal.classList.add('hidden');
    });

    // Paste connection code input enter key
    pasteConnectionCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processConnectionCodeBtn.click();
        }
    });

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

    // Check for pending connections periodically
    setInterval(checkForPendingConnections, 2000);
});

function createRoom() {
    // Generate room code
    roomCode = generateRoomCode();
    isRoomCreator = true;
    
    // Create peer connection
    localPeerConnection = new RTCPeerConnection(rtcConfig);
    setupPeerConnection(localPeerConnection, 'local');
    
    // Create data channel
    const dataChannel = localPeerConnection.createDataChannel('chat', {
        ordered: true
    });
    setupDataChannel(dataChannel, 'local');
    
    // Create offer
    localPeerConnection.createOffer()
        .then(offer => {
            return localPeerConnection.setLocalDescription(offer);
        })
        .then(() => {
            // Store offer in localStorage with room code as key
            const offerData = JSON.stringify(localPeerConnection.localDescription);
            localStorage.setItem(`room_offer_${roomCode}`, offerData);
            
            // Show room code in chat
            roomCodeDisplayText.textContent = roomCode;
            roomCodeBadge.classList.remove('hidden');
            
            // Go straight to chat
            nameModal.classList.add('hidden');
            startChat();
            
            // Update URL
            window.history.pushState({}, '', `?room=${roomCode}`);
            
            // Show connection code option in badge (click to show/share)
            roomCodeBadge.title = 'Click to copy room code, or right-click to share connection code';
            roomCodeBadge.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showConnectionCodeExchange('create');
            });
        })
        .catch(error => {
            console.error('Error creating offer:', error);
            alert('Error creating room. Please try again.');
        });
}

function showJoinRoom() {
    nameModal.classList.add('hidden');
    joinRoomModal.classList.remove('hidden');
    joinCodeInput.value = '';
    joinCodeInput.focus();
}

function joinRoom(code) {
    joinRoomModal.classList.add('hidden');
    roomCode = code;
    
    // Check if offer exists in localStorage (same browser)
    const offerData = localStorage.getItem(`room_offer_${code}`);
    
    if (offerData) {
        // Same browser - use localStorage automatically
        try {
            const offer = JSON.parse(offerData);
            
            // Create peer connection
            localPeerConnection = new RTCPeerConnection(rtcConfig);
            setupPeerConnection(localPeerConnection, 'local');
            
            // Set remote description (the offer)
            localPeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => {
                    // Create answer
                    return localPeerConnection.createAnswer();
                })
                .then(answer => {
                    return localPeerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    // Store answer in localStorage
                    const answerData = JSON.stringify(localPeerConnection.localDescription);
                    localStorage.setItem(`room_answer_${code}_${Date.now()}`, answerData);
                    
                    // Start chat
                    startChat();
                })
                .catch(error => {
                    console.error('Error joining room:', error);
                    alert('Error joining room. Please try again.');
                    joinRoomModal.classList.remove('hidden');
                });
        } catch (error) {
            console.error('Error parsing offer:', error);
            alert('Invalid room code. Please try again.');
            joinRoomModal.classList.remove('hidden');
        }
    } else {
        // Different computer - need connection code exchange
        // Show message and generate connection request
        showConnectionCodeExchange('join');
    }
}

function showConnectionCodeExchange(mode) {
    if (mode === 'join') {
        // Joiner: Create connection request
        connectionCodeTitle.textContent = 'Share Connection Code';
        connectionCodeMessage.textContent = 'Share this code with the room creator:';
        pasteConnectionCodeSection.classList.add('hidden');
        
        // Create a connection request code
        const requestCode = btoa(JSON.stringify({
            type: 'request',
            roomCode: roomCode,
            timestamp: Date.now()
        }));
        
        connectionCodeInput.value = requestCode;
        connectionCodeModal.classList.remove('hidden');
        
        // Also show option to paste room creator's connection code
        pasteConnectionCodeSection.classList.remove('hidden');
        connectionCodeMessage.textContent = 'Step 1: Share your code with room creator, OR Step 2: Paste their connection code below:';
    } else if (mode === 'create') {
        // Room creator: Show offer code
        connectionCodeTitle.textContent = 'Share Connection Code';
        connectionCodeMessage.textContent = 'Share this code with people who want to join:';
        pasteConnectionCodeSection.classList.remove('hidden');
        
        if (localPeerConnection && localPeerConnection.localDescription) {
            const offerCode = btoa(JSON.stringify({
                type: 'offer',
                roomCode: roomCode,
                sdp: localPeerConnection.localDescription
            }));
            connectionCodeInput.value = offerCode;
        }
        connectionCodeModal.classList.remove('hidden');
    }
}

function processConnectionCode(code) {
    try {
        const data = JSON.parse(atob(code));
        
        if (data.type === 'request' && isRoomCreator) {
            // Room creator received a join request
            // Send them the offer
            if (localPeerConnection && localPeerConnection.localDescription) {
                const offerCode = btoa(JSON.stringify({
                    type: 'offer',
                    roomCode: roomCode,
                    sdp: localPeerConnection.localDescription
                }));
                
                // Show offer code for them to share back
                connectionCodeInput.value = offerCode;
                connectionCodeMessage.textContent = 'Share this code back with the person who wants to join:';
                pasteConnectionCodeSection.classList.add('hidden');
            }
        } else if (data.type === 'offer' && !isRoomCreator) {
            // Joiner received the offer
            connectionCodeModal.classList.add('hidden');
            
            // Create peer connection
            localPeerConnection = new RTCPeerConnection(rtcConfig);
            setupPeerConnection(localPeerConnection, 'local');
            
            // Set remote description (the offer)
            localPeerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
                .then(() => {
                    // Create answer
                    return localPeerConnection.createAnswer();
                })
                .then(answer => {
                    return localPeerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    // Show answer code to share back
                    const answerCode = btoa(JSON.stringify({
                        type: 'answer',
                        roomCode: roomCode,
                        sdp: localPeerConnection.localDescription
                    }));
                    
                    connectionCodeTitle.textContent = 'Share Answer Code';
                    connectionCodeMessage.textContent = 'Share this code with the room creator:';
                    connectionCodeInput.value = answerCode;
                    pasteConnectionCodeSection.classList.add('hidden');
                    connectionCodeModal.classList.remove('hidden');
                    
                    // Start chat
                    startChat();
                })
                .catch(error => {
                    console.error('Error processing offer:', error);
                    alert('Error processing connection. Please try again.');
                });
        } else if (data.type === 'answer' && isRoomCreator) {
            // Room creator received the answer
            connectionCodeModal.classList.add('hidden');
            
            if (localPeerConnection) {
                localPeerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
                    .then(() => {
                        addSystemMessage('✅ User connected!');
                    })
                    .catch(error => {
                        console.error('Error processing answer:', error);
                        alert('Error processing connection. Please try again.');
                    });
            }
        }
    } catch (error) {
        console.error('Error processing connection code:', error);
        alert('Invalid connection code. Please check and try again.');
    }
}

function checkForPendingConnections() {
    if (!isRoomCreator || !localPeerConnection) return;
    
    // Check for new answers in localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(`room_answer_${roomCode}_`) && !pendingAnswers.has(key)) {
            pendingAnswers.add(key);
            const answerData = localStorage.getItem(key);
            try {
                const answer = JSON.parse(answerData);
                processAnswer(answer, key);
            } catch (error) {
                console.error('Error processing answer:', error);
            }
        }
    });
}

function processAnswer(answer, storageKey) {
    if (!localPeerConnection) return;
    
    localPeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .then(() => {
            // Remove from localStorage
            localStorage.removeItem(storageKey);
            addSystemMessage('✅ New user connected!');
        })
        .catch(error => {
            console.error('Error processing answer:', error);
        });
}

function setupPeerConnection(pc, peerId) {
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            // Store ICE candidates if needed
        }
    };
    
    // Handle connection state
    pc.onconnectionstatechange = () => {
        console.log(`Connection state (${peerId}):`, pc.connectionState);
        if (pc.connectionState === 'connected') {
            addSystemMessage('✅ Connected!');
            updateOnlineCount();
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            addSystemMessage('⚠️ Connection lost');
            removeOnlineUser(peerId);
        }
    };
    
    // Handle incoming data channel (for room creator)
    pc.ondatachannel = (event) => {
        const channel = event.channel;
        setupDataChannel(channel, 'remote');
    };
}

function setupDataChannel(channel, peerId) {
    channel.onopen = () => {
        console.log('Data channel opened:', peerId);
        addSystemMessage('✅ Chat connection established!');
        addOnlineUser(peerId);
        
        // Send user join message
        broadcastMessage({
            type: 'userJoin',
            userName: userName
        });
    };
    
    channel.onclose = () => {
        console.log('Data channel closed:', peerId);
        removeOnlineUser(peerId);
        addSystemMessage('⚠️ Peer disconnected');
    };
    
    channel.onerror = (error) => {
        console.error('Data channel error:', error);
    };
    
    channel.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
                addMessage({
                    id: data.id || messageIdCounter++,
                    author: data.author,
                    text: data.text,
                    time: new Date(data.time)
                });
            } else if (data.type === 'userJoin') {
                addOnlineUser(data.userName);
                if (data.userName !== userName) {
                    addSystemMessage(`${data.userName} joined the chat`);
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
    
    dataChannels.set(peerId, channel);
}

function startChat() {
    chatContainer.classList.remove('hidden');
    displayName.textContent = userName;
    addOnlineUser(userName);
    
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
    
    // Display message immediately
    addMessage(messageData);
    
    // Broadcast to all peers
    broadcastMessage({
        type: 'message',
        ...messageData,
        time: messageData.time.toISOString()
    });
    
    messageInput.value = '';
    messageInput.focus();
}

function broadcastMessage(data) {
    const message = JSON.stringify(data);
    dataChannels.forEach((channel, peerId) => {
        if (channel.readyState === 'open') {
            channel.send(message);
        }
    });
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

function generateRoomCode() {
    // Generate a 4-digit number (1000-9999)
    return Math.floor(1000 + Math.random() * 9000).toString();
}
