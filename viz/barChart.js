function barChart() {

  let margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 400,
    height = 400,
    xValue = d => d[0],
    yValue = d => d[1],
    xScale = d3.scaleBand().padding(0.1),
    yScale = d3.scaleLinear(),
    onMouseOver,
    onMouseOut;

  function chart(selection) {
    selection.each(function (data) {

      let svg = d3.select(this).selectAll("svg").data([data]);

      let svgEnter = svg.enter().append("svg");
      let gEnter = svgEnter.append("g");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      const innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;

      const color = d3.scaleOrdinal()
          .domain(data)
          .range(d3.schemeAccent);

      svg.merge(svgEnter)
          .attr("width", width)
          .attr("height", height);

      const g = svg.merge(svgEnter).select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      xScale.rangeRound([0, innerWidth])
        .domain(data.map(xValue));
      yScale.rangeRound([innerHeight, 0])
        .domain([0, d3.max(data, yValue)]);


      g.select(".x.axis")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(d3.axisBottom(xScale));

      g.select(".y.axis")
          .call(d3.axisLeft(yScale).ticks(10))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "0.7em")
          .attr("text-anchor", "middle")
          .text("Workload");

      const bars = g.selectAll(".bar")
        .data(data);

      bars.enter().append("rect")
          .attr("class", "bar")
        .merge(bars)
          .attr("x", d => xScale(xValue(d)))
          .attr("y", d => yScale(yValue(d)))
          .attr("width", xScale.bandwidth())
          .attr("height", d => innerHeight - yScale(yValue(d)))
          .attr('fill', d => color(d.key))
          .on("mouseover", onMouseOver)
          .on("mouseout", onMouseOut);

      bars.exit().remove();
    });

  }

  chart.width = function(d) {
    if (!arguments.length) return width;
    width = d;
    return chart;
  }

  chart.height = function(d) {
    if (!arguments.length) return height;
    height = d;
    return chart;
  }

  chart.x = function(d) {
    if (!arguments.length) return xValue;
    xValue = d;
    return chart;
  }

  chart.y = function(d) {
    if (!arguments.length) return yValue;
    yValue = d;
    return chart;
  }

  chart.onMouseOver = function(d) {
    if (!arguments.length) return onMouseOver;
    onMouseOver = d;
    return chart;
  }

  chart.onMouseOut = function(d) {
    if (!arguments.length) return onMouseOut;
    onMouseOut = d;
    return chart;
  }

  return chart;
}



