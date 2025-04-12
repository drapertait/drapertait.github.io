document.getElementById("generateKeysButton").addEventListener("click", async function () {
    const keys = await window.crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyString = await exportKey(keys.publicKey);
    const privateKeyString = await exportPrivateKey(keys.privateKey);

    localStorage.setItem("publicKey", publicKeyString);
    localStorage.setItem("privateKey", privateKeyString);

    alert("RSA Keys Generated!");
});

async function exportKey(key) {
    return arrayBufferToBase64(await window.crypto.subtle.exportKey("spki", key));
}

async function exportPrivateKey(key) {
    return arrayBufferToBase64(await window.crypto.subtle.exportKey("pkcs8", key));
}

function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
