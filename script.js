let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyABDZvw4jE5-JSaU9g-INbdDpokMGr259I";

// DOM elements for occasion selection
const welcomeMessage = document.querySelector(".ai-chat-area");
const selectedOccasionEl = document.createElement("div");
selectedOccasionEl.classList.add("selected-occasion");
document.body.insertBefore(selectedOccasionEl, chatContainer);

// Create home screen for occasion selection
const homeScreen = document.createElement("div");
homeScreen.classList.add("home-screen", "hidden");
homeScreen.innerHTML = `
    <div class="occasion-container">
        <h2>Choose Your Fashion Mode</h2>
        <div class="occasion-buttons">
            <button onclick="selectOption('Festival')">Festival</button>
            <button onclick="selectOption('Normal Day')">Normal Day</button>
            <button onclick="selectOption('Weekend')">Weekend</button>
            <button onclick="selectOption('Party')">Party</button>
            <button onclick="selectOption('Wedding')">Wedding</button>
            <button onclick="selectOption('Casual')">Casual</button>
        </div>
    </div>
`;
document.body.insertBefore(homeScreen, chatContainer);

// Add occasion change button
const changeOccasionBtn = document.createElement("button");
changeOccasionBtn.textContent = "Change Mode";
changeOccasionBtn.classList.add("change-occasion");
changeOccasionBtn.addEventListener("click", showHomeScreen);
document.querySelector(".prompt-area").appendChild(changeOccasionBtn);

let user = {
    message: null,
    occasion: localStorage.getItem('selectedOccasion') || "Normal Day",
    file: {
        mime_type: null,
        data: null
    }
};

// Set welcome message based on occasion
function setWelcomeMessage() {
    const messages = {
        "Festival": "Welcome! Ready for festival fashion? I can suggest outfits perfect for comfort and style at any festival. Upload a photo of your current wardrobe items or ask for suggestions based on the festival type.",
        "Normal Day": "Looking good on a normal day is important too! I can help with outfit ideas that are comfortable yet put-together for work, errands, or whatever your day holds.",
        "Weekend": "Weekend vibes! Whether you're relaxing or going out, I can suggest casual, comfortable outfits or something special for weekend activities.",
        "Party": "Let's get party-ready! Tell me about the party type (casual, formal, themed) and I'll help you create the perfect look to stand out.",
        "Wedding": "Wedding guest fashion can be tricky! Share details about the venue, time of day, and dress code, and I'll help you find appropriate outfit ideas.",
        "Casual": "Casual doesn't mean boring! I can suggest stylish yet comfortable outfits perfect for casual occasions. What's your personal style preference?"
    };
    
    welcomeMessage.innerHTML = messages[user.occasion] || "Hello! How can I help with your wardrobe today?";
}

// Update occasion display
function updateOccasionDisplay() {
    selectedOccasionEl.textContent = `Current Mode: ${user.occasion}`;
}

// Show home screen
function showHomeScreen() {
    homeScreen.classList.remove('hidden');
}

// Hide home screen
function hideHomeScreen() {
    homeScreen.classList.add('hidden');
}

// Select option function
function selectOption(option) {
    user.occasion = option;
    localStorage.setItem('selectedOccasion', option);
    hideHomeScreen();
    updateOccasionDisplay();
    setWelcomeMessage();
}

// Function to get occasion-specific tips
function getOccasionTip(occasion) {
    const tips = {
        "Festival": "Remember to layer pieces for changing weather and choose comfortable footwear that can handle rough terrain!",
        "Normal Day": "Outfit versatility is key for moving between different settings throughout your day.",
        "Weekend": "Don't be afraid to experiment more with your weekend style than you would during the work week.",
        "Party": "Consider the venue lighting when choosing colors and textures - some fabrics catch light beautifully!",
        "Wedding": "Always have a lightweight layer for air-conditioned venues or evening temperature drops.",
        "Casual": "Even casual outfits can look put-together with the right accessories and a good fit."
    };
    
    return tips[occasion] || "Focus on wearing what makes you feel confident!";
}

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    
    // Create context for AI based on selected occasion
    const occasionContext = {
        "Festival": "You are a fashion advisor specialized in festival outfits. Focus on comfort, style, weather protection, and practicality while maintaining the festive vibe.",
        "Normal Day": "You are a fashion advisor for everyday casual and work wear. Focus on comfort, practicality, and appropriate style for normal day activities.",
        "Weekend": "You are a fashion advisor for weekend outfits. Focus on relaxed, casual styles with options for both day activities and evening outings.",
        "Party": "You are a fashion advisor for party outfits. Focus on statement pieces, current trends, and appropriate styles for different types of parties.",
        "Wedding": "You are a fashion advisor for wedding guest attire. Focus on appropriate formality, colors, and styles for different wedding venues and times.",
        "Casual": "You are a fashion advisor for casual wear. Focus on comfortable yet stylish options that work for informal settings."
    };

    const formattingInstruction = "Format your response in HTML with <br> tags to create line breaks between different suggestions and within longer descriptions for better readability.";

    // Combine context with user message and formatting instruction
    const contextPrompt = user.occasion ? 
        `${occasionContext[user.occasion]} ${formattingInstruction}\n\nUser request: ${user.message}` : 
        `${formattingInstruction}\n\nUser request: ${user.message}`;

    let RequestOption = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        {text: contextPrompt},
                        ...(user.file.data ? [{inline_data: user.file}] : [])
                    ]
                }
            ]
        })
    };
    
    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .trim();
        
        if (user.file.data && user.occasion) {
            apiResponse += `\n\n<em>Fashion tip for ${user.occasion}:</em> ` + getOccasionTip(user.occasion);
        }

        text.innerHTML = apiResponse;
    }
    catch(error) {
        console.log(error);
        text.innerHTML = "Sorry, I couldn't process your request. Please try again.";
    }
    finally {
        chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {
            mime_type: null,
            data: null
        };
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;
    let html = `<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`;
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="10%">
        <div class="ai-chat-area">
        <img src="loading.webp" alt="" class="load" width="50px">
        </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});

// Initialize
updateOccasionDisplay();
setWelcomeMessage();
