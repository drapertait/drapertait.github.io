document.getElementById("decryptWithUserKeysButton").addEventListener("click", async function() {
    const userPublicKeyString = document.getElementById("userPublicKey").value;
    const userPrivateKeyString = document.getElementById("userPrivateKey").value;
    const encryptedMessage = document.getElementById("encryptedMessageToDecrypt").value;

    if (!userPublicKeyString || !userPrivateKeyString || !encryptedMessage) {
        console.error("⚠️ Please fill in all fields.");
        return;
    }

    try {
        console.log("Attempting to decrypt the message with user-provided keys...");

        const privateKey = await importPrivateKey(userPrivateKeyString);
        const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);

        console.log("User keys imported and encrypted buffer prepared");

        const decryptedData = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedBuffer
        );

        const decryptedMessage = new TextDecoder().decode(decryptedData);
        console.log("Decryption with user keys successful");

        document.getElementById("userDecryptedMessage").textContent = decryptedMessage;
    } catch (error) {
        console.error("Decryption with user keys failed:", error.message);
    }
});

// Function to import a private key (PKCS8 format)
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
        console.log("Private key imported successfully.");
        return privateKey;
    } catch (error) {
        console.error("Private key import failed:", error.message);
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
