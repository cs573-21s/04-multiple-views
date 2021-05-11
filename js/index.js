document.addEventListener("DOMContentLoaded", function(event) {
  // configuration
  const country = 'CountryName';
  const colorVariable = 'color';
  const taxHeaven = 'Known Tax Heaven';
  const colorVariableIndex = '2020';
  const geoIDVariable = 'id';
  const format = d3.format(',');

  // Set tooltips
  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(d => `<strong>Country: </strong><span class='details'>${d.properties.name}<br></span>
                <strong>2020 Tax Rate: </strong><span class='details'>${format(d[colorVariable])}%</span><br>
                <strong>Known Tax Heaven: </strong><span class='details'>${d[taxHeaven]? 'Yes' : 'No/Unknown'}</span>`);

  const margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const color = d3.scaleQuantile()
    .range([
      'rgba(0,200,0,0.175)',
      'rgba(0,190,0,0.280)',
      'rgba(0,180,0,0.380)',
      'rgba(0,170,0,0.475)',
      'rgba(0,160,0,0.565)',
      'rgba(0,150,0,0.650)',
      'rgba(0,140,0,0.730)',
      'rgba(0,130,0,0.805)',
      'rgba(0,120,0,0.875)',
      'rgba(0,110,0,0.940)',
      'rgba(0,100,0,1.000)'
    ]);


  const svg = d3.select('#map_container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('class', 'map');

  const projection = d3.geoRobinson()
    .scale(148)
    .rotate([352, 0, 0])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  svg.call(tip);

  queue()
    .defer(d3.json, 'data/world_countries.json')
    .defer(d3.csv, 'data/world_population.csv')
    .defer(d3.json, 'data/regions.json')
    .await(ready);

  function callbackFunction(geography, data, regions, regionCountries) {
      ready(false, geography, data, regions, (regionCountries.length > 0)?regionCountries:null);
      console.log(regionCountries);
    }

  function ready(error, geography, data, regions, regionCountries=null) {
    data.forEach(d => {
      d[colorVariable] = Number(d[colorVariableIndex].replace(',', ''));
    })

    const colorVariableValueByID = {};

    data.forEach(d => {
      colorVariableValueByID[d[geoIDVariable]] = {
        'id': d[colorVariable],
        'taxheaven': (d[taxHeaven]) ? true : false,
        'country': d[country]
      };
    });
    geography.features.forEach(d => {
      if (typeof colorVariableValueByID[d.id] !== 'undefined') {
        d[colorVariable] = colorVariableValueByID[d.id].id;
        d[taxHeaven] = colorVariableValueByID[d.id].taxheaven;
        d[country] = colorVariableValueByID[d.id].country;
      }
      // colorVariableValueByID[d[taxHeaven]] = (d[taxHeaven])? true : false;
    });

    // calculate jenks natural breaks
    const numberOfClasses = color.range().length - 1;
    const jenksNaturalBreaks = jenks(data.map(d => d[colorVariable]), numberOfClasses);
    console.log('numberOfClasses', numberOfClasses);
    console.log('jenksNaturalBreaks', jenksNaturalBreaks);

    // set the domain of the color scale based on our data
    color
      .domain(jenksNaturalBreaks);


    svg.append('g')
      .attr('class', 'countries')
      .selectAll('path')
      .data(geography.features)
      .enter().append('path')
      .attr('d', path)
      .style('fill', d => {
        if (typeof colorVariableValueByID[d.id] !== 'undefined') {
          if (colorVariableValueByID[d.id].taxheaven) {
            return d3.color('rgba(250,60,0,1)');
          } else if (regionCountries != null) {
            if ((regionCountries.indexOf(d[country]) > -1)) {
              return d3.color('rgba(100, 120, 120, 0.5)');
            } else {
              return color(colorVariableValueByID[d.id].id);
            }
          } else {
            return color(colorVariableValueByID[d.id].id);
          }
        }
        return 'white'
      })
      .style('fill-opacity', 0.8)
      .style('stroke', d => {
        if (d[colorVariable] !== 0) {
          if (d[taxHeaven]) {
            return 'red';
          } else {
            return 'white';
          }
        }
        return 'lightgray';
      })
      .style('filter', function(d){
        if (d[colorVariable] !== 0 && regionCountries != null) {
          if (d[taxHeaven] || (regionCountries.indexOf(d[country]) > -1)) {
            return 'grayscale(0)';
          } else {
            return 'grayscale(0.8)';
          }
        }
      })
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.5)
      // tooltips
      .on('mouseover', function(d) {
        tip.show(d);
        d3.select(this)
          .style('fill-opacity', 1)
          .style('stroke-opacity', 0.4)
          .style('stroke-width', 1)
      })
      .on('mouseout', function(d) {
        tip.hide(d);
        d3.select(this)
          .style('fill-opacity', 0.8)
          .style('stroke-opacity', 0.2)
          .style('stroke-width', 1)
      })
      .on('click', function(d) {
        drawBarChart(geography, data, regions, callbackFunction, d[country]);
      });

    svg.append('path')
      .datum(topojson.mesh(geography.features, (a, b) => a.id !== b.id))
      .attr('class', 'names')
      .attr('d', path);

    drawBarChart(geography, data, regions, callbackFunction);

  }

});
