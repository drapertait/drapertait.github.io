// Decrypt the received encrypted message using our private key
async function decryptMessage(encryptedMessage, privateKeyString) {
    try {
        // Import the private key for decryption
        const privateKey = await importPrivateKey(privateKeyString);
        const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);

        console.log(`[PEERJS] Encrypted message length: ${encryptedBuffer.byteLength}`);

        // Decrypt the message using the private key
        const decryptedData = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);
        const decryptedMessage = new TextDecoder().decode(decryptedData);

        console.log("[PEERJS] Decrypted message:", decryptedMessage);
        return decryptedMessage;
    } catch (error) {
        console.error("[ERROR] Decryption error:", error);
        logStatus(`⚠️ Decryption error: ${error.message}`);
        throw new Error("Decryption operation failed.");
    }
}

// Function to import the private key for decryption (PKCS8 format)
async function importPrivateKey(privateKeyString) {
    try {
        const privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8", // Ensure the private key is in PKCS8 format
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