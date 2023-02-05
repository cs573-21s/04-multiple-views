/*
* overallcomparison.js
* By: Andrew Nolan
*
* Handles generating the scatterplot matrix and the parallel axes as well as their filters and brushes
*/


// The color for deselected dots and lines
let deselectColor = "#eee";

// Call the generateSplom function with the initial state of both legendaies and normal pokemon and all generations
generateSplom(0,"9");

function generateSplom(legend, generation) {
    // Properties for the svg
    let width = 1200;
    let padding = 20;
    let size;

    // Type colors
    let c = { Grass: "#78c850", Fire: "#F08030", Water: "#6890f0", Bug: "#a8b820", Normal: "#a8a878", Dark: "#000000", Poison: "#a040a0", Electric: "#f8d030", Ground: "#e0c068", Ice: "#98D8D8", Fairy: "#ee99ac", Steel: "#b8b8d0", Fighting: "#c03028", Psychic: "#f85888", Rock: "#b8a038", Ghost: "#705898", Dragon: "#7038f8", Flying: "#a890f0" }

    // store the pokemon data
    let pokemonData = [];

    // store the columns
    let columns = [];

    // Read the csv
    d3.csv("https://andrewnolan.dev/Pokemon-Visualization/pokedex.csv").then(function (data) {
        pokemonData = data;

        columns = data.columns.filter(d => filterStats(d));
        size = (width - (columns.length + 1) * padding) / columns.length + padding;

        // Filter the data based on the generation and legendary status
        data = data.filter(d => dataFilter(d,generation,legend));

        buildSplom(data);
    });

    // Variables for the x and y axis (needed later for the brush)
    let x;
    let y;

    // Build the Scatter plot matrix
    function buildSplom(data) {
        // Create the svg
        let svg = d3.create("svg")
            .attr("width", width)
            .attr("viewBox", [-padding, 0, width, width]);

        // Give it a style when circles are hidden
        svg.append("style")
            .text(`circle.hidden{fill:#000;fill-opacity:1;r:1px;}`);

        // Create the x axis scale
        x = columns.map(c => d3.scaleLinear()
            .domain(d3.extent(data, d => parseInt(d[c])))
            .rangeRound([padding / 2, size - padding / 2]));

        // Create the y axis scale
        y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));

        // Add the x axis
        svg.append("g")
            .call(xAxis());

        // Add the y axis
        svg.append("g")
            .call(yAxis());

        // Create each individual scatter plot
        let scatterplot = svg.append("g")
            .selectAll("g")
            .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
            .join("g")
            .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

        scatterplot.append("rect")
            .attr("fill", "none")
            .attr("stroke", "#aaa")
            .attr("x", padding / 2 + 0.5)
            .attr("y", padding / 2 + 0.5)
            .attr("width", size - padding)
            .attr("height", size - padding);

        // Append the dots to the scatter plots
        scatterplot.each(function ([i, j]) {
            d3.select(this).selectAll("circle")
                .data(data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
                .join("circle")
                .attr("cx", d => x[i](d[columns[i]]))
                .attr("cy", d => y[j](d[columns[j]]));
        });

        let circle = scatterplot.selectAll("circle")
            .attr("r", 3.5)
            .attr("fill", d => c[d.type_1])
            .attr("id", d => d.id);

        // Currently not working because the brush gets drawn over the dots
        circle.append("title")
            .text(d => d.name);

        // Call the brush setup
        scatterplot.call(brush, circle, svg, data);

        // Add text across the diagonal to label the stats
        svg.append("g")
            .style("font", "bold 10px sans-serif")
            .style("pointer-events", "none")
            .selectAll("text")
            .data(columns)
            .join("text")
            .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(d => d);

        // Start with nothing selected
        svg.property("value", []);

        // Append the svg to the page
        document.getElementById("scattermatrix").appendChild(svg.node());
    }

    // Generate the x axis
    function xAxis() {
        let axis = d3.axisBottom()
            .ticks(6)
            .tickSize(size * columns.length);
        return g => g.selectAll("g").data(x).join("g")
            .attr("transform", (d, i) => `translate(${i * size},0)`)
            .each(function (d) { return d3.select(this).call(axis.scale(d)); })
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "#eee"));
    }

    // Generate the y axis
    function yAxis() {
        let axis = d3.axisLeft()
            .ticks(6)
            .tickSize(-size * columns.length);
        return g => g.selectAll("g").data(y).join("g")
            .attr("transform", (d, i) => `translate(0,${i * size})`)
            .each(function (d) { return d3.select(this).call(axis.scale(d)); })
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "#eee"));
    }


    // Create the brush
    function brush(scatterplot, circle, svg, data) {
        let brush = d3.brush()
            .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
            .on("start", brushstarted)
            .on("brush", brushed)
            .on("end", brushend);

        scatterplot.call(brush);

        let brushscatterplot;

        // The brush started function
        function brushstarted() {
            if (brushscatterplot !== this) {
                d3.select(brushscatterplot).call(brush.move, null);
                brushscatterplot = this;
            }
        }

        // The brushed function, affects both the scatterplot matrix and the parallel axes
        function brushed({ selection }, [i, j]) {
            // Reset the parallel axes brush if it's currently in use
            let parallelSelection = document.getElementById("parallelaxes").getElementsByClassName("selection")
            if(parallelSelection){
                for(let i=0;i<parallelSelection.length;i++){
                    parallelSelection[i].style.display = "none";
                }
            }

            // Figure out what points we selected in the SPLOM
            let selected = [];
            if (selection) {
                let [[x0, y0], [x1, y1]] = selection;
                circle.classed("hidden",
                    d => x0 > x[i](d[columns[i]]) ||
                        x1 < x[i](d[columns[i]]) ||
                        y0 > y[j](d[columns[j]]) ||
                        y1 < y[j](d[columns[j]]));
                selected = data.filter(
                    d => x0 < x[i](d[columns[i]]) &&
                        x1 > x[i](d[columns[i]]) &&
                        y0 < y[j](d[columns[j]]) &&
                        y1 > y[j](d[columns[j]]));
            }

            // Update the parallel axes
            let parallel = d3.select("#parallelaxes svg");
            let path = parallel.selectAll("path");
            path.each(function (d) {
                let active = false;
                selected.forEach(function(e){
                    if(d !== null){
                        if(d.id === e.id){
                            active = true;
                            return true;
                        }   
                    }
                });
                d3.select(this).style("stroke", active ? c[d.type_1] : deselectColor);
                if (active) {
                    d3.select(this).raise();
                }
            });

            // Set the properies of the SVGs to the selected data
            parallel.property("value", selected).dispatch("input");
            svg.property("value", selected).dispatch("input");
        }

        // End the brush
        // Updates both visualizations
        function brushend({ selection }) {
            if (selection) {
                return;
            }
            let parallel = d3.select("#parallelaxes svg")
            let path = parallel.selectAll("path");
            path.each(function (d) {
                if(d !== null){
                    d3.select(this).style("stroke", c[d.type_1]);
                }
            });


            // Update the selected values and unhide anything previously selected
            parallel.property("value", []).dispatch("input");
            svg.property("value", []).dispatch("input");
            circle.classed("hidden", false);
        }
    }
}

