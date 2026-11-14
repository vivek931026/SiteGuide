(function () {


    // userData

    const script = document.currentScript;

    const userId = script?.dataset?.userId

    const theme = "dark"

    let assistantConfig = null


    // load CSS

    const link = document.createElement("link")

    link.rel = "stylesheet"

    link.href = "https://siteguide-ulit.onrender.com/assistant.css"

    document.head.appendChild(link)


    // Create PopUp

    const popup = document.createElement("div")

    popup.className = `shifra-popup theme-${theme}`

    popup.innerHTML = `
    <div class="shifra-overlay"></div>

    <div class="shifra-content">

       <div class="shifra-top">
            <div class="shifra-orb-wrap">

                <div class="shifra-orb-glow"></div>

                <div class="shifra-orb"></div>

            </div>

            <h2 class="shifra-title">
                Hello! I'm SiteGuide
            </h2>

            <p class="shifra-sub">
                Your website’s voice guide.
                <br />
                Ask anything about your website.
            </p>


            <div class="shifra-status">
                Ask by voice or text
            </div>

            <div class="shifra-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="shifra-messages" role="log" aria-live="polite" aria-label="Conversation">
            </div>
        </div>


        <div class="shifra-bottom">
            <button class="shifra-mic">
               <img 
               src="https://siteguide-ulit.onrender.com/mic.svg"
               alt="mic"
               class="shifra-mic-icon"/>
            </button>
            <form class="shifra-chat-form">
                <input
                    class="shifra-chat-input"
                    type="text"
                    placeholder="Type a message..."
                    aria-label="Type a message"
                    autocomplete="off"
                />
                <button class="shifra-send" type="submit">Send</button>
            </form>
        </div>
    </div>
    
    `;

    document.body.appendChild(popup);

    // floating Button

    const button = document.createElement("button")

    button.className = `shifra-btn theme-${theme}`

    button.innerHTML = `
    <img 
    src="https://siteguide-ulit.onrender.com/siteguide-mark.svg"
    alt="SiteGuide"
    />`;
    document.body.appendChild(button)




    // toggle popup

    let open = false

    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";
    }


    // load Assistant

    const loadAssistant = async () => {
        try {
            const res = await fetch(`https://shifraserver.onrender.com/api/assistant/config/${userId}`)

            const data = await res.json()

            if (data) {
                assistantConfig = data.user
                applyConfig()
            }

        } catch (error) {
            console.log(
                "Assistant Load Error:",
                error
            );
        }
    }


    const applyConfig = () => {
        if (!assistantConfig) return;

        popup.className = `shifra-popup theme-${assistantConfig.theme}`

        button.className = `shifra-btn theme-${assistantConfig.theme}`

        const title = popup.querySelector(".shifra-title")

        const assistantName = assistantConfig.assistantName === "ShifraAi"
            ? "SiteGuide"
            : assistantConfig.assistantName;
        title.innerHTML = `Hello! I'm ${assistantName}`;

        const subTitle = popup.querySelector(".shifra-sub")
        subTitle.innerHTML = `
    Welcome to
    ${assistantConfig.businessName}.
    <br />
    Your website’s voice guide.
    <br />
    Ask anything about your website.
  `;


    }

    loadAssistant()


    // Element


    const status =
        popup.querySelector(
            ".shifra-status"
        );

    const wave =
        popup.querySelector(
            ".shifra-wave"
        );

    const messages =
        popup.querySelector(".shifra-messages");

    const mic =
        popup.querySelector(
            ".shifra-mic"
        );

    const chatForm = popup.querySelector(".shifra-chat-form");
    const chatInput = popup.querySelector(".shifra-chat-input");
    const sendButton = popup.querySelector(".shifra-send");
    let isSending = false;

    const addMessage = (role, text) => {
        const message = document.createElement("div");
        message.className = `shifra-message shifra-message-${role}`;

        const label = document.createElement("span");
        label.className = "shifra-message-label";
        label.innerText = role === "user" ? "You" : "SiteGuide";

        const content = document.createElement("span");
        content.className = "shifra-message-content";
        content.innerText = text;

        message.append(label, content);
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    };

    // text-speech

    const speak = (text) => {
        window.speechSynthesis.cancel();

        addMessage("assistant", text);

        status.innerText =
            "AI Speaking...";

        const speech = new SpeechSynthesisUtterance(text)

        speech.lang =
            "hi-IN";

        speech.rate = 1;

        speech.pitch = 1;

        speech.volume = 1;

        // Voice end
        speech.onend = () => {

            status.innerText =
                  "Ask by voice or text";

            wave.style.opacity =
                "0";
        };

        // Start speaking
        window.speechSynthesis.speak(
            speech
        );
    }

    const sendMessage = async (message, speakResponse = false) => {
        const text = message.trim();
        if (!text || isSending) return;

        isSending = true;
        sendButton.disabled = true;
        addMessage("user", text);
        status.innerText = "Thinking...";

        try {
            const res = await fetch("https://shifraserver.onrender.com/api/assistant/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: text,
                    userId
                })
            });

            const data = await res.json();

            if (data.success) {
                if (data.action === "navigate") {
                    speak(data.response);

                    setTimeout(() => {
                        window.location.href = data.path;
                    }, 1500);
                } else {
                    const response = data.aiResponse || data.response;
                    if (speakResponse) {
                        speak(response);
                    } else {
                        addMessage("assistant", response);
                        status.innerText = "Ask by voice or text";
                    }
                }
            } else {
                const errorMessage = "Response Error please Check your plan";
                if (speakResponse) {
                    speak(errorMessage);
                } else {
                    addMessage("assistant", errorMessage);
                    status.innerText = "Ask by voice or text";
                }
            }
        } catch (error) {
            console.log(error);
            const errorMessage = "AI Server Error";
            if (speakResponse) {
                speak(errorMessage);
            } else {
                addMessage("assistant", errorMessage);
                status.innerText = "Ask by voice or text";
            }
        } finally {
            isSending = false;
            sendButton.disabled = false;
        }
    };

    chatForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = chatInput.value.trim();
        if (!text || isSending) return;

        chatInput.value = "";
        sendMessage(text);
    });


    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition


    if(SpeechRecognition){

        const recognition = new SpeechRecognition();

        recognition.lang =
      "en-US";

    recognition.continuous =
      false;

    recognition.interimResults =
      false;


      mic.onclick=()=>{
        wave.style.opacity =
        "1";

      status.innerText =
        "Listening...";

      recognition.start();
      }


      recognition.onresult = (e)=>{
        const text = e.results[0][0].transcript

        recognition.stop();
        sendMessage(text, true);
      };

      recognition.onerror = ()=>{
        status.innerText =
          "Ask by voice or text";

        wave.style.opacity =
          "0";
      }


    }
    else{
        status.innerText =
      "Voice unavailable; type below";
    }


})();
