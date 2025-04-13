async function decryptMessage(encryptedMessage, privateKeyString) {
    const privateKey = await importPrivateKey(privateKeyString);
    const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);

    const decryptedData = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);
    return new TextDecoder().decode(decryptedData);
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
