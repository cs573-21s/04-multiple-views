// Read the pokedex csv
d3.csv("http://acnolan.tech/04-multiple-views/pokedex.csv").then(function (data) {
    buildBigTable(data);
});

function buildBigTable(data) {
    let tablediv = document.getElementById("dataset");

    let table = document.createElement("table");

    // Generate Header
    let thead = table.createTHead();

    let headerRow = thead.insertRow();

    for (let key of data.columns) {
        let th = document.createElement("th");
        let text = document.createTextNode(key.toUpperCase());
        th.appendChild(text);
        headerRow.appendChild(th);
    }

    // Colors
    let c = { Grass: "#78c850", Fire: "#F08030", Water: "#6890f0", Bug: "#a8b820", Normal: "#a8a878", Dark: "#000000", Poison: "#a040a0", Electric: "#f8d030", Ground: "#e0c068", Ice: "#98D8D8", Fairy: "#ee99ac", Steel: "#b8b8d0", Fighting: "#c03028", Psychic: "#f85888", Rock: "#b8a038", Ghost: "#705898", Dragon: "#7038f8", Flying: "#a890f0" }

    // Generate data rows
    for (let row of data) {
        let newrow = table.insertRow();
        let rowColor = c[row["type_1"]];
        newrow.style.backgroundColor = rowColor;
        if(rowColor === "#000000"){
            newrow.style.color = "#ffffff";
        }

        for (let key of data.columns) {
            let cell = newrow.insertCell();
            let text = document.createTextNode(row[key]);
            cell.appendChild(text);
        }
    }




    tablediv.appendChild(table);
}