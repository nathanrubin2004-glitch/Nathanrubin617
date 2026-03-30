// Chat Widget Logic
const chatBubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');
const chatChips = document.getElementById('chat-chips');

let conversationHistory = [];

chatBubble.addEventListener('click', () => {
    if (chatWindow.classList.contains('active')) {
        chatWindow.classList.remove('active');
    } else {
        chatWindow.classList.add('active');
        chatInput.focus();
        if (conversationHistory.length === 0) {
            addAssistantMessage("Hi! \ud83d\udc4b I'm Nathan's AI assistant. Ask me about his book, basketball career, or anything else!");
        }
    }
});

chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
});

if (chatChips) {
    chatChips.querySelectorAll('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.dataset.question;
            chatChips.style.display = 'none';
            chatInput.value = question;
            sendMessage();
        });
    });
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message message-user';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAssistantMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message message-assistant';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message message-assistant';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    if (chatChips) chatChips.style.display = 'none';

    chatSend.disabled = true;
    chatInput.disabled = true;

    addUserMessage(message);
    conversationHistory.push({ role: 'user', content: message });

    chatInput.value = '';

    showTypingIndicator();

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversationHistory })
        });

        removeTypingIndicator();

        if (!response.ok) {
            addAssistantMessage("Something went wrong \u2014 try again");
            return;
        }

        const data = await response.json();
        const assistantMessage = data.reply;

        addAssistantMessage(assistantMessage);
        conversationHistory.push({ role: 'assistant', content: assistantMessage });

    } catch (error) {
        removeTypingIndicator();
        addAssistantMessage("Something went wrong \u2014 try again");
    } finally {
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}
