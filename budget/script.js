document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            displayCSV(text);
        };
        reader.readAsText(file);
    }
});

function displayCSV(data) {
    const rows = data.split("\\n").map(row => row.split(","));
    const table = document.getElementById("csvTable");
    table.innerHTML = ""; // Clear the table

    rows.forEach((row, index) => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
            const cellElement = index === 0 ? document.createElement("th") : document.createElement("td");
            cellElement.textContent = cell;
            tr.appendChild(cellElement);
        });
        table.appendChild(tr);
    });
}
