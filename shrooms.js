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

var filters_list = ["Cap Color"]


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
        // console.log('data length', data_length)
        
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
        d3.select("#piesvg").remove()
        d3.select('#barsvg').remove()
    }

    function reset_data() {
        current_data = shroom_data
        foo_data = [current_data]
        
        // current_data = current_data.filter(s => filters.every(t => {
        //   var key = Object.keys(t)[0];
        //   return s[key] == t[key]
        // }));

        // console.log('new cap color', filters.spec_cap_color)

        current_data=data.filter(function(row){return row.cap_color != filters.spec_cap_color;});

        // current_data = current_data.filter(function(d){ 
        //     console.log('d', d)
        //     return d.cap_color != filters.spec_cap_color 
        // })

        // console.log('new data', current_data)
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
            .attr('height', height / 3)
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

        /*-------------------------------- Buttons Changed ------------------------------*/
        // When the button is changed, run the update_shroom_color function
        cap_color_button.on("change", function(d) {
            var selectedOption = d3.select(this).property("value")

            filters.spec_cap_color = selectedOption
            console.log('just changed cap color to', filters.spec_cap_color)
            
            update_shroom_color(get_color(filters.spec_cap_color), "#cap")
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

        let svg = d3.select("#barcontainer")
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .attr('id', 'barsvg')
        // let margin = 200,
        // width = svg.attr("width") - margin,
        // height = svg.attr("height") - margin;


        let xScale = d3.scaleBand().range ([0, width]).padding(0.4),
            yScale = d3.scaleLinear().range ([height/3, 0]);

        let g = svg.append("g")
            .attr("transform", "translate(" + 50 + "," + 50 + ")");

        xScale.domain(filters_list);
        yScale.domain([0, 100]);

        g.append("g")
            .attr("transform", "translate(0," + height/3 + ")")
            .call(d3.axisBottom(xScale));

        g.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function(d){
                return d + "%";
            }).ticks(10))
            .append("text")
            // .attr("y", 6)
            // .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            // .text("value");



        // Cap color bar
        // console.log('length of shroom data', shroom_data.length)
        // console.log(filters.spec_cap_color)
        let percentage = d3.sum(shroom_data, function(d){
            // console.log(d.cap_color, filters.spec_cap_color)
            if (d.cap_color == filters.spec_cap_color) {
                // console.log('data cap color', d.cap_color, 'spec cap color', filters.spec_cap_color)
                return 1
            }
            else {return 0}
        }) 

        // console.log('sum', percentage)
        
        percentage = percentage / data_length * 100

        // console.log('percentage', percentage)

        // console.log('x', xScale("Cap Color"))
        // console.log('y', yScale(percentage))
        // console.log('width', xScale.bandwidth())
        // console.log('height', height/3 - yScale(percentage))

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr('fill', get_color(filters.spec_cap_color))
            .attr("x", xScale("Cap Color"))
            .attr("y", yScale(percentage))
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) { return height/3 - yScale(percentage); });
    
        svg.append("text")
            // .attr("transform", "translate(100,0)")
            .attr("x", width/2)
            .attr("y", 50)
            .attr("font-size", "24px")
            .style("text-anchor", "middle")
            .text("Percentage of Mushrooms with Each Characteristic")


        g.append("g")
            // .attr("transform", "translate(0," + height + ")")
            // .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", height/2 - 50)
            .attr("x", width/2)
            .attr("text-anchor", "end")
            // .attr("stroke", "black")
            .text("Characteristic");
    }
})