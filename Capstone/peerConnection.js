const peer = new Peer({
    secure: true, // Use WSS (WebSocket Secure) since the cloud server uses HTTPS
    debug: 3,     // Keep debug level for verbose logging
});

peer.on("open", (id) => {
    console.log("[PEERJS] Your Peer ID:", id);
    document.getElementById("peerID").textContent = `Your Peer ID: ${id}`;
    logStatus(`Your Peer ID: ${id}`);
});

let conn = null;

document.getElementById("connectButton").addEventListener("click", async function () {
    const remotePeerID = document.getElementById("remotePeerInput").value.trim();
    
    if (!remotePeerID) {
        alert("Enter a valid Peer ID.");
        logStatus("⚠️ No Peer ID entered for connection.");
        return;
    }

    // Ensure keys are generated before attempting to connect
    const publicKeyString = localStorage.getItem("publicKey");
    if (!publicKeyString) {
        alert("Keys not generated. Please wait...");
        return;
    }

    console.log(`[PEERJS] Attempting to connect to ${remotePeerID}...`);
    logStatus(`🔄 Connecting to ${remotePeerID}...`);

    conn = peer.connect(remotePeerID);

    conn.on("open", () => {
        console.log(`[PEERJS] Connected to peer: ${remotePeerID}`);
        document.getElementById("peerID").textContent += " ✅ Connected!";
        logStatus(`✅ Successfully connected to ${remotePeerID}!`);
        alert("Connection Established!");

        // Send the public key after connection is successful
        const publicKeyString = localStorage.getItem("publicKey");
        conn.send({ type: 'publicKey', publicKey: publicKeyString });

        // Log your public key
        logPublicKeys();
    });

    conn.on("data", (data) => {
        if (data.type === 'publicKey') {
            const otherPeerPublicKey = data.publicKey;
            logStatus(`📥 Received other peer’s public key: ${otherPeerPublicKey}`);
        }

        // Handle encrypted message
        receiveEncryptedMessage(data);
    });

    conn.on("close", () => {
        console.log("[PEERJS] Connection closed.");
        logStatus("❌ Connection closed.");
    });

    conn.on("error", (err) => {
        console.error("[PEERJS ERROR] Connection error:", err);
        alert("Connection failed. Ensure the other peer is online.");
        logStatus(`⚠️ Connection error: ${err.message}`);
    });
});

// Listen for incoming connections
peer.on("connection", (incomingConn) => {
    console.log("[PEERJS] Incoming connection detected!");
    logStatus("🔗 Peer is trying to connect...");

    conn = incomingConn;

    conn.on("open", () => {
        console.log("[PEERJS] Peer successfully connected!");
        document.getElementById("peerID").textContent += " ✅ Connected!";
        alert("Peer connected successfully!");
        logStatus("✅ Peer successfully connected!");

        // Send the public key after connection is successful
        const publicKeyString = localStorage.getItem("publicKey");
        conn.send({ type: 'publicKey', publicKey: publicKeyString });

        // Log your public key
        logPublicKeys();
    });

    conn.on("data", (data) => {
        if (data.type === 'publicKey') {
            const otherPeerPublicKey = data.publicKey;
            logStatus(`📥 Received other peer’s public key: ${otherPeerPublicKey}`);
        }

        // Handle encrypted message
        receiveEncryptedMessage(data);
    });

    conn.on("close", () => {
        console.log("[PEERJS] Peer disconnected.");
        logStatus("❌ Peer disconnected.");
    });

    conn.on("error", (err) => {
        console.error("[PEERJS ERROR] Peer connection error:", err);
        logStatus(`⚠️ Peer connection error: ${err.message}`);
    });
});

document.getElementById("sendMessageButton").addEventListener("click", async function () {
    if (!conn || conn.open === false) {
        alert("Not connected to a peer! Ensure you are connected before sending messages.");
        logStatus("⚠️ Attempted to send message, but no active connection.");
        return;
    }

    const message = document.getElementById("messageToSend").value;
    const publicKeyString = localStorage.getItem("publicKey");

    if (!message) {
        alert("Enter a message to send.");
        logStatus("⚠️ No message entered.");
        return;
    }

    try {
        console.log(`[ENCRYPTION] Encrypting message: "${message}"`);
        const encryptedMessage = await encryptMessage(message, publicKeyString);
        console.log("[PEERJS] Sending encrypted message:", encryptedMessage);

        // Send the encrypted message to the peer
        conn.send(encryptedMessage);

        // Display the sent message in the chat
        displayMessage(message, "sent");

        logStatus(`📤 Sent encrypted message: ${encryptedMessage}`);

        // Clear input field after sending
        document.getElementById("messageToSend").value = "";
    } catch (error) {
        console.error("[ENCRYPTION ERROR] Failed to encrypt/send message:", error);
        alert("Failed to send encrypted message.");
        logStatus(`❌ Encryption error: ${error.message}`);
    }
});

async function receiveEncryptedMessage(encryptedMessage) {
    console.log("[PEERJS] Received Encrypted Message:", encryptedMessage);
    logStatus("📩 Received encrypted message!");

    const privateKeyString = localStorage.getItem("privateKey");
    if (!privateKeyString) {
        console.error("[DECRYPTION ERROR] Private key missing!");
        logStatus("⚠️ Private key missing! Cannot decrypt message.");
        return;
    }

    try {
        console.log("[DECRYPTION] Attempting to decrypt message...");
        const decryptedMessage = await decryptMessage(encryptedMessage, privateKeyString);
        console.log("[DECRYPTION] Decrypted message:", decryptedMessage);

        // Display the received message in the chat
        displayMessage(decryptedMessage, "received");

        logStatus(`💬 Decrypted message received: "${decryptedMessage}"`);
    } catch (error) {
        console.error("[DECRYPTION ERROR] Failed to decrypt message:", error);
        logStatus(`❌ Decryption error: ${error.message}`);
    }
}

// Logs public keys to the debugging log
function logPublicKeys() {
    const publicKeyString = localStorage.getItem("publicKey");
    logStatus(`📤 Your Public Key: ${publicKeyString}`);

    // Assuming the public key of the other peer is already received and stored
    if (conn && conn.peer) {
        logStatus(`📥 Other Peer’s Public Key: ${conn.peer}`);
    } else {
        logStatus("⚠️ Unable to retrieve the other peer's public key.");
    }
}

// Logs status updates to the UI
function logStatus(message) {
    const logDiv = document.getElementById("logStatus");
    const newLog = document.createElement("p");
    newLog.textContent = message;
    logDiv.appendChild(newLog);
    console.log("[STATUS] " + message);
}

function displayMessage(message, type) {
    const messageContainer = document.getElementById("incomingMessages");
    const messageBubble = document.createElement("div");

    messageBubble.classList.add("message", type);
    messageBubble.textContent = message;

    messageContainer.appendChild(messageBubble);

    // Auto-scroll to the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
