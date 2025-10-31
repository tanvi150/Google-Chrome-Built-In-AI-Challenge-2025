import { handleUserMessage, initAuriSession } from './chatbot-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const messages = document.getElementById('messages');

    function addMessage(sender, text) {
        const div = document.createElement('div');

        const avatar = document.createElement('img');
        avatar.classList.add('message-avatar');
        avatar.src = sender === "You" ? 'assets/user.png' : 'assets/bot.png';

        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = text;

        div.appendChild(avatar);
        div.appendChild(bubble);
        div.classList.add(sender === "You" ? 'user' : 'bot');

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    async function firstGestureInit() {
        if (!window.sessionInitialized) {
            addMessage("Bot", "Initializing Auri, please wait...");
            const sess = await initAuriSession();
            if (sess) {
                const greeting = await handleUserMessage("__init__");
                addMessage("Bot", greeting);
                window.sessionInitialized = true;
                console.log("Auri initialization complete.");
            } else {
                addMessage("Bot", "Failed to initialize Auri. Please try again.");
            }
        }
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage("You", text);
        userInput.value = "";

        const botReply = await handleUserMessage(text);
        addMessage("Bot", botReply);
    }

    // Send button
    sendBtn.addEventListener('click', async (e) => {
        await firstGestureInit();
        if (window.sessionInitialized) sendMessage();
    });

    // Enter key
    userInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            await firstGestureInit();
            if (window.sessionInitialized) sendMessage();
        }
    });

    const uploadBtn = document.getElementById('uploadBtn');

    uploadBtn.addEventListener('click', () => {
        // Open file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Store image in localStorage as mock
            const reader = new FileReader();
            reader.onload = function () {
                localStorage.setItem('uploadedOutfit', reader.result);

                // Add a chat message to acknowledge the image
                addMessage("You", "Uploaded an outfit image.");
                addMessage("Bot", "Thanks! I've noted your outfit. If connected to the full AI model, I could analyze it for color palette, fit, and styling tips.");
            };
            reader.readAsDataURL(file);
        };

        input.click();
    });

    // --- Mic / Speech-to-Text for extension popup ---
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        let listeningMessageDiv = null;

        recognition.addEventListener('start', () => {
            listeningMessageDiv = document.createElement('div');
            listeningMessageDiv.classList.add('user');
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            bubble.textContent = "🎙️ Listening...";
            listeningMessageDiv.appendChild(bubble);
            messages.appendChild(listeningMessageDiv);
            messages.scrollTop = messages.scrollHeight;
        });

        recognition.addEventListener('result', async (e) => {
            const speechText = e.results[0][0].transcript;

            if (listeningMessageDiv && messages.contains(listeningMessageDiv)) {
                messages.removeChild(listeningMessageDiv);
                listeningMessageDiv = null;
            }

            await firstGestureInit();
            if (window.sessionInitialized) {
                addMessage("You", speechText);
                const botReply = await handleUserMessage(speechText);
                addMessage("Bot", botReply);
            }
        });

        recognition.addEventListener('end', () => {
            if (listeningMessageDiv && messages.contains(listeningMessageDiv)) {
                messages.removeChild(listeningMessageDiv);
                listeningMessageDiv = null;
            }
        });

        async function startMic() {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                recognition.start();
            } catch (err) {
                alert("Microphone currently unavailable. This might happen in Chrome Extension popups — you can still chat using text!");
                console.error(err);
            }
        }

        micBtn.addEventListener('click', startMic);

    } else {
        micBtn.disabled = true;
        micBtn.title = "Speech recognition not supported in this browser.";
    }

});
