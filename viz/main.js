const dateFmt = d3.timeParse("%Y-%m-%d");

const chartTimeline = timeSeriesChart()
    .x(d => d.key)
    .y(d => d.value);

const lollipop = lollipopPlot()
    .x(d => d.key)
    .y(d => d.value);

const bar = barChart()
    .x(d => d.key)
    .y(d => d.value);

const pie = pieChart()
    .x(d => d.key)
    .y(d => d.value);


d3.csv("data/garments_worker_productivity.csv",
  d => {
    d.date = dateFmt(d.date);
    d.actual_productivity = +d.actual_productivity;
    d.targeted_productivity = +d.targeted_productivity;
    return d;
  },
  (err, data) => {
    if (err) throw err;

    const csData = crossfilter(data);

    csData.dimTime = csData.dimension(d => d.date);
    csData.dimDepartment = csData.dimension(d => d.department);
    csData.dimDay = csData.dimension(d => d.day);
    csData.dimQuarter = csData.dimension(d => d.quarter);
    csData.dimActualProductivity = csData.dimension(d => [d.date, d.actual_productivity]);
    csData.dimTargetedProductivity = csData.dimension(d => d.targeted_productivity);

    csData.timesByHour = csData.dimTime.group(d3.timeHour);
    csData.department = csData.dimDepartment.group();
    csData.day = csData.dimDay.group();
    csData.quarter = csData.dimQuarter.group();
    csData.actual_productivity = csData.dimActualProductivity.group();
    csData.targeted_productivity = csData.dimTargetedProductivity.group();
    csData.prodData = csData.dimTime.group(d3.timeHour);


    chartTimeline.onBrushed(selected => {
      csData.dimTime.filter(selected);
      update();
    });

    bar.onMouseOver(function (d) {
      csData.dimQuarter.filter(d.key);
      update();
    }).onMouseOut(() => {
      csData.dimQuarter.filterAll();
      update();
    });

    lollipop.onMouseOver((d) => {
      csData.dimDay.filter(d.key);
      update();
    }).onMouseOut(() => {
      csData.dimDay.filterAll();
      update();
    });


    function update() {

      d3.select("#timeline")
          .datum(csData.timesByHour.all())
          .call(chartTimeline);

      d3.select("#quarter")
          .datum(csData.quarter.all())
          .call(bar);

      d3.select("#day")
          .datum(csData.day.all())
          .call(lollipop)
          .select(".x.axis")
          .select(".y.axis")
          .selectAll(".tick text")
          .attr("transform", "translate(-8,-1) rotate(-45)");

      d3.select("#department")
          .datum(csData.department.all())
          .call(pie);
    }

    update();

  }
);