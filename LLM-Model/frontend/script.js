async function sendMessage() {

    const inputField = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const userMessage = inputField.value;

    if (userMessage.trim() === "") {
        return;
    }

    // Show User Message
    chatBox.innerHTML += `
        <div class="message user">
            ${userMessage}
        </div>
    `;

    inputField.value = "";

    // Send Request to FastAPI
    const response = await fetch("http://127.0.0.1:8000/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: userMessage
        })
    });

    const data = await response.json();

    // Show Bot Response
    chatBox.innerHTML += `
        <div class="message bot">
            ${data.response}
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
}