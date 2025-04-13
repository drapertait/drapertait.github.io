async function encryptMessage(message, publicKeyString) {
    const encoder = new TextEncoder();

    // Check if the message is valid
    if (!message) {
        console.error("[ENCRYPTION ERROR] Empty message.");
        throw new Error("Message cannot be empty.");
    }

    const dataBuffer = encoder.encode(message);

    // Log the public key and message for debugging
    console.log("[ENCRYPTION] Public Key:", publicKeyString);
    console.log("[ENCRYPTION] Message to encrypt:", message);

    try {
        // Import the public key
        const publicKey = await window.crypto.subtle.importKey(
            "spki", 
            base64ToArrayBuffer(publicKeyString),
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );

        // Encrypt the message
        const encryptedData = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            dataBuffer
        );

        console.log("[ENCRYPTION] Encryption successful!");
        return arrayBufferToBase64(encryptedData);
    } catch (error) {
        console.error("[ENCRYPTION ERROR] Failed to encrypt message:", error);
        alert("Failed to encrypt the message. Please check the keys and try again.");
        throw new Error("Encryption failed: " + error.message);
    }
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
