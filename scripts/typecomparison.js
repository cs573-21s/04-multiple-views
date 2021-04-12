// This code generates a boxplot comparing the stat data of different pokemon types and a heatmap showing the effectiveness of each type
let margins = {top: 10, right: 30, left: 42, bottom: 40}

let width = 500 - margins.left - margins.right;
let height = 500 - margins.top - margins.bottom;

let svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom)
    .append("g")
    .attr("transform","translate("+ margins.left + "," + margins.top + ")");

let heatmapsvg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom)
    .append("g")
    .attr("transform","translate("+ margins.left + "," + margins.top + ")");

pokemonTypes = [];

pokedexData = [];

// Read the pokedex csv
d3.csv("../pokedex.csv").then( function(data) {
    pokedexData = data;
    buildBoxPlot(data,"hp");
    readPokemonTypes();
});

function buildBoxPlot(pokemon,stat){
    // Compute the summary stats
    let typeStats = d3.rollup(pokemon, 
        function(d){
            let statList = d.map(function(g) { return parseInt(g[stat]);}).sort(d3.ascending);
            min = statList[0];
            q1 = d3.quantile(statList,.25);
            median = d3.quantile(statList,.5);
            q3 = d3.quantile(statList,.75);
            interquartilerange = q3 - q1;
            max = statList[statList.length-1];
            return {min:min, q1:q1, median:median, q3:q3, interquartilerange:interquartilerange, max:max}},
        function(d){return d.type_1;});
    

    for (const t of typeStats.keys()) {
        pokemonTypes.push(t);
    }
    
    // Draw the x axis
    let x = d3.scaleBand()
    .range([0, width])
    .domain(typeStats.keys())
    svg.append("g")
        .attr("transform", "translate(0,"+height+")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

    // Colors
    let c = {Grass:"#78c850",Fire:"#F08030",Water:"#6890f0",Bug:"#a8b820",Normal:"#a8a878",Dark:"#000000",Poison:"#a040a0",Electric:"#f8d030",Ground:"#e0c068",Ice:"#98D8D8",Fairy:"#ee99ac",Steel:"#b8b8d0",Fighting:"#c03028",Psychic:"#f85888",Rock:"#b8a038",Ghost:"#705898",Dragon:"#7038f8",Flying:"#a890f0"}

    // Draw the y axis
    let y = d3.scaleLinear()
        .domain([0,255])
        .range([height, 0])
    svg.append("g").call(d3.axisLeft(y));

    // Draw the min/max range line
    // We draw it first so it's behind the rectangle
    svg.selectAll("verticalLine")
        .data(typeStats)
        .enter()
            .append("line")
            .attr("x1", function(d){return x(d[0])+11.944444444444445})
            .attr("x2", function(d){return x(d[0])+11.944444444444445})
            .attr("y1", function(d){return y(d[1].min)})
            .attr("y2", function(d){return y(d[1].max)})
            .attr("stroke", "black")
            .style("width", 40);

    // Draw the interquartile rectangle
    let boxWidth= 10;
    let halfOffset = 11.944444444444445 - 5;
    svg.selectAll("boxes")
        .data(typeStats)
        .enter()
        .append("rect")
            .attr("x",function(d){return(x(d[0])+halfOffset)})
            .attr("y",function(d){return(y(d[1].q3))})
            .attr("height",function(d){return(y(d[1].q1) - y(d[1].q3))})
            .attr("width", boxWidth)
            .attr("stroke","black")
            .style("fill",function(d){return(c[d[0]])});
}

function readPokemonTypes(){
    d3.csv("../typeadvantage.csv").then( function(data) {
        buildHeatMap(data);
    });
}

function buildHeatMap(data){
    // Build the x axis
    let x = d3.scaleBand()
        .range([0,width])
        .domain(pokemonTypes)
        .padding(0.01);
    heatmapsvg.append("g")
        .attr("transform","translate(0,"+ height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

    // Build the y axis
    let y = d3.scaleBand()
        .range([height,0])
        .domain(pokemonTypes);
    heatmapsvg.append("g")
        .call(d3.axisLeft(y))
    
    // heatmap colors
    let c = {"0.5":"#f51d0a","1":"#d8e3d8","2":"#119c13"};

    // Create the tooltip
    let tooltip = d3.select("body").append("div").attr("class", "toolTip");

    // Draw the heatmap squares
    for(const t of pokemonTypes){
        heatmapsvg.selectAll()
        .data(data)
        .enter()
        .append("rect")
            .attr("x",x(t))
            .attr("y",function(d){return y(d.Attacking)})
            .attr("width",x.bandwidth())
            .attr("height",y.bandwidth())
            .style("fill", function(d){return(c[d[t]])})
            .style("cursor","crosshair")
            .on("mousemove", function (d,e) {
                tooltip
                    .style("left", event.pageX - 250 + "px")
                    .style("top", event.pageY - 40 + "px")
                    .style("display", "inline-block")
                    .html(determineToolTip(e.Attacking, t, e[t]));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); })
    }
}

function determineToolTip(t1,t2,number){
    if(number === "1"){
        return "" + t1 + " is normal effective against " + t2 +" types.";
    }else if(number === "0.5"){
        return "" + t1 + " is not very effective against " + t2 +" types.";
    }else if(number === "2"){
        return "" + t1 + " is super effective against " + t2 +" types.";
    }else{
        return "" + t1 + " does not effect " + t2 +" types.";
    }
}

statlist.addEventListener("change", function () {
    document.getElementById("boxplot").innerHTML="";

    svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom)
    .append("g")
    .attr("transform","translate("+ margins.left + "," + margins.top + ")");

    if (statlist.value === "HP") {
        buildBoxPlot(pokedexData,"hp");
    } else if (statlist.value === "Attack") {
        buildBoxPlot(pokedexData,"attack");
    } else if (statlist.value === "Defense") {
        buildBoxPlot(pokedexData,"defense");
    } else if (statlist.value === "Sp Defense") {
        buildBoxPlot(pokedexData,"sp_defense");
    } else if (statlist.value === "Sp Attack") {
        buildBoxPlot(pokedexData,"sp_attack");
     } else {
        buildBoxPlot(pokedexData,"speed");
    }
});

