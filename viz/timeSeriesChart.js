function timeSeriesChart() {
  let margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = 800,
    height = 120,
    innerwidth = width - margin.right - margin.left,
    innerheight = height - margin.bottom - margin.top,

    xValue = d => d[0],
    yValue = d => d[1],

    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),

    area = d3.area()
        .x(d=>xScale(d[0]))
        .y1(d=>yScale(d[1])),
    line = d3.line()
        .x(d=>xScale(d[0]))
        .y(d=>yScale(d[1])),
    brush = d3.brushX()
        .extent([
        [0, 0],
        [innerwidth, innerheight]])
        .on("brush", brushended)
        .on("end", brushended);

  function chart(selection) {
    selection.each(function(data) {

      data = data.map((d, i) => [xValue.call(data, d, i), yValue.call(data, d, i)]);

      // console.log(data);

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
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");
      gEnter
        .append("g")
        .attr("class", "brush")
        .call(brush);

      svg
        .merge(svgEnter)
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .merge(svgEnter)
        .select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.select(".area").attr("d", area.y0(yScale.range()[0]));

      g.select(".line").attr("d", line);

      g.select(".x.axis")
        .attr("transform", "translate(0," + yScale.range()[0] + ")")
        .call(d3.axisBottom(xScale).tickSize(6, 0));
    });
  }

  function brushended() {
    const selection = d3.event.selection;
    if (!d3.event.sourceEvent || !selection) return;
    const selectedTime = selection.map(d => xScale.invert(d));
    onBrushed(selectedTime);
  }

  chart.x = function (d) {
    if (!arguments.length) return xValue;
    xValue = d;
    return chart;
  };

  chart.y = function (d) {
    if (!arguments.length) return yValue;
    yValue = d;
    return chart;
  };

  chart.onBrushed = function(d) {
    if (!arguments.length) return onBrushed;
    onBrushed = d;
    return chart;
  };

  return chart;
}
