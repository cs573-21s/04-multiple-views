var cmap = d3.schemeDark2
    console.log(cmap)

    // set the dimensions and margins of the graph
    var margin = 50
    var title_margin = 150
    var width = window.innerWidth - margin
    var height = window.innerHeight - title_margin;

    // append the svg object to the body of the page
    var svg = d3.select("#svgcontainer")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform",
                "translate(" + margin + "," + margin + ")");

    //Read the data
    d3.csv("data/cleaned_mushrooms.csv", function(data) {
        console.log('got data', data)
        // Add X axis
        // var x = d3.scaleLinear()
        //     .domain([1500, 5250])
        //     .range([ 0, width - margin]);
        // svg.append("g")
        //     .attr("transform", "translate(0," + (height - title_margin) + ")")
        //     .call(d3.axisBottom(x));
        //     svg.append("text")
        //     .attr("text-anchor", "end")
        //     .attr("x", width/2)
        //     .attr("y", height - 2*margin)
        //     .text("Weight");

        // // Add Y axis
        // var y = d3.scaleLinear()
        //     .domain([5, 50])
        //     .range([ height - title_margin, 0]);
        // svg.append("g")
        //     .call(d3.axisLeft(y));
        // svg.append("text")
        //     .attr("text-anchor", "end")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", -2*margin/3)
        //     .attr("x", (height-title_margin-margin)/-2 + 20)
        //     .text("MPG")

        // // Add a scale for bubble size
        // var z = d3.scaleLinear()
        //     .domain([1000, 5000])
        //     .range([ 1, 30]);

        // // color by manufacturer
        // var color = d3.scaleOrdinal()
        //     .domain(["ford", "toyota", "bmw", 'honda', 'mercedes'])
        //     .range(cmap)
        
        // // bubble chart
        // svg.append("g")
        //     .selectAll("circle")
        //     .data(data)
        //     .join("circle")
        //     .attr("cx", d => x(d.Weight))
        //     .attr("cy", d => y(d.MPG))
        //     .attr("r", d => z(d.Weight))
        //     .attr('fill-opacity', 0.5)
        //     .attr("fill", d => color(d.Manufacturer));
        
    })