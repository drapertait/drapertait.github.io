const peer = new Peer({
    secure: true, // Using WSS (WebSocket Secure)
    debug: 3,     // Verbose logging for peer connection
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

    const publicKeyString = localStorage.getItem("publicKey");
    const privateKeyString = localStorage.getItem("privateKey");

    if (!publicKeyString || !privateKeyString) {
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

        logKeys(publicKeyString, privateKeyString);

        // Send the public key to the other peer
        conn.send({ type: 'publicKey', publicKey: publicKeyString });
    });

    conn.on("data", async (data) => {
        console.log("[PEERJS] Received data:", data);
        try {
            // If we receive a public key from the other peer
            if (data.type === 'publicKey') {
                const otherPeerPublicKey = data.publicKey;
                localStorage.setItem("otherPeerPublicKey", otherPeerPublicKey); // Store the other peer's public key
                logStatus(`📥 Received other peer’s public key: ${otherPeerPublicKey}`);
                console.log("[PEERJS] Other peer's public key:", otherPeerPublicKey);

                // Send an encrypted "hi" message to the peer after receiving their public key
                await sendEncryptedMessage("hi", otherPeerPublicKey, remotePeerID);
            }

            if (data.encryptedMessage) {
                console.log("[PEERJS] Encrypted message received:", data.encryptedMessage);
                logStatus(`🔒 Received encrypted message: ${data.encryptedMessage}`);
                await receiveEncryptedMessage(data.encryptedMessage);
            }
        } catch (error) {
            console.error("[ERROR] Error processing received message:", error);
            logStatus(`⚠️ Error processing received message: ${error.message}`);
        }
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

        const publicKeyString = localStorage.getItem("publicKey");
        const privateKeyString = localStorage.getItem("privateKey");
        logKeys(publicKeyString, privateKeyString);

        // Send the public key to the other peer
        conn.send({ type: 'publicKey', publicKey: publicKeyString });
    });

    conn.on("data", async (data) => {
        console.log("[PEERJS] Data received:", data);
        try {
            // If we receive a public key from the other peer
            if (data.type === 'publicKey') {
                const otherPeerPublicKey = data.publicKey;
                localStorage.setItem("otherPeerPublicKey", otherPeerPublicKey); // Store the other peer's public key
                logStatus(`📥 Received other peer’s public key: ${otherPeerPublicKey}`);
                console.log("[PEERJS] Other peer's public key:", otherPeerPublicKey);

                // Send an encrypted "hi" message to the peer
                await sendEncryptedMessage("hi", otherPeerPublicKey, conn.peer);
            }

            if (data.encryptedMessage) {
                console.log("[PEERJS] Encrypted message received:", data.encryptedMessage);
                logStatus(`🔒 Received encrypted message: ${data.encryptedMessage}`);
                await receiveEncryptedMessage(data.encryptedMessage);
            }
        } catch (error) {
            console.error("[ERROR] Error processing received message:", error);
            logStatus(`⚠️ Error processing received message: ${error.message}`);
        }
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

// NEW: Event listener for the "Send Message" button
document.getElementById("sendMessageButton").addEventListener("click", async function () {
    const message = document.getElementById("messageToSend").value.trim();
    const otherPeerPublicKey = localStorage.getItem("otherPeerPublicKey");
    const remotePeerID = conn ? conn.peer : null;

    if (!message) {
        alert("Please enter a message to send.");
        logStatus("⚠️ No message entered.");
        return;
    }

    if (!otherPeerPublicKey) {
        alert("No public key received from the other peer. Ensure you are connected.");
        logStatus("⚠️ Other peer's public key not available.");
        return;
    }

    if (!conn || !remotePeerID) {
        alert("Not connected to a peer. Please connect first.");
        logStatus("⚠️ Not connected to a peer.");
        return;
    }

    try {
        // Send the encrypted message
        await sendEncryptedMessage(message, otherPeerPublicKey, remotePeerID);

        // Display the sent message locally
        displayMessage(message, "sent");

        // Clear the textarea
        document.getElementById("messageToSend").value = "";

        logStatus(`✅ Message sent successfully.`);
    } catch (error) {
        console.error("[ERROR] Failed to send message:", error);
        logStatus(`⚠️ Failed to send message: ${error.message}`);
    }
});

// Encrypt and send a message
async function sendEncryptedMessage(message, otherPeerPublicKey, remotePeerID) {
    try {
        const encryptedMessage = await encryptMessage(message, otherPeerPublicKey);
        console.log(`[PEERJS] Encrypted message: ${encryptedMessage}`);
        logStatus(`📤 Encrypted message sent: ${encryptedMessage}`);

        // Send the encrypted message to the peer
        conn.send({ encryptedMessage, type: 'message' });
    } catch (error) {
        console.error("[ERROR] Error encrypting message:", error);
        logStatus(`⚠️ Error encrypting message: ${error.message}`);
        throw error; // Re-throw to be caught by caller
    }
}

// Encrypt the message with the given public key
async function encryptMessage(message, publicKeyString) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(message);

    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(publicKeyString),
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
    );

    const encryptedData = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, dataBuffer);
    return arrayBufferToBase64(encryptedData);
}

// Decrypt the message using the private key
async function decryptMessage(encryptedMessage, privateKeyString) {
    const privateKey = await importPrivateKey(privateKeyString);
    const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);

    const decryptedData = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);
    return new TextDecoder().decode(decryptedData);
}

// Function to import the private key for decryption (PKCS8 format)
async function importPrivateKey(privateKeyString) {
    try {
        const privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"]
        );
        console.log("[PEERJS] Private key imported successfully.");
        return privateKey;
    } catch (error) {
        console.error("[ERROR] Failed to import private key:", error);
        logStatus(`⚠️ Error importing private key: ${error.message}`);
        throw error;
    }
}

// Logs public and private keys for verification
function logKeys(publicKeyString, privateKeyString) {
    logStatus(`📤 Your Public Key: ${publicKeyString}`);
    logStatus(`📥 Your Private Key: ${privateKeyString}`);
}

// Base64 to ArrayBuffer conversion
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);  // Decode the Base64 string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Logs status updates
function logStatus(message) {
    const logDiv = document.getElementById("logStatus");
    const newLog = document.createElement("p");
    newLog.textContent = message;
    logDiv.appendChild(newLog);
    console.log("[STATUS] " + message);
}

// Decrypt received encrypted message
async function receiveEncryptedMessage(encryptedMessage) {
    console.log("[PEERJS] Decrypting received encrypted message:", encryptedMessage);

    try {
        const decryptedMessage = await decryptMessage(encryptedMessage, localStorage.getItem("privateKey"));
        console.log("[PEERJS] Decrypted message: ", decryptedMessage);
        displayMessage(decryptedMessage, "received");
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
        logStatus(`⚠️ Decryption error: ${error.message}`);
    }
}

function displayMessage(message, type) {
    const messageContainer = document.getElementById("incomingMessages");
    const messageBubble = document.createElement("div");

    messageBubble.classList.add("message", type);
    messageBubble.textContent = message;

    messageContainer.appendChild(messageBubble);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}