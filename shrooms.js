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
            "width:"+width/2+"px; height:"+height/2+"px; float:left");
        document.getElementById('shroomcontainer').setAttribute("style",
            "width:"+width/2+"px; height:"+height/2+"px;  float:left")


        /*-------------------------------- Initialize the Buttons ------------------------------*/

        /*------- Cap color -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin-left', 4*margin+'px')
                .style('margin-right', 7*margin+20+'px')
                .style('margin-top', margin+'px')
                .style('margin-bottom', margin+'px')
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
        d3.select('#filtercontainer')
            .append('br')

        /*------- Gill color -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin-left', 4*margin+'px')
                .style('margin-right', 8*margin+2+'px')
                .style('margin-top', margin+'px')
                .style('margin-bottom', margin+'px')
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
        d3.select('#filtercontainer')
            .append('br')


        /*------- Stalk color above ring -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin', 4*margin+'px')
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
        d3.select('#filtercontainer')
            .append('br')


        /*------- Stalk color below ring -------*/
        d3.select('#filtercontainer')
            .append('text')
                .style('margin', 4*margin+'px')
                .style('margin-right', 4*margin+4+'px')
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
        d3.select('#filtercontainer')
            .append('br')


        /*-------------------------------- Initialize Shroom Graphics ------------------------------*/
        
        var shroom_svg = d3.select('#shroomcontainer')
            .append('svg')
            .attr('width', width / 2)
            .attr('x', width/2)
            .attr('height', height/2)
            // .style('float', 'left')

        document.getElementById("shroomcontainer").setAttribute('x', width/2)

        let shrm_unit = (height/2 - 2*margin) / 10
        let mid_w = width/4
        let mid_h = height/4

        /*------- Cap -------*/
        let cap_points = [
            {'x':mid_w, 		            'y':mid_h-2*shrm_unit},
            {'x':mid_w-shrm_unit, 		'y':mid_h-1.75*shrm_unit},
            {'x':mid_w-2*shrm_unit, 		'y':mid_h-1.5*shrm_unit},
            {'x':mid_w-3*shrm_unit, 		'y':mid_h-shrm_unit},
            {'x':mid_w-3*shrm_unit, 		'y':mid_h-2*shrm_unit},
            {'x':mid_w-2.5*shrm_unit, 		'y':mid_h-3*shrm_unit},
            {'x':mid_w-1.5*shrm_unit, 		'y':mid_h-4*shrm_unit},
            {'x':mid_w-0.5*shrm_unit, 		'y':mid_h-4.5*shrm_unit},
            {'x':mid_w+0.5*shrm_unit, 		'y':mid_h-4.5*shrm_unit},
            {'x':mid_w+1.5*shrm_unit, 		'y':mid_h-4*shrm_unit},
            {'x':mid_w+2.5*shrm_unit, 		'y':mid_h-3*shrm_unit},
            {'x':mid_w+3*shrm_unit, 		'y':mid_h-2*shrm_unit},
            {'x':mid_w+3*shrm_unit, 		'y':mid_h-shrm_unit},
            {'x':mid_w+2*shrm_unit, 		'y':mid_h-1.5*shrm_unit},
            {'x':mid_w+shrm_unit, 		'y':mid_h-1.75*shrm_unit},
            {'x':mid_w, 		            'y':mid_h-2*shrm_unit}
        ]
        let cap = shroom_svg.append('polygon')
            .attr('points', points_string(cap_points))
            .attr('stroke', 'black')
            //.attr('points', '233, 135 233, 216 349, 270 466, 216 466, 135 407, 54 291, 54 233, 135')
            .attr('fill', 'brown')
            .attr('id', 'cap')

        /*------- Gill -------*/
        let gill_points = [
            {'x':mid_w, 		            'y':mid_h-2*shrm_unit},
            {'x':mid_w+shrm_unit, 		'y':mid_h-1.75*shrm_unit},
            {'x':mid_w+2*shrm_unit, 		'y':mid_h-1.5*shrm_unit},
            {'x':mid_w+3*shrm_unit, 		'y':mid_h-shrm_unit},
            {'x':mid_w+shrm_unit, 		'y':mid_h-0.5*shrm_unit},
            {'x':mid_w-shrm_unit, 		'y':mid_h-0.5*shrm_unit},
            {'x':mid_w-3*shrm_unit, 		'y':mid_h-shrm_unit},
            {'x':mid_w-2*shrm_unit, 		'y':mid_h-1.5*shrm_unit},
            {'x':mid_w-shrm_unit, 		'y':mid_h-1.75*shrm_unit},
            {'x':mid_w, 		            'y':mid_h-2*shrm_unit}
        ]
        let gill = shroom_svg.append('polygon')
            .attr('points', points_string(gill_points))
            .attr('stroke', 'black')
            .attr('fill', 'black')
            .attr('id', 'gill')

        /*------- Stalk Above Ring -------*/
        let stalk_a_ring_points = [
            {'x':mid_w, 		            'y':mid_h-2*shrm_unit},
            {'x':mid_w+shrm_unit, 		'y':mid_h-1.75*shrm_unit},
            {'x':mid_w+shrm_unit, 		'y':mid_h},
            {'x':mid_w-shrm_unit, 		'y':mid_h},
            {'x':mid_w-shrm_unit, 		'y':mid_h-1.75*shrm_unit},
            {'x':mid_w, 		            'y':mid_h-2*shrm_unit}
        ]
        let stalk_a_ring = shroom_svg.append('polygon')
            .attr('points', points_string(stalk_a_ring_points))
            .attr('stroke', 'black')
            .attr('fill', 'brown')
            .attr('id', 'stalk_a_ring')
        

        /*------- Stalk below ring -------*/
        let stalk_b_ring_points = [
            {'x':mid_w+shrm_unit,      'y':mid_h},
            {'x':mid_w+shrm_unit,      'y':mid_h+3*shrm_unit},
            {'x':mid_w-shrm_unit,      'y':mid_h+3*shrm_unit},
            {'x':mid_w-shrm_unit,      'y':mid_h}
        ]
        let stalk_b_ring = shroom_svg.append('polygon')
            .attr('points', points_string(stalk_b_ring_points))
            .attr('stroke', 'black')
            .attr('fill', 'brown')
            .attr('id', 'stalk_b_ring')



        /*------- Ring -------*/
        let ring_points = [
            {'x':mid_w+1.5*shrm_unit,      'y':mid_h},
            {'x':mid_w+1.5*shrm_unit,      'y':mid_h+0.5*shrm_unit},
            {'x':mid_w-1.5*shrm_unit,      'y':mid_h+0.5*shrm_unit},
            {'x':mid_w-1.5*shrm_unit,      'y':mid_h}
        ]
        let ring = shroom_svg.append('polygon')
            .attr('points', points_string(ring_points))
            .attr('stroke', 'black')
            .attr('fill', 'brown')
            .attr('id', 'ring')

        

        // A function that update the color of the circle
        function update_shroom_color(mycolor, element_tag) {
            d3.select(element_tag)
                .transition()
                .duration(700)
                .style('fill', mycolor)
        }


        /**
		 * Helper function for turning point objects to a string of points
		 * 
		 */
		function points_string(data) {
			output = ''

			for (i = 0; i < data.length; i++) {
				output = output + Math.floor(data[i].x) + ', ' + Math.floor(data[i].y)
				if (i != data.length - 1)
					output = output + ' '
			}
			//console.log(output)
			return output
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
            update_shroom_color(get_color(filters.stalk_color_below_ring), '#ring')
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
            .attr('stroke', 'black')
            .attr('d', arc)
            .attr('fill', 'white')
            .transition()
            .duration(700)
            .attr('fill', (data, i)=>{
                let value=data.data
                if (i == 0) {return 'white'}
                else {return 'black'}
            })

        // Appending Text
        svg.append('svg:text')
            .attr('x',width / 4)
            .attr('y',height/2 - margin)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(((1-fraction_edible) * 100).toFixed(2) + 
                '% of mushrooms with these colors are poisonous')

        
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
            .attr('transform', 'translate(' + 2*margin + ',' + 2*margin + ')')
            .attr('id', 'barchart')

        xScale.domain(filters_list);
        yScale.domain([0, 100]);

        g.append('g')
            .attr('transform', 'translate(0,' + height/3 + ')')
            .call(d3.axisBottom(xScale))
            

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
            .attr('x', function(d) {return xScale(d.characteristic)})
            .attr('width', xScale.bandwidth())
            .attr('y', height/3)
            .attr('stroke', 'black')
            .transition()
            .duration(700)
            .attr('fill', function(d) {return get_color(d.color)})
            .attr('height', function(d) {return height/3 - yScale(d.percentage)})
            .attr('y', function(d) {return yScale(d.percentage)})
            
    
        /*-------------------------------- TITLE ------------------------------*/
        svg.append('text')
            .attr('x', width/4)
            .attr('y', margin)
            .attr('font-size', '12px')
            .style('text-anchor', 'middle')
            .text('Percentage of Mushrooms in the Dataset with These Colors')
    }
})