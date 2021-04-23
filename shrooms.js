var cmap = d3.schemeDark2
    console.log(cmap)

    var shroom_data

    // set the dimensions and margins of the page
    var margin = 50
    var title_margin = 150
    var width = window.innerWidth - margin
    var height = window.innerHeight - title_margin

    // append the svg object to the body of the page
    // var svg = d3.select("#svgcontainer")
    //     .append("svg")
    //         .attr("width", width/2)
    //         .attr("id", "page-svg")
            // .attr("height", height)

    

    //Read the data
    d3.csv("https://raw.githubusercontent.com/jwu2018/04-multiple-views/main/data/cleaned_mushrooms.csv")
        .then(function(data) {
            shroom_data = data
            console.log('got data', shroom_data) 
    })

    build_shroom_filters();
    build_poisonous_predictor();
    
    /**----------------------------------------------------------------------------------------
     *                                     SHROOM FILTERS
     *----------------------------------------------------------------------------------------**/
    function get_color(color) {
        if (color == "buff") {
            return "#DAA06D"
        } else if (color == "cinnamon") {
            return "#D2691E"
        }
        return color
    }

    function build_shroom_filters() {
        // Lists of possible colors
        var cap_colors = ["brown", "buff", "cinnamon", "gray", "green", "pink", "purple", "red",
            "white", "yellow"]
        var gill_colors = ["black", "brown", "buff", "chocolate", "gray", "green", "orange", "pink", 
            "purple", "red", "white", "yellow"]


        /*-------------------------------- Initialize the Buttons ------------------------------*/
        // Cap color
        var cap_color_button = d3.select("#svgcontainer")
            .append('select')
            // .attr('y', 70)

        cap_color_button // Add a button
            .selectAll('myOptions')
                .data(cap_colors)
            .enter()
                .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }) // corresponding value returned by the button


        /*-------------------------------- Initialize Shroom Graphics ------------------------------*/
        
        var cap = d3.select("#svgcontainer")
            .append("svg")
            .append("circle")
                .attr("cx", 100)
                .attr("cy", 70)
                .attr("stroke", "black")
                .style("fill", "brown")
                .attr("r", 20)
                .attr("id", "cap")

        // A function that update the color of the circle
        function update_shroom_color(mycolor, element_tag) {
            d3.select(element_tag)
                .transition()
                .duration(500)
                .style("fill", mycolor)
        }

        // When the button is changed, run the update_shroom_color function
        cap_color_button.on("change", function(d) {
            var selectedOption = d3.select(this).property("value")
            update_shroom_color(get_color(selectedOption), "#cap")
        })
    }


    /**----------------------------------------------------------------------------------------
     *                                 POISONOUS PREDICTOR
     *----------------------------------------------------------------------------------------**/
    function build_poisonous_predictor() {
        // // set the dimensions and margins of the graph
        // var width = 450
        // height = 450
        // margin = 40

        // // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        // var radius = Math.min(width, height) / 2 - margin

        // var svg = d3.select("#piecontainer")
        //     .append("svg")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .append("g")
        //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // // Create dummy data
        // var data = {a: 9, b: 20, c:30, d:8, e:12}

        // // console.log(Object.keys(data))

        // // set the color scale
        // var color = d3.scaleOrdinal()
        //     .domain(Object.keys(data))
        //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

        // // Compute the position of each group on the pie:
        // var pie = d3.pie()
        //     .value(function(d) {return d.value; })

        // // console.log(pie)

        // data_ready = pie(Object.entries(data))

        // console.log(data_ready)

        // // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        // svg
        //     .selectAll('whatever')
        //     .data(data_ready)
        //     .enter()
        //     .append('path')
        //     .attr('d', d3.arc()
        //         .innerRadius(0)
        //         .outerRadius(radius)
        //     )
        //     .attr('fill', function(d){ return(color(d.data.key)) })
        //     .attr("stroke", "black")
        //     .style("stroke-width", "2px")
        //     .style("opacity", 0.7)


        var data = [1.1,2.2,4.46,2.12,1.36,5.002445,4.1242];

        
        console.log(d3.sum(shroom_data, function(d){return parseFloat(d.class_binary)}))
  
        // Selecting SVG using d3.select()
        var svg = d3.select("#piecontainer")
            .append('svg')
            .attr('height', 200)
  
        let g = svg.append("g")
               .attr("transform", "translate(150, 100)");
          
        // Creating Pie generator
        var pie = d3.pie();
  
        // Creating arc
        var arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(100);
  
        // Grouping different arcs
        var arcs = g.selectAll("arc")
                    .data(pie(data))
                    .enter()
                    .append("g");
  
        // Appending path 
        arcs.append("path")
            .attr("fill", (data, i)=>{
                let value=data.data;
                return d3.schemeSet3[i];
            })
            .attr("d", arc);
    }
