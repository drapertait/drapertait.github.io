// Wait for the DOM to be fully loaded before executing any JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Now it's safe to access DOM elements and add event listeners
    const generateKeysButton = document.getElementById("generateKeysButton");

    // Check if the button exists to avoid potential errors
    if (generateKeysButton) {
        generateKeysButton.addEventListener("click", async function () {
            // Generate RSA keys
            const keys = await window.crypto.subtle.generateKey(
                { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
                true,
                ["encrypt", "decrypt"]
            );

            // Export the public and private keys as base64 strings
            const publicKeyString = await exportKey(keys.publicKey);
            const privateKeyString = await exportPrivateKey(keys.privateKey);

            // Store the keys in localStorage
            localStorage.setItem("publicKey", publicKeyString);
            localStorage.setItem("privateKey", privateKeyString);

            // Alert the user that the keys have been generated
            alert("RSA Keys Generated!");
        });
    } else {
        console.error('Generate Keys button not found!');
    }
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
