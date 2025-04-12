document.getElementById("showPublicKeyButton").addEventListener("click", function() {
    const publicKeyString = localStorage.getItem("publicKey");
    if (publicKeyString) {
        alert("Public Key:\n" + publicKeyString);
        document.getElementById("currentPublicKey").textContent = publicKeyString;
    } else {
        alert("Public key not found. Please generate keys first.");
    }
});

document.getElementById("showPrivateKeyButton").addEventListener("click", function() {
    const privateKeyString = localStorage.getItem("privateKey");
    if (privateKeyString) {
        alert("Private Key:\n" + privateKeyString);
        document.getElementById("currentPrivateKey").textContent = privateKeyString;
    } else {
        alert("Private key not found. Please generate keys first.");
    }
});
