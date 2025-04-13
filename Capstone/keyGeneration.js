document.addEventListener('DOMContentLoaded', async function () {
    // Automatically generate RSA keys when the page loads
    const keys = await window.crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyString = await exportKey(keys.publicKey);
    const privateKeyString = await exportPrivateKey(keys.privateKey);

    // Store the keys in localStorage
    localStorage.setItem("publicKey", publicKeyString);
    localStorage.setItem("privateKey", privateKeyString);

    alert("RSA Keys Generated Automatically!");
});

// Function to export public key to base64
async function exportKey(key) {
    return arrayBufferToBase64(await window.crypto.subtle.exportKey("spki", key));
}

// Function to export private key to base64
async function exportPrivateKey(key) {
    return arrayBufferToBase64(await window.crypto.subtle.exportKey("pkcs8", key));
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}