// This code generates a boxplot comparing the stat data of different pokemon types and a heatmap showing the effectiveness of each type
typeComparison();
function typeComparison() {
    let margins = { top: 10, right: 30, left: 42, bottom: 40 }

    let width = 500 - margins.left - margins.right;
    let height = 500 - margins.top - margins.bottom;

    let svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    let heatmapsvg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    pokemonTypes = [];

    pokedexData = [];

    // Read the pokedex csv
    d3.csv("../pokedex.csv").then(function (data) {
        pokedexData = data;
        buildBoxPlot(data, "hp", 0);
        readPokemonTypes();
    });

    // Colors
    let c = { Grass: "#78c850", Fire: "#F08030", Water: "#6890f0", Bug: "#a8b820", Normal: "#a8a878", Dark: "#000000", Poison: "#a040a0", Electric: "#f8d030", Ground: "#e0c068", Ice: "#98D8D8", Fairy: "#ee99ac", Steel: "#b8b8d0", Fighting: "#c03028", Psychic: "#f85888", Rock: "#b8a038", Ghost: "#705898", Dragon: "#7038f8", Flying: "#a890f0" }

    let boxX;
    let boxY;
    let typeStats;

    function determineTypeStats(pokemon, stat, legend) {
        // Compute the summary stats
        typeStats = d3.rollup(pokemon,
            function (d) {
                let statList = d.map(function (g) {
                    if (legend === 0) {
                        return parseInt(g[stat]);
                    } else if (g["status"] === "Normal" && legend === 1) {
                        return parseInt(g[stat]);
                    } else if (g["status"] !== "Normal" && legend === 2) {
                        return parseInt(g[stat]);
                    }
                }).sort(d3.ascending);
                statList = statList.filter(x => x !== undefined);
                min = statList[0];
                q1 = d3.quantile(statList, .25);
                median = d3.quantile(statList, .5);
                q3 = d3.quantile(statList, .75);
                interquartilerange = q3 - q1;
                max = statList[statList.length - 1];
                return { min: min, q1: q1, median: median, q3: q3, interquartilerange: interquartilerange, max: max }
            },
            function (d) { return d.type_1; });
    }

    function buildBoxPlot(pokemon, stat, legend) {

        determineTypeStats(pokemon, stat, legend);

        for (const t of typeStats.keys()) {
            pokemonTypes.push(t);
        }

        // Draw the x axis
        boxX = d3.scaleBand()
            .range([0, width])
            .domain(typeStats.keys())
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(boxX))
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");



        // Draw the y axis
        boxY = d3.scaleLinear()
            .domain([0, 255])
            .range([height, 0])
        svg.append("g").call(d3.axisLeft(boxY));

        updateBoxes(typeStats, boxX, boxY, stat, legend)
    }

    function updateBoxes(typeStats, x, y) {
        // Draw the min/max range line
        // We draw it first so it's behind the rectangle
        let vertLines = svg.selectAll(".verticalLine")
            .data(typeStats);
        vertLines.enter()
            .append("line")
            .merge(vertLines)
            .transition()
            .duration(1000)
            .attr("class", "verticalLine")
            .attr("x1", function (d) { return x(d[0]) + 11.944444444444445 })
            .attr("x2", function (d) { return x(d[0]) + 11.944444444444445 })
            .attr("y1", function (d) { return y(d[1].min) })
            .attr("y2", function (d) { return y(d[1].max) })
            .attr("stroke", "black")
            .style("width", 40);

        // Create the tooltip
        let tooltip = d3.select("body").append("div").attr("class", "toolTip");

        // Draw the interquartile rectangle
        let boxWidth = 10;
        let halfOffset = 11.944444444444445 - 5;
        let allBoxes = svg.selectAll("rect")
            .data(typeStats);
        allBoxes.enter()
            .append("rect")
            .on("mousemove", function (d, e) {
                tooltip
                    .style("left", event.pageX - 105 + "px")
                    .style("top", event.pageY - 120 + "px")
                    .style("display", "inline-block")
                    .html(determineBoxToolTip(e));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); })
            .merge(allBoxes)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return (x(d[0]) + halfOffset) })
            .attr("y", function (d) { return (y(d[1].q3)) })
            .attr("height", function (d) { return (y(d[1].q1) - y(d[1].q3)) })
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", function (d) { return (c[d[0]]) })
            .style("cursor", "crosshair");

    }

    function readPokemonTypes() {
        d3.csv("../typeadvantage.csv").then(function (data) {
            buildHeatMap(data);
        });
    }

    function buildHeatMap(data) {
        // Build the x axis
        let x = d3.scaleBand()
            .range([0, width])
            .domain(pokemonTypes)
            .padding(0.01);
        heatmapsvg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        // Build the y axis
        let y = d3.scaleBand()
            .range([height, 0])
            .domain(pokemonTypes);
        heatmapsvg.append("g")
            .call(d3.axisLeft(y))

        // heatmap colors
        let c = { "0.5": "#f51d0a", "1": "#d8e3d8", "2": "#119c13" };

        // Create the tooltip
        let tooltip = d3.select("body").append("div").attr("class", "toolTip");

        // Draw the heatmap squares
        for (const t of pokemonTypes) {
            heatmapsvg.selectAll()
                .data(data)
                .enter()
                .append("rect")
                .attr("x", x(t))
                .attr("y", function (d) { return y(d.Attacking) })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) { return (c[d[t]]) })
                .style("cursor", "crosshair")
                .on("mousemove", function (d, e) {
                    tooltip
                        .style("left", event.pageX - 250 + "px")
                        .style("top", event.pageY - 40 + "px")
                        .style("display", "inline-block")
                        .html(determineHeatToolTip(e.Attacking, t, e[t]));
                })
                .on("mouseout", function (d) { tooltip.style("display", "none"); })
        }
    }

    function determineHeatToolTip(t1, t2, number) {
        if (number === "1") {
            return "" + t1 + " is normal effective against " + t2 + " types.";
        } else if (number === "0.5") {
            return "" + t1 + " is not very effective against " + t2 + " types.";
        } else if (number === "2") {
            return "" + t1 + " is super effective against " + t2 + " types.";
        } else {
            return "" + t1 + " does not effect " + t2 + " types.";
        }
    }

    function determineBoxToolTip(e) {
        let toolString = "<p><strong><u>" + e[0] + " Type</u></strong></p>";
        toolString += "<p>Min: " + e[1].min + "</p>";
        toolString += "<p>Q1: " + e[1].q1 + "</p>";
        toolString += "<p>Median: " + e[1].median + "</p>";
        toolString += "<p>Q3: " + e[1].q3 + "</p>";
        toolString += "<p>Max: " + e[1].max + "</p>";
        return toolString;
    }

    let statlist = document.getElementById("statlist");
    legendlist = document.getElementById("legendlist");

    statlist.addEventListener("change", function () {
        //document.getElementById("boxplot").innerHTML="";

        // svg = d3.select("#boxplot")
        // .append("svg")
        // .attr("width", width + margins.left + margins.right)
        // .attr("height", height + margins.top + margins.bottom)
        // .append("g")
        // .attr("transform","translate("+ margins.left + "," + margins.top + ")");

        //buildBoxPlot(pokedexData,determineStat(statlist.value),determineLegendValue(legendlist.value));
        determineTypeStats(pokedexData, determineStat(statlist.value), determineLegendValue(legendlist.value));
        updateBoxes(typeStats, boxX, boxY);
    });

    function determineStat(statLongName) {
        if (statlist.value === "HP") {
            return "hp";
        } else if (statlist.value === "Attack") {
            return "attack";
        } else if (statlist.value === "Defense") {
            return "defense";
        } else if (statlist.value === "Sp Defense") {
            return "sp_defense";
        } else if (statlist.value === "Sp Attack") {
            return "sp_attack";
        } else {
            return "speed";
        }
    }


    legendlist.addEventListener("change", function () {
        //document.getElementById("boxplot").innerHTML="";

        // svg = d3.select("#boxplot")
        // .append("svg")
        // .attr("width", width + margins.left + margins.right)
        // .attr("height", height + margins.top + margins.bottom)
        // .append("g")
        // .attr("transform","translate("+ margins.left + "," + margins.top + ")");

        //buildBoxPlot(pokedexData,determineStat(statlist.value),determineLegendValue(legendlist.value));
        determineTypeStats(pokedexData, determineStat(statlist.value), determineLegendValue(legendlist.value));
        updateBoxes(typeStats, boxX, boxY);
    });

    function determineLegendValue(legendLongName) {
        if (legendlist.value === "Include All") {
            return 0;
        } else if (legendlist.value === "Exclude Legendaries") {
            return 1;
        } else {
            return 2;
        }
    }
}