// Filters the data based on the specific column
function filterStats(d) {
    if (d === "hp" || d === "attack" || d === "defense" || d === "sp_attack" || d === "sp_defense" || d === "speed") {
        return true;
    }
    return false;
}

// Generate the parallel axis with the initial values of all pokemon
generateParallelAxis(0, "9");

// Generate the parallel axis
function generateParallelAxis(legend, generation) {
    // Read the csv
    d3.csv("https://andrewnolan.dev/Pokemon-Visualization/pokedex.csv").then(function (data) {

        // Set up the SVG properties
        let margin = ({ top: 25, right: 30, bottom: 20, left: 20 });

        let keys = data.columns.filter(d => filterStats(d));

        data = data.filter(d => dataFilter(d,generation,legend));

        let width = keys.length * 160;
        let height = width / 2;

        let y = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(data, d => parseInt(d[key])), [margin.top, height - margin.bottom])]));

        let x = d3.scalePoint(keys, [margin.right, width - margin.left]);

        let c = { Grass: "#78c850", Fire: "#F08030", Water: "#6890f0", Bug: "#a8b820", Normal: "#a8a878", Dark: "#000000", Poison: "#a040a0", Electric: "#f8d030", Ground: "#e0c068", Ice: "#98D8D8", Fairy: "#ee99ac", Steel: "#b8b8d0", Fighting: "#c03028", Psychic: "#f85888", Rock: "#b8a038", Ghost: "#705898", Dragon: "#7038f8", Flying: "#a890f0" };

        let brushWidth = 50;

        // Create the SVG
        let svg = d3.create("svg")
            .attr("width", width)
            .attr("viewBox", [0, 0, width, height]);

        // Create the brush
        // Using brushY because the x axis doesn't matter here
        let brush = d3.brushY()
            .extent([
                [-(brushWidth / 2), margin.top],
                [brushWidth / 2, height - margin.bottom]
            ])
            .on("start brush end", brushed);

        // Define the function for creating the lines
        let line = d3.line()
            .defined(([, value]) => value != null)
            .y(([key, value]) => y.get(key)(value))
            .x(([key]) => x(key))

        // Create the paths for the parallel axes
        let path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(data)
            .join("path")
            .attr("stroke", d => c[d["type_1"]])
            .attr("id",d => d.id)
            .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, parseInt(d[key])])))

        // Add a mouseover title to the paths
        // Needs to be added here, if just .append at the end of the previous .attr, let path will be the titles instead of the lines
        path.append("title")
            .text(d => d.name);

        // Create each of the axes and their brushes
        svg.append("g")
            .selectAll("g")
            .data(keys)
            .join("g")
            .attr("transform", d => `translate(${x(d)},0)`)
            .each(function (d) { d3.select(this).call(d3.axisLeft(y.get(d))); })
            .call(g => g.append("text")
                .attr("y", margin.top - 15)
                .attr("x", -20)
                .attr("text-anchor", "start")
                .attr("fill", "currentColor")
                .text(d => d))
            .call(g => g.selectAll("text")
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke-width", 3)
                .attr("stoke-linejoin", "round")
                .attr("stroke", "white"))
            .call(brush);

        // The range of the brush selection
        let selections = new Map();

        function brushed({ selection }, key) {
            let splom = document.getElementById("scattermatrix").getElementsByClassName("selection")
            if(splom){
                for(let i=0;i<splom.length;i++){
                    splom[i].style.display = "none";
                }
            }

            // Set up the selection brush, get it's coordinates
            if (selection === null) {
                selections.delete(key);
            } else {
                selections.set(key, selection.map(y.get(key).invert));
            }

            // Update the parallel axes to show which paths are selected
            // Also store the data of the selected
            const selected = [];
            path.each(function (d) {
                let active = Array.from(selections).every(([key, [min, max]]) => parseInt(d[key]) >= min && parseInt(d[key]) <= max);
                d3.select(this).style("stroke", active ? c[d.type_1] : deselectColor);
                if (active) {
                    d3.select(this).raise();
                    selected.push(d);
                }
            });

            // Get the contents of the Scatter plot matrix
            let scatter = d3.select("#scattermatrix svg")
            let circles= scatter.selectAll("circle");

            // Disable the dots that are not selected by the parallel axes
            circles.classed("hidden", d => circleClass(d));
            function circleClass(d){
                let hidden = true;
                selected.forEach(function(e){
                    if(d.id === e.id){
                        hidden = false;
                        return false;
                    }   
                });
                return hidden;
            }

            // Update the data property of the two svgs
            scatter.property("value", selected).dispatch("input");
            svg.property("value", selected).dispatch("input");
        }

        // Append the newly created SVG to the web page
        document.getElementById("parallelaxes").appendChild(svg.property("value", data).node());

    });
}

