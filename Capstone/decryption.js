async function decryptMessage(encryptedMessage, privateKeyString) {
    // Log the encrypted message for debugging
    console.log("[DECRYPTION] Encrypted message:", encryptedMessage);
    console.log("[DECRYPTION] Private key string:", privateKeyString);

    try {
        // Import the private key
        const privateKey = await importPrivateKey(privateKeyString);
        console.log("[DECRYPTION] Private key imported successfully.");

        const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);
        console.log("[DECRYPTION] Encrypted buffer:", encryptedBuffer);

        // Attempt to decrypt the message
        const decryptedData = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);
        console.log("[DECRYPTION] Decrypted data:", decryptedData);

        // Decode the decrypted message
        const decryptedMessage = new TextDecoder().decode(decryptedData);
        console.log("[DECRYPTION] Decrypted message:", decryptedMessage);

        return decryptedMessage;
    } catch (error) {
        console.error("[DECRYPTION ERROR] Failed to decrypt message:", error);
        throw new Error("Decryption failed: " + error.message);
    }
}

async function importPrivateKey(privateKeyString) {
    try {
        const privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",  // Ensure using 'pkcs8' for private key
            privateKeyBuffer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"]
        );
        console.log("[DECRYPTION] Private key imported successfully.");
        return privateKey;
    } catch (error) {
        console.error("[DECRYPTION ERROR] Private key import failed:", error.message);
        throw error;
    }
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
