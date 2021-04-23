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

/*-------------------------------- SHROOM FILTERS ------------------------------*/
var filters = [
    {cap_color: ''},
    {gill_color: ''},
    {stalk_color_above_ring: ''},
    {stalk_color_below_ring: ''}
]
var filters_list = [
    'Cap Color', 
    'Gill Color', 
    'Stalk Color Above Ring', 
    'Stalk Color Below Ring'
]


/**----------------------------------------------------------------------------------------
 *                                     READ THE DATA
 *----------------------------------------------------------------------------------------**/
d3.csv('https://raw.githubusercontent.com/jwu2018/04-multiple-views/main/data/cleaned_mushrooms.csv')
    .then(function(data) {
        filters.cap_color = 'brown'
        filters.gill_color = 'black'
        filters.stalk_color_above_ring = 'brown'
        filters.stalk_color_below_ring = 'brown'
        build_shroom_filters();

        shroom_data = data
        current_data = shroom_data
        
        data_length = current_data.length
        
        console.log('got data', current_data)
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
        d3.select('#piesvg').remove()
        d3.select('#barsvg').remove()
    }

    function reset_data() {
        current_data = shroom_data
        current_data=data.filter(function(row){
            return ((row.cap_color != filters.cap_color) &&
                (row.gill_color != filters.gill_color) &&
                (row.stalk_color_above_ring != filters.stalk_color_above_ring) &&
                (row.stalk_color_below_ring != filters.stalk_color_below_ring)
            )}
        );
    }


    /**----------------------------------------------------------------------------------------
     *                                     SHROOM FILTERS
     *----------------------------------------------------------------------------------------**/
    function get_color(color) {
        if (color == 'buff') {
            return '#DAA06D'
        } else if (color == 'cinnamon') {
            return '#D2691E'
        }
        return color
    }

    function build_shroom_filters() {
        // Lists of possible colors
        var cap_colors = ['brown', 'buff', 'cinnamon', 'gray', 'green', 'pink', 'purple', 'red',
            'white', 'yellow']
        var gill_colors = ['black', 'brown', 'buff', 'chocolate', 'gray', 'green', 'orange', 'pink', 
            'purple', 'red', 'white', 'yellow']
        var stalk_colors = ['brown', 'buff', 'cinnamon', 'gray', 'orange', 'pink', 
            'red', 'white', 'yellow']

        document.getElementById('filtercontainer').setAttribute("style",
            "width:"+width/2+"px; background-color: grey; float=left");
        document.getElementById('shroomcontainer').setAttribute("style",
            "width:"+width/2+"px; background-color: red; float=right")


        /*-------------------------------- Initialize the Buttons ------------------------------*/

        /*------- Cap color -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin', margin+'px')
                .style('text-anchor', 'middle')
                .style('font-size', '15px')
                .text("Cap Color")

        var cap_color_button = d3.select('#filtercontainer')
            .append('select')
            // .append("tspan")
            // .attr('dy', '5em')
            // .attr('height', height/3)

        cap_color_button // Add a button
            .selectAll('myOptions')
                .data(cap_colors)
            .enter()
                .append('option')
            .text(function (d) { return d; }) // text showed in the dropdown menu
            .attr('value', function (d) { return d; }) // corresponding value returned by the button
            .attr('x', 200)

        d3.select('#filtercontainer')
            .append('br')


        /*------- Gill color -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin', margin+'px')
                .style('text-anchor', 'middle')
                .style('font-size', '15px')
                .text("Gill Color")


        var gill_color_button = d3.select('#filtercontainer')
            .append('select')
            .attr("dy", "4em")
            // .attr('height', height / 3)

        gill_color_button // Add a button
            .selectAll('myOptions')
                .data(gill_colors)
            .enter()
                .append('option')
            .text(function (d) { return d; }) // text showed in the dropdown menu
            .attr('value', function (d) { return d; }) // corresponding value returned by the button

        d3.select('#filtercontainer')
            .append('br')


        /*------- Stalk color above ring -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin', margin+'px')
                .style('text-anchor', 'middle')
                .style('font-size', '15px')
                .text("Stalk Color Above Ring")
        
        var stalk_a_ring_color_button = d3.select('#filtercontainer')
            .append('select')
            // .attr('height', height / 3)

        stalk_a_ring_color_button // Add a button
            .selectAll('myOptions')
                .data(stalk_colors)
            .enter()
                .append('option')
            .text(function (d) { return d; }) // text showed in the dropdown menu
            .attr('value', function (d) { return d; }) // corresponding value returned by the button

        d3.select('#filtercontainer')
            .append('br')


        /*------- Stalk color below ring -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin', margin+'px')
                .style('text-anchor', 'middle')
                .style('font-size', '15px')
                .text("Stalk Color Below Ring")

        var stalk_b_ring_color_button = d3.select('#filtercontainer')
            .append('select')
            // .attr('height', height / 3)

        stalk_b_ring_color_button // Add a button
            .selectAll('myOptions')
                .data(stalk_colors)
            .enter()
                .append('option')
            .text(function (d) { return d; }) // text showed in the dropdown menu
            .attr('value', function (d) { return d; }) // corresponding value returned by the button

        d3.select('#filtercontainer')
            .append('br')


        /*-------------------------------- Initialize Shroom Graphics ------------------------------*/
        var shroom_svg = d3.select('#customizingcontainer')
            .append('svg')
            .attr('width', width / 2)
            .attr('x', width/2)
            // .style('float', 'left')

        var cap = shroom_svg
            // .append('svg')
            .append('circle')
                .attr('cx', margin)
                .attr('cy', margin)
                .attr('stroke', 'black')
                .style('fill', 'brown')
                .attr('r', 20)
                .attr('id', 'cap')

        var gill = shroom_svg
            // .append('svg')
            .append('circle')
                .attr('cx', 3*margin)
                .attr('cy', margin)
                .attr('stroke', 'black')
                .style('fill', 'black')
                .attr('r', 20)
                .attr('id', 'gill')

        var stalk_a_ring = shroom_svg
            // .append('svg')
            .append('circle')
                .attr('cx', 5*margin)
                .attr('cy', margin)
                .attr('stroke', 'black')
                .style('fill', 'brown')
                .attr('r', 20)
                .attr('id', 'stalk_a_ring')

        var stalk_b_ring = shroom_svg
            // .append('svg')
            .append('circle')
                .attr('cx', 7*margin)
                .attr('cy', margin)
                .attr('stroke', 'black')
                .style('fill', 'brown')
                .attr('r', 20)
                .attr('id', 'stalk_b_ring')

        // A function that update the color of the circle
        function update_shroom_color(mycolor, element_tag) {
            d3.select(element_tag)
                .transition()
                .duration(500)
                .style('fill', mycolor)
        }

        /*-------------------------------- Buttons Changed ------------------------------*/
        // When the button is changed, run the update_shroom_color function
        cap_color_button.on('change', function(d) {
            var selectedOption = d3.select(this).property('value')

            filters.cap_color = selectedOption
            console.log('just changed cap color to', filters.cap_color)
            
            update_shroom_color(get_color(filters.cap_color), '#cap')
            update_charts()
        })

        gill_color_button.on('change', function(d) {
            var selectedOption = d3.select(this).property('value')

            filters.gill_color = selectedOption
            console.log('just changed gill color to', filters.gill_color)
            
            update_shroom_color(get_color(filters.gill_color), '#gill')
            update_charts()
        })

        stalk_a_ring_color_button.on('change', function(d) {
            var selectedOption = d3.select(this).property('value')

            filters.stalk_color_above_ring = selectedOption
            console.log('just changed stalk above ring color to', filters.stalk_color_above_ring)
            
            update_shroom_color(get_color(filters.stalk_color_above_ring), '#stalk_a_ring')
            update_charts()
        })

        stalk_b_ring_color_button.on('change', function(d) {
            var selectedOption = d3.select(this).property('value')

            filters.stalk_color_below_ring = selectedOption
            console.log('just changed stalk below ring color to', filters.stalk_color_below_ring)
            
            update_shroom_color(get_color(filters.stalk_color_below_ring), '#stalk_b_ring')
            update_charts()
        })
    }


    /**----------------------------------------------------------------------------------------
     *                                POISONOUS PREDICTOR (PIE)
     *----------------------------------------------------------------------------------------**/
    function build_poisonous_predictor() {
        // let height = 300
        // document.getElementById('chartscontainer').style.width = width/2;

        // Get fraction that is edible
        let fraction_edible = d3.sum(current_data, function(d){return parseFloat(d.class_binary)}) / 
            current_data.length

        // Generate data for pie chart
        var data = [fraction_edible, 1 - fraction_edible]

        // Create svg for pie chart
        var svg = d3.select('#chartscontainer')
            .append('svg')
            .attr('height', height / 2)
            .attr('width', width / 2)
            .attr('id', 'piesvg')
            // .attr('fill', )

        let g = svg.append('g')
            .attr('transform', 'translate('+width/4+', '+ height/5+')');
            
        // Creating Pie generator
        var pie = d3.pie();

        // Creating arc
        var arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(100);

        // Grouping different arcs
        var arcs = g.selectAll('arc')
                    .data(pie(data))
                    .enter()
                    .append('g');


        // Appending path 
        arcs.append('path')
            .attr('fill', (data, i)=>{
                let value=data.data
                if (i == 0) {return 'white'}
                else {return 'black'}
            })
            .attr('stroke', 'black')
            .attr('d', arc);

        // Appending Text
        svg.append('svg:text')
            .attr('x',width / 4)
            .attr('y',height/2 - margin)
            .style('text-anchor', 'middle')
            .style('font-size', '15px')
            .text(((1-fraction_edible) * 100).toFixed(2) + 
                '% of mushrooms with these characteristics are poisonous.')
    }


    /**----------------------------------------------------------------------------------------
     *                                    BAR CHARTS
     *----------------------------------------------------------------------------------------**/
     function build_barchart() {
        // document.getElementById('chartscontainer').style.width = 100

        let svg = d3.select('#chartscontainer')
            .append('svg')
            .attr('height', height/2)
            .attr('width', width/2)
            .attr('id', 'barsvg')

        let xScale = d3.scaleBand().range ([0, width/2 - 2*margin]).padding(0.4),
            yScale = d3.scaleLinear().range ([height/3, 0]);

        let g = svg.append('g')
            .attr('transform', 'translate(' + 2*margin + ',' + 2*margin + ')');

        xScale.domain(filters_list);
        yScale.domain([0, 100]);

        g.append('g')
            .attr('transform', 'translate(0,' + height/3 + ')')
            .call(d3.axisBottom(xScale));

        g.append('g')
            .call(d3.axisLeft(yScale).tickFormat(function(d){
                return d + '%';
            }).ticks(10))
            .append('text')
            .attr('text-anchor', 'end')


        /*-------------------------------- GENERATE DATA ------------------------------*/
        let cap_percentage = d3.sum(shroom_data, function(d){
            if (d.cap_color == filters.cap_color) {return 1}
            else {return 0}
        }) / data_length * 100

        let gill_percentage = d3.sum(shroom_data, function(d){
            if (d.gill_color == filters.gill_color) {return 1}
            else {return 0}
        }) / data_length * 100

        let stalk_a_ring_percentage = d3.sum(shroom_data, function(d){
            if (d.stalk_color_above_ring == filters.stalk_color_above_ring) {return 1}
            else {return 0}
        }) / data_length * 100

        let stalk_b_ring_percentage = d3.sum(shroom_data, function(d){
            if (d.stalk_color_below_ring == filters.stalk_color_below_ring) {return 1}
            else {return 0}
        }) / data_length * 100

        let bar_data = [
            {characteristic: "Cap Color", color: filters.cap_color, percentage: cap_percentage}, 
            {characteristic: 'Gill Color', color: filters.gill_color, percentage: gill_percentage}, 
            {characteristic: 'Stalk Color Above Ring', color: filters.stalk_color_above_ring, 
                percentage: stalk_a_ring_percentage},
            {characteristic: 'Stalk Color Below Ring', color: filters.stalk_color_below_ring, 
                percentage: stalk_b_ring_percentage}
        ]

        /*-------------------------------- BARS ------------------------------*/
        g.selectAll('.bar')
            .data(bar_data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('fill', function(d) {return get_color(d.color)})
            .attr('x', function(d) {return xScale(d.characteristic)})
            .attr('y', function(d) {return yScale(d.percentage)})
            .attr('width', xScale.bandwidth())
            .attr('height', function(d) {return height/3 - yScale(d.percentage)})
    
        /*-------------------------------- TITLE ------------------------------*/
        svg.append('text')
            .attr('x', width/4)
            .attr('y', margin)
            // .attr('font-size', '15px')
            .style('text-anchor', 'middle')
            .text('Percentage of Mushrooms with Each Characteristic')


        // g.append('g')
        //     .append('text')
        //     .attr('y', height/2 - 50)
        //     .attr('x', width/4)
        //     .attr('font-size', '12px')
        //     .attr('text-anchor', 'end')
        //     .text('Characteristic');
    }
})