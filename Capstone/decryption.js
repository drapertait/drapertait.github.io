async function decryptMessage(encryptedMessage, privateKeyString) {
    try {
        const privateKey = await importPrivateKey(privateKeyString);
        const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);

        const decryptedData = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);
        const decryptedMessage = new TextDecoder().decode(decryptedData);
        console.log("[DECRYPTION] Message decrypted successfully:", decryptedMessage);

        return decryptedMessage;
    } catch (error) {
        console.error("[DECRYPTION ERROR] Failed to decrypt message:", error);
        throw new Error("Decryption failed: " + error.message);
    }
}

async function importPrivateKey(privateKeyString) {
    return await window.crypto.subtle.importKey(
        "pkcs8",
        base64ToArrayBuffer(privateKeyString),
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
    );
}
