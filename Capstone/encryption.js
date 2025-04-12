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

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