// Get the filter selects
let legendlist2 = document.getElementById("legendlist2");
let generation2 = document.getElementById("generation2");

// Add a function to update the visualizations if the legendary filter is changed
legendlist2.addEventListener("change", function () {
    document.getElementById("scattermatrix").innerHTML = "";
    document.getElementById("parallelaxes").innerHTML = "";
    generateSplom(determineLegendValue(), generation2.value);
    generateParallelAxis(determineLegendValue(), generation2.value)
});

// Convert the selected string into a number
function determineLegendValue() {
    if (legendlist2.value === "Include All") {
        return 0;
    } else if (legendlist2.value === "Exclude Legendaries") {
        return 1;
    } else {
        return 2;
    }
}

// Add a function to update the visualizations if the generation filter is changed
generation2.addEventListener("change", function(){
    document.getElementById("scattermatrix").innerHTML = "";
    document.getElementById("parallelaxes").innerHTML = "";
    generateSplom(determineLegendValue(), generation2.value);
    generateParallelAxis(determineLegendValue(), generation2.value)
});

// Filter the data based on the generation and legendary filters
function dataFilter(d, generation, legend){
    if(d.generation === generation || generation === "9"){
        if (legend === 0) {
            return true;
        } else if (d["status"] === "Normal" && legend === 1) {
            return true;
        } else if (d["status"] !== "Normal" && legend === 2) {
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}