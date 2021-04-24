function pieChart() {

    let margin = {top: 20, right: 20, bottom: 20, left: 0},
        width = 400,
        height = 400,
        xValue = d => d[0],
        yValue = d => d[1],
        xScale = d3.scaleBand().padding(0.1),
        yScale = d3.scaleLinear(),
        labelHeight = 18;

    function chart(selection) {
        selection.each(function (data) {

            const svg = d3.select(this).selectAll("svg").data([data]);

            const svgEnter = svg.enter().append("svg");
            const gEnter = svgEnter.append("g");

            let innerWidth = width - margin.left - margin.right,
                innerHeight = height - margin.top - margin.bottom;

            const radius = Math.min(innerWidth, innerHeight) / 2 - margin.right;

            const color = d3.scaleOrdinal()
                .domain(data)
                .range(d3.schemeSet2);

            svg.merge(svgEnter).attr("width", width)
                .attr("height", height);

            const g = svg.merge(svgEnter).select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            xScale.rangeRound([0, innerWidth])
                .domain(data.map(xValue));
            yScale.rangeRound([innerHeight, 0])
                .domain([0, d3.max(data, yValue)]);

            let v = data.map(d => d.value);
            let dataset = {'finishing':v[0], 'sweing':v[1]};

            const pie = d3.pie()
                .value(d => d.value)
            const data_ready = pie(d3.entries(dataset));

            const arcGenerator = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            const p = g.selectAll(".pie")
                .data(data_ready);

            p.enter()
                .append('path')
                .merge(p)
                .attr("class", "pie")
                // .transition()
                // .duration(50)
                .attr('d', arcGenerator)
                .attr('fill', d => color(d.data.key))
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .style("opacity", 1)
                .attr("transform", "translate(" + innerWidth / 2 * 1.2 + "," + innerHeight / 2 + ")")
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut);

            // labels
            // p.enter()
            //     .append('text')
            //     // .transition()
            //     // .duration(10)
            //     .attr('d', arcGenerator)
            //     .text(function(d){ return d.data.key})
            //     .attr("transform", function(d) { let pos = [innerWidth / 4 + innerHeight / 4 + arcGenerator.centroid(d)[0], innerWidth / 4 + innerHeight / 4 + arcGenerator.centroid(d)[1]]; console.log(pos); return "translate(" + pos + ")";} )
            //     .style("text-anchor", "middle")
            //     .style("font-size", 17);

            // legend
            p
                .enter()
                .append('rect')
                .attr('y', d => labelHeight * d.index * 1.5)
                .attr('width', labelHeight)
                .attr('height', labelHeight)
                .attr('fill', d => color(d.data.key))
                .attr('stroke', 'grey')
                .style('stroke-width', '1px')
                .attr("transform", "translate(30,0)")
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut);

            p
                .enter()
                .append('text')
                .text(d => d.data.key)
                .attr('x', labelHeight * 1.2)
                .attr('y', d => labelHeight * d.index * 1.5 + labelHeight)
                .style('font-family', 'sans-serif')
                .style('font-size', `${labelHeight}px`)
                .attr("transform", "translate(30,0)")
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut);

            p.exit().remove();
        });

    }

    chart.x = function(d) {
        if (!arguments.length) return xValue;
        xValue = d;
        return chart;
    };

    chart.y = function(d) {
        if (!arguments.length) return yValue;
        yValue = d;
        return chart;
    };

    return chart;
}

