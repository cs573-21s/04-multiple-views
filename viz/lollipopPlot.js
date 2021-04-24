function lollipopPlot() {

  let margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 600,
    height = 400,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    dayScale = d3.scaleBand().padding(0.92);

  function chart(selection) {
    selection.each(function (data) {

      const svg = d3.select(this).selectAll("svg").data([data]);

      const svgEnter = svg.enter().append("svg");
      const gEnter = svgEnter.append("g");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      svg.merge(svgEnter).attr("width", width)
        .attr("height", height);

      const g = svg.merge(svgEnter).select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      xScale.rangeRound([0, innerWidth])
          .domain([-0.97, data.length-0.03]);
      yScale.rangeRound([innerHeight, 0])
        .domain([0, d3.max(data, d => yValue(d))]);
      dayScale.rangeRound([0, innerWidth])
          .domain(data.map(xValue));


      g.select(".x.axis")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(d3.axisBottom(dayScale));

      g.select(".y.axis")
          .call(d3.axisLeft(yScale).ticks(10))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "middle")
          .text("Workload");

      const points = g.selectAll(".point")
        .data(data);

      points.enter().append("circle")
          .attr("class", "point")
        .merge(points)
          .attr("cx", d => xScale(data.indexOf(d)))
          .attr("cy", d => yScale(yValue(d)))
          .attr("r", 15)
          .attr("fill", "#fbd14b")
          .attr("opacity", 0.8)
          .on("mouseover", onMouseOver)
          .on("mouseout", onMouseOut);


      const bars = g.selectAll(".bar")
          .data(data);

      bars.enter().append("rect")
          .attr("class", "bar")
          .merge(bars)
          .attr("x", d => dayScale(xValue(d)))
          .attr("y", d => yScale(yValue(d)))
          .attr("width", dayScale.bandwidth())
          .attr("height", d => innerHeight - yScale(yValue(d)))
          .attr('fill', "#fbd14b")
          .attr("opacity", 0.5)
          .on("mouseover", onMouseOver)
          .on("mouseout", onMouseOut);

      points.exit().remove();
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

  chart.onMouseOver = function(d) {
    if (!arguments.length) return onMouseOver;
    onMouseOver = d;
    return chart;
  };

  chart.onMouseOut = function(d) {
    if (!arguments.length) return onMouseOut;
    onMouseOut = d;
    return chart;
  };

  return chart;
}

