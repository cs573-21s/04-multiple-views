let x = generateSplom();

function generateSplom(){
    let width = 1200;
    let padding = 20;
    let size;

    let c = {Grass:"#78c850",Fire:"#F08030",Water:"#6890f0",Bug:"#a8b820",Normal:"#a8a878",Dark:"#000000",Poison:"#a040a0",Electric:"#f8d030",Ground:"#e0c068",Ice:"#98D8D8",Fairy:"#ee99ac",Steel:"#b8b8d0",Fighting:"#c03028",Psychic:"#f85888",Rock:"#b8a038",Ghost:"#705898",Dragon:"#7038f8",Flying:"#a890f0"}

    let pokemonData = [];

    let columns = [];

    d3.csv("../pokedex.csv").then( function(data) {
        pokemonData = data;
        columns = data.columns.filter(d => filterStats(d));
        size = (width - (columns.length + 1) * padding) / columns.length + padding;
        buildSplom(data);
    });

    let x;
    let y;

    function buildSplom(data){
        let svg = d3.create("svg")
            .attr("width",width)
            .attr("viewBox",[-padding,0,width,width]);
        
        svg.append("style")
            .text(`circle.hidden{fill:#000;fill-opacity:1;r:1px;}`);

        x = columns.map(c => d3.scaleLinear()
            .domain(d3.extent(data, d=>parseInt(d[c])))
            .rangeRound([padding/2, size - padding/2]));

        y = x.map(x => x.copy().range([size-padding/2,padding/2]));

        svg.append("g")
            .call(xAxis());

        svg.append("g")
            .call(yAxis());
        
        let cell = svg.append("g")
            .selectAll("g")
            .data(d3.cross(d3.range(columns.length),d3.range(columns.length)))
            .join("g")
                .attr("transform",([i,j]) => `translate(${i*size},${j*size})`);

        cell.append("rect")
            .attr("fill","none")
            .attr("stroke","#aaa")
            .attr("x",padding/2+0.5)
            .attr("y",padding/2 + 0.5)
            .attr("width",size - padding)
            .attr("height",size - padding);

        cell.each(function([i,j]){
            d3.select(this).selectAll("circle")
                .data(data.filter(d=> !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
                .join("circle")
                    .attr("cx",d=>x[i](d[columns[i]]))
                    .attr("cy",d=>y[j](d[columns[j]]));
        });

        let circle = cell.selectAll("circle")
            .attr("r",3.5)
            .attr("fill", d => c[d.type_1]);

        cell.call(brush,circle,svg,data);

        svg.append("g")
            .style("font","bold 10px sans-serif")
            .style("pointer-events", "none")
            .selectAll("text")
            .data(columns)
            .join("text")
                .attr("transform",(d,i)=>`translate(${i*size},${i*size})`)
                .attr("x",padding)
                .attr("y",padding)
                .attr("dy",".71em")
                .text(d=>d);

        svg.property("value",[]);
        document.getElementById("scattermatrix").appendChild(svg.node());
    }

    function xAxis(){
        let axis = d3.axisBottom()
            .ticks(6)
            .tickSize(size * columns.length);
        return g => g.selectAll("g").data(x).join("g")
                        .attr("transform",(d,i)=>`translate(${i*size},0)`)
                        .each(function(d){return d3.select(this).call(axis.scale(d));})
                        .call(g=>g.select(".domain").remove())
                        .call(g=>g.selectAll(".tick line").attr("stroke","#eee"));
    }

    function yAxis(){
        let axis = d3.axisLeft()
            .ticks(6)
            .tickSize(-size * columns.length);
        return g => g.selectAll("g").data(y).join("g")
                        .attr("transform",(d,i)=>`translate(0,${i*size})`)
                        .each(function(d){return d3.select(this).call(axis.scale(d));})
                        .call(g=>g.select(".domain").remove())
                        .call(g=>g.selectAll(".tick line").attr("stroke","#eee"));
    }

    function filterStats(d) {
        if (d === "hp" || d === "attack" || d === "defense" || d === "sp_attack" || d === "sp_defense" || d === "speed") {
            return true;
        }
        return false;
    }

    function brush(cell, circle, svg, data){
        let brush = d3.brush()
            .extent([[padding/2,padding/2],[size-padding/2,size-padding/2]])
            .on("start",brushstarted)
            .on("brush",brushed)
            .on("end",brushend);
        
        cell.call(brush);

        let brushcell;

        function brushstarted(){
            if(brushcell !== this){
                d3.select(brushcell).call(brush.move, null);
                brushcell = this;
            }
        }

        function brushed({selection}, [i,j]){
            let selected = [];
            if(selection){
                let [[x0,y0],[x1,y1]] = selection;
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
            svg.property("value",selected).dispatch("input");
        }

        function brushend({selection}){
            if(selection){
                return;
            }
            svg.property("value",[]).dispatch("input");
            circle.classed("hidden",false);
        }
    }
}