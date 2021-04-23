/**------------------------------------------------------------------------
 * ?                                ABOUT
 * @author         :  Jyalu Wu
 * @repo           :  https://github.com/jwu2018/04-multiple-views
 * @description    :  Assignment 4: Multiple Views
 *------------------------------------------------------------------------**/

// var csv = require('./jquery.csv.js')

var shroom_data
var current_data
var data_length

// set the dimensions and margins of the page
var margin = 25
var title_margin = 150
var width = window.innerWidth - 2*margin
var height = window.innerHeight - title_margin

// shroom filters
var filters = [
    {spec_cap_color: ""}
]


// append the svg object to the body of the page
// var svg = d3.select("#svgcontainer")
//     .append("svg")
//         .attr("width", width/2)
//         .attr("id", "page-svg")
        // .attr("height", height)


/**----------------------------------------------------------------------------------------
 *                                     READ THE DATA
 *----------------------------------------------------------------------------------------**/
d3.csv("https://raw.githubusercontent.com/jwu2018/04-multiple-views/main/data/cleaned_mushrooms.csv")
    .then(function(data) {
        filters.spec_cap_color = "brown"
        build_shroom_filters();

        shroom_data = data
        current_data = shroom_data
        
        data_length = current_data.length
        console.log('data length', data_length)
        
        console.log('got data', current_data) 
        // console.log('data type', typeof current_data)
        // console.log('data entry type', typeof current_data[0])
        // console.log('first entry', current_data[0])

        // current_data = $.csv.toObjects(data)

        update_charts();



    /**----------------------------------------------------------------------------------------
     *                              RESET DATA AND UPDATE CHARTS
     *----------------------------------------------------------------------------------------**/
    function update_charts() {
        reset_data()
        remove_charts()
        build_poisonous_predictor()
        build_barchart()
    }

    function remove_charts() {
        d3.select("#piesvg").remove();
    }

    function reset_data() {
        current_data = shroom_data
        foo_data = [current_data]
        
        // current_data = current_data.filter(s => filters.every(t => {
        //   var key = Object.keys(t)[0];
        //   return s[key] == t[key]
        // }));

        console.log('new cap color', filters.spec_cap_color)

        current_data=data.filter(function(row){return row.cap_color != filters.spec_cap_color;});

        // current_data = current_data.filter(function(d){ 
        //     console.log('d', d)
        //     return d.cap_color != filters.spec_cap_color 
        // })

        console.log('new data', current_data)
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
        var cap_color_button = d3.select("#filtercontainer")
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
        var cap = d3.select("#filtercontainer")
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
                // .duration(500)
                .style("fill", mycolor)
        }

        /*-------------------------------- Button Changed ------------------------------*/
        // When the button is changed, run the update_shroom_color function
        cap_color_button.on("change", function(d) {
            var selectedOption = d3.select(this).property("value")

            filters.spec_cap_color = get_color(selectedOption)
            console.log('just changed color to', filters.spec_cap_color)
            
            update_shroom_color(filters.spec_cap_color, "#cap")
            update_charts()
        })
    }


    /**----------------------------------------------------------------------------------------
     *                                 POISONOUS PREDICTOR
     *----------------------------------------------------------------------------------------**/
    function build_poisonous_predictor() {
        let height = 300

        // Get fraction that is edible
        let fraction_edible = d3.sum(current_data, function(d){return parseFloat(d.class_binary)}) / 
            current_data.length

        // Generate data for pie chart
        var data = [fraction_edible, 1 - fraction_edible]

        // Create svg for pie chart
        var svg = d3.select("#piecontainer")
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .attr('id', 'piesvg')

        let g = svg.append("g")
            .attr("transform", "translate("+width/2+", 100)");
            
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
                let value=data.data
                if (i == 0) {return "white"}
                else {return "red"}
                // return d3.schemeTableau10[i];
            })
            .attr("d", arc);

        // Appending Text
        svg.append("svg:text")
            .attr("x",width / 2 + margin)
            .attr("y",height - 2*margin)
            .style("text-anchor", "middle")
            .style('font-size', '15px')
            .text(((1-fraction_edible) * 100).toFixed(2) + 
                "% of mushrooms with these characteristics are poisonous.")
    }


    /**----------------------------------------------------------------------------------------
     *                                 BAR CHARTS
     *----------------------------------------------------------------------------------------**/
     function build_barchart() {
    
        let numBars = filters.length
        let max = Math.max.apply(null, data)
    
        // let markedBars = indices_to_compare(10)
        // let markedBars = indices

        // Create svg for bar chart
        var svg = d3.select("#barcontainer")
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .attr('id', 'barsvg')
    
        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0]);
    
        // plain lines for axes - no ticks or numbers 
        svg.append('line')
            .attr('x1', margin)
            .attr('y1', height)
            .attr('x2', margin)
            .attr('y2', margin)
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('id', 'yAxis')
        svg.append('line')
            .attr('x1', margin)
            .attr('y1', height)
            .attr('x2', width - 2*margin)
            .attr('y2', height)
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('id', 'xAxis')
    
        // Bars
        let interval = width / numBars / 10
        let barWidth = width / numBars / 5 * 4
        for (let i = 0; i < numBars; i++) {
            svg.append('rect')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('x', i * (interval * 2 + barWidth) + interval)
                .attr('y', y(data[i]))
                .attr('height', height - y(data[i]))
                .attr('width', barWidth)
            if (i === markedBars.random_idx || i === markedBars.other_idx) {
                svg.append('circle')
                    .attr('r', barWidth / 8)
                    .attr('cy', height - interval * 2)
                    .attr('cx', i * (interval * 2 + barWidth) + interval + barWidth / 2)
                    .attr('fill', 'black')
            }
        }
    }
})