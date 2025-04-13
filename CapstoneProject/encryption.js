// Encrypt and send a message using the other peer's public key
async function sendEncryptedMessage(message, otherPeerPublicKeyString, remotePeerID) {
    try {
        // Encrypt message with the other peer's public key
        const encryptedMessage = await encryptMessage(message, otherPeerPublicKeyString);

        console.log(`[PEERJS] Encrypted message sent: ${encryptedMessage}`);
        logStatus(`📤 Encrypted message sent: ${encryptedMessage}`);

        // Send the encrypted message to the peer
        conn.send({ encryptedMessage, type: 'message' });
    } catch (error) {
        console.error("[ERROR] Error encrypting message:", error);
        logStatus(`⚠️ Error encrypting message: ${error.message}`);
    }
}

// Encrypt the message with the given public key (other peer's public key)
async function encryptMessage(message, publicKeyString) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(message);

    const publicKey = await window.crypto.subtle.importKey(
        "spki",  // Use the correct format (SPKI for public key)
        base64ToArrayBuffer(publicKeyString),
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
    );

    const encryptedData = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, dataBuffer);
    return arrayBufferToBase64(encryptedData);
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