var cmap = d3.schemeDark2
    console.log(cmap)

    var shroom_data
    var current_data

    // set the dimensions and margins of the page
    var margin = 50
    var title_margin = 150
    var width = window.innerWidth - margin
    var height = window.innerHeight - title_margin

    // shroom filters
    var spec_cap_color = ""

    // append the svg object to the body of the page
    // var svg = d3.select("#svgcontainer")
    //     .append("svg")
    //         .attr("width", width/2)
    //         .attr("id", "page-svg")
            // .attr("height", height)

    

    //Read the data
    d3.csv("https://raw.githubusercontent.com/jwu2018/04-multiple-views/main/data/cleaned_mushrooms.csv")
        .then(function(data) {

            build_shroom_filters();
            shroom_data = data
            current_data = data
            console.log('got data', shroom_data) 

            build_poisonous_predictor();
    })


    /**----------------------------------------------------------------------------------------
     *                                       RESET DATA
     *----------------------------------------------------------------------------------------**/
    function reset_data(cap_color) {
        current_data = shroom_data
    }
    
    
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
        cap_color = "brown"

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

        /*-------------------------------- Button Changed ------------------------------*/
        // When the button is changed, run the update_shroom_color function
        cap_color_button.on("change", function(d) {
            spec_cap_color = get_color(selectedOption)
            var selectedOption = d3.select(this).property("value")
            update_shroom_color(spec_cap_color, "#cap")
            
        })
    }


    /**----------------------------------------------------------------------------------------
     *                                 POISONOUS PREDICTOR
     *----------------------------------------------------------------------------------------**/
    function build_poisonous_predictor() {
        // Get fraction that is edible
        let fraction_edible = d3.sum(current_data, function(d){return parseFloat(d.class_binary)}) / 
            current_data.length

        // Generate data for pie chart
        var data = [fraction_edible, 1 - fraction_edible]
  
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
                    .data(pie(data.filter(function(d){ 
                        return d.cap_color == cap_color 
                    })))
                    .enter()
                    .append("g");
  
        // Appending path 
        arcs.append("path")
            .attr("fill", (data, i)=>{
                let value=data.data;
                return d3.schemeTableau10[i];
            })
            .attr("d", arc);
    }
