function lineChart() {

    let margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 800,
        height = 120,
        xValue = d => d[0],
        yValue = d => d[1],
        innerwidth = width - margin.right - margin.left,
        innerheight = height - margin.bottom - margin.top,

        xScale = d3.scaleTime(),
        yScale = d3.scaleLinear()

        // line = d3.line()
        //     .x(d=>xScale(d[0]))
        //     .y(d=>yScale(d[1]));
        area = d3.area()
            .x(d=>xScale(d[0]))
            .y1(d=>yScale(d[1]));

    function chart(selection) {
        selection.each(function(data) {

            data = data.map((d, i) => [xValue.call(data, d, i), yValue.call(data, d, i)]);
            console.log(yValue);

            xScale
                .domain(d3.extent(data, d => d[0]))
                .range([0, innerwidth]);
            yScale
                .domain([0, d3.max(data, d => d[1])])
                .range([innerheight, 0]);


            const svg = d3
                .select(this)
                .selectAll("svg")
                .data([data]);

            // Otherwise, create the skeletal chart.
            const svgEnter = svg.enter().append("svg");
            const gEnter = svgEnter.append("g");
            gEnter.append("path").attr("class", "area");
            // gEnter.append("path").attr("class", "line");
            gEnter.append("g").attr("class", "x axis");

            // Update the outer dimensions.
            svg
                .merge(svgEnter)
                .attr("width", width)
                .attr("height", height);

            // Update the inner dimensions.
            const g = svg
                .merge(svgEnter)
                .select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // g.select(".line").attr("d", line);
            // Update the area path.
            g.select(".area")
                .attr("d", area.y0(yScale.range()[0]))
                .attr("fill", "grey");

            // Update the x-axis.
            g.select(".x.axis")
                .attr("transform", "translate(0," + yScale.range()[0] + ")")
                .call(d3.axisBottom(xScale).tickSize(6, 0));
        });
    }


    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    return chart;
}



