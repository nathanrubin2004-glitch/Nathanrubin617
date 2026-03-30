// Chat Widget Logic
const chatBubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

let conversationHistory = [];

const STARTER_CHIPS = [
    "Tell me about Nathan's book",
    "What's Nathan's basketball story?",
    "How can I contact Nathan?"
];

function addStarterChips() {
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'starter-chips';
    chipsContainer.id = 'starter-chips';
    STARTER_CHIPS.forEach(text => {
        const chip = document.createElement('button');
        chip.className = 'starter-chip';
        chip.textContent = text;
        chip.addEventListener('click', () => {
            removeStarterChips();
            chatInput.value = text;
            sendMessage();
        });
        chipsContainer.appendChild(chip);
    });
    chatMessages.appendChild(chipsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeStarterChips() {
    const chips = document.getElementById('starter-chips');
    if (chips) chips.remove();
}

chatBubble.addEventListener('click', () => {
    if (chatWindow.classList.contains('active')) {
        chatWindow.classList.remove('active');
        chatWindow.classList.add('closing');
        chatWindow.addEventListener('animationend', () => {
            chatWindow.classList.remove('closing');
        }, { once: true });
    } else {
        chatWindow.classList.add('active');
        chatInput.focus();
        if (conversationHistory.length === 0) {
            addAssistantMessage("Hi! \ud83d\udc4b I'm Nathan's AI assistant. Ask me about his book, basketball career, or anything else!");
            addStarterChips();
        }
    }
});

chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
    chatWindow.classList.add('closing');
    chatWindow.addEventListener('animationend', () => {
        chatWindow.classList.remove('closing');
    }, { once: true });
});

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

    removeStarterChips();

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
