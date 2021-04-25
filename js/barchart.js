// set the dimensions and margins of the graph
var margin = {
    top: 70,
    right: 30,
    bottom: 30,
    left: 60
  },
  width = 660 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


var select;
// year
var group = ["2015", "2016", "2017", "2018", "2019", "2020"];

// subgroups
var subgroups = ["China", "Switzerland", "United States"];
var regions;

function drawBarChart(geography, data, regions_, readyCallbackFn, newSubGroup = "") {
  if (regions == null) {
    regions = regions_;
    select = d3.select("#my_dataviz")
      .append("select")
      .attr("class", "select-region")
      .selectAll('option')
      .data(Object.keys(regions))
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });
      // ;
      // When the button is changed, run the updateChart function
      d3.select(".select-region").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        // update(selectedOption)
        subgroups = regions[selectedOption];
        if(subgroups.length > 3) {
          subgroups.splice(3, subgroups.length);
        } else if(subgroups.length == 0) {
          subgroups = ["China", "Switzerland", "United States"];
        }
        document.querySelector('.tooltip2').remove();
        document.querySelector('#my_dataviz>svg>g').innerHTML = "";
        document.querySelector('.foot-note').innerHTML = "<b>Region : "+selectedOption +"</b> <br> Countries: <br> "+subgroups.join(', ');
        readyCallbackFn(geography, data, regions, regions[selectedOption]);
      });
  }

  if (subgroups.indexOf(newSubGroup) > -1) {
    return;
  } else if (newSubGroup != "") {
    document.querySelector('.tooltip2').remove();
    document.querySelector('#my_dataviz>svg>g').innerHTML = "";
    subgroups.push(newSubGroup);
  }

  // readyCallbackFn(true);
  // readyCallbackFn();

  var dataBarchart = [];
  data.forEach(d => {
    if (subgroups.indexOf(d["CountryName"]) > -1) {
      dataBarchart.push({
        'country': d["CountryName"],
        '2015': d["2015"],
        '2016': d["2016"],
        '2017': d["2017"],
        '2018': d["2018"],
        '2019': d["2019"],
        '2020': d["2020"]
      });
    }
  });


  // Create tooltip2
  var tooltip2 = d3.select("#my_dataviz")
    .append("div")
    .attr("class", "tooltip2");

  var dataBarchart2 = [];
  var test = {};
  for (var i = 0; i < group.length; i++) {
    test = {};
    test["year"] = group[i];
    for (var j = 0; j < dataBarchart.length; j++) {
      test[dataBarchart[j]['country']] = dataBarchart[j][group[i]];
    }
    dataBarchart2.push(test);
  }

  // Add X axis
  var x = d3.scaleBand()
    .domain(group)
    .range([0, width])
    .padding([0.25]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 45])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position
  var xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#808B96', '#FFBF00', '#FF7F50', '#DE3163', '#9FE2BF', '#40E0D0', '#6495ED', '#CCCCFF']);


  // ----------------
  // Highlight a specific subgroup when hovered
  // ----------------

  // What happens when user hover a bar
  var mouseover = function(d) {
    // what subgroup are we hovering?
    // var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
    // var subgroupValue = d.data[subgroupName];
    // Reduce opacity of all rect to 0.2
    d3.selectAll("rect").style("opacity", 0.2)
    // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
    d3.selectAll("." + d.key.replace(/ /g, '') + "class")
      .style("opacity", 1)
    tooltip2.html(`Country: ${d.key}<br> Tax Rates: ${d.value}%`)
      .style("opacity", 1)
      .style("display", "block");
  }

  var mouseleave = function(d) {
    // Back to normal opacity: 0.8
    d3.selectAll("rect")
      .style("opacity", 0.8);
    tooltip2.style("opacity", 0)
      .style("display", "none");
  }

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(dataBarchart2)
    .enter()
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + x(d.year) + ",0)";
    })
    .selectAll("rect")
    .data(function(d) {
      return subgroups.map(function(key) {
        return {
          key: key,
          value: d[key]
        };
      });
    })
    .enter().append("rect")
    .attr("x", function(d) {
      return xSubgroup(d.key);
    })
    .attr("y", function(d) {
      return y(d.value);
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("height", function(d) {
      return height - y(d.value);
    })
    .attr("fill", function(d) {
      return color(d.key);
    })
    .attr("class", function(d) {
      return d.key.replace(/ /g, '') + "class";
    })
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)
    .on("click", function(d) {
      var index = subgroups.indexOf(d.key);
      if (subgroups.length > 1) {
        subgroups.splice(index, 1);
        document.querySelector('.tooltip2').remove();
        document.querySelector('#my_dataviz>svg>g').innerHTML = "";
        drawBarChart(geography, data, readyCallbackFn);
      }
    });
}
