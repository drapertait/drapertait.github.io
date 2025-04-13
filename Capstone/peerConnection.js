const peer = new Peer({
    secure: true, // Use WSS (WebSocket Secure) since the cloud server uses HTTPS
    debug: 3,     // Keep debug level for verbose logging
});

peer.on("open", (id) => {
    console.log("[PEERJS] Your Peer ID:", id);
    document.getElementById("peerID").textContent = `Your Peer ID: ${id}`;
    logStatus(`Your Peer ID: ${id}`);
});

peer.on("error", (err) => {
    console.error("[PEERJS] Error initializing Peer:", err);
    logStatus(`⚠️ PeerJS initialization failed: ${err.message}`);
});

let conn = null;

document.getElementById("connectButton").addEventListener("click", function () {
    const remotePeerID = document.getElementById("remotePeerInput").value.trim();
    
    if (!remotePeerID) {
        alert("Enter a valid Peer ID.");
        logStatus("⚠️ No Peer ID entered for connection.");
        return;
    }

    console.log(`[PEERJS] Attempting to connect to ${remotePeerID}...`);
    logStatus(`🔄 Connecting to ${remotePeerID}...`);

    conn = peer.connect(remotePeerID);

    conn.on("open", () => {
        console.log(`[PEERJS] Connected to peer: ${remotePeerID}`);
        document.getElementById("peerID").textContent += " ✅ Connected!";
        logStatus(`✅ Successfully connected to ${remotePeerID}!`);
        alert("Connection Established!");
    });

    conn.on("error", (err) => {
        console.error("[PEERJS ERROR] Connection error:", err);
        alert("Connection failed. Ensure the other peer is online.");
        logStatus(`⚠️ Connection error: ${err.message}`);
    });

    conn.on("data", (data) => receiveEncryptedMessage(data));

    conn.on("close", () => {
        console.log("[PEERJS] Connection closed.");
        logStatus("❌ Connection closed.");
    });
});

// Log status updates
function logStatus(message) {
    const logDiv = document.getElementById("logStatus");
    const newLog = document.createElement("p");
    newLog.textContent = message;
    logDiv.appendChild(newLog);
    console.log("[STATUS] " + message);
}
