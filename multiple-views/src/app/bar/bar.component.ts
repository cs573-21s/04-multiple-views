import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { index } from 'd3';
import { year } from '../model/year.model';

@Component({
  selector: 'dvmv-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {

  private groups;
  private subgroups;
  private title = "Emissions by Economic Sector, MMT CO2 eq.";
  private brush;
  private xBar;
  private brushedFunc;
  private mouseEnterPie;
  private mouseLeavePie;
  private redoBars;
  changeTrigger = 0;
  selectedYears = { "1990": false, "1991": false, "1992": false, "1993": false,
    "1994": false, "1995": false, "1996": false, "1997": false, "1998": false,
    "1999": false, "2000": false, "2001": false, "2002": false, "2003": false,
    "2004": false, "2005": false, "2006": false, "2007": false, "2008": false,
    "2009": false, "2010": false, "2011": false, "2012": false, "2013": false,
    "2014": false, "2015": false, "2016": false, "2017": false, "2018": false,
    "2019": false
  }

  data: any[];
  updateSlices: any;
  columnsToDisplay = [
    "Year",
    "Transportation",
    "Electricity generation",
    "Industry",
    "Agriculture",
    "Commercial",
    "Residential"
  ];
  sliceNames = [
    "Transportation",
    "Electricity generation",
    "Industry",
    "Agriculture",
    "Commercial",
    "Residential"
  ];

  colorsDict = {
    "Transportation": "#72e5ef",
    "Electricity generation": "#812050",
    "Industry": "#9ae790",
    "Agriculture": "#b029bf",
    "Commercial": "#2cf52b",
    "Residential": "#1f3ca6",
  }

  private svgPie;
  private marginPie = 50;
  private widthPie = 750;
  private heightPie = 600;
  // The radius of the pie chart is half the smallest side
  private radiusPie = Math.min(this.widthPie, this.heightPie) / 2 - this.marginPie;
  private colorsPie;

  constructor() { }

  ngOnInit(): void {
    d3.csv('https://mastlouis.github.io/04-multiple-views/assets/transpose.csv').then(data => {

      this.subgroups = data.columns.slice(1);
      this.groups = d3.map(data, function(d){return(d.group)}).keys();

      this.createSvg();
      this.drawStackedBars(data);
      this.cleanTicks();
      this.addBrush();
        // this.drawBars(this.data);

      this.data = data;
      this.createSvgPie();
      let transform = this.transformData(data)
      this.createColors(transform);
      this.drawChart(transform);
    })
  }

  increment() {
    this.changeTrigger += 1;
  }

  private svg;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawStackedBars(data: any[]): void {
    // List of groups = species here = value of the first column called group -> I show them on the X axis
    let groups = d3.map(data, function(d){return(d.group)}).keys()

    // Add X axis
    let x = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([this.margin, this.width - this.margin])
      .padding(0.1)
    this.xBar = x;
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    let y = d3.scaleLinear()
      .domain([0, 8000])
      .range([ this.height, 0 ]);
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    let color = d3.scaleOrdinal()
      .domain(this.subgroups)
      // .range(['#e41a1c','#377eb8','#4daf4a'])
      .range([
        "#75e901", // Green
        "#01e9e9", // Blue
        "#0175e9", // Dark Blue
        "#7501e9", // Purple
        "#e901e9", // Magenta
        "#e97501", // Orange
      ]);

    //stack the data? --> stack per subgroup
    let stackedData = d3.stack()
      .keys(this.subgroups)
      (data)

    // Show the bars
    this.svg.append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .attr("year", d => d.year)
        .enter().append("rect")
          .attr("class", "stbar")
          .attr("x", function(d) { return x(d.data.year); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width",x.bandwidth())

    this.redoBars = categoryToRemove => {
      let data = this.transformBarData(categoryToRemove);
      this.svg = d3.select("figure#bar")
        .select("svg").remove()

      this.createSvg();
      this.drawStackedBars(data);
      this.cleanTicks();
      this.addBrush();


    }


    this.brushedFunc = e => {
      d3.selectAll('.stbar')
        .style('opacity' , (d: {data: any}) => {
          let pos = x(d.data.year)
          if(pos >= e.selection[0] && pos <= e.selection[1]) {
            this.selectedYears[d.data.year] = true
            return 1;
            // return "#FF00FF";
          } else {
            this.selectedYears[d.data.year] = false
            // return "steelblue";
            return 0.5
          }
        });
      this.updateChart()
    }
  }

  private cleanTicks(): void {
    var ticks = d3.selectAll(".tick text");
    ticks.each(function(year,i){
      if(i%5 !== 0 && year !== "2019") d3.select(this).remove();
    });
  }

  private addBrush(): void {
    this.brush = d3.brushX()
      .extent([ [0,0], [this.width, this.height]])
      .on('brush end', this.brushedFunc);
    this.svg.append('g')
      .attr("class", "brush")
      .call(this.brush);
  }

  transformBarData(categoryToRemove) {
    let transformedData = []
    let copy;
    if (!categoryToRemove) {
      transformedData = this.data
    } else {
      for(let datum of this.data) {
        copy = Object.assign({}, datum)
        delete copy[categoryToRemove]
        transformedData.push(copy)
      }
    }
    return transformedData;
  }

  ///////////////
  // PIE CHART //
  ///////////////

  transformData(data: any[]): any {
    let selection = data.filter(point => this.selectedYears[point.year])
    if (selection.length === 0) {
      selection = data;
    }

    let aggregation = {
      "Transportation": 0,
      "Electricity generation": 0,
      "Industry": 0,
      "Agriculture": 0,
      "Commercial": 0,
      "Residential": 0,
    }

    for (let year of selection) {
      for (let property of this.sliceNames) {
        aggregation[property] += parseFloat(year[property])
      }
    }
    return this.objToArray(aggregation);
  }

  private objToArray(object): {name: string, value: string}[] {
    delete object.year
    delete object.Total
    return Object.keys(object).map((key: string) => {return {name: key, value: object[key]}})
  }

  parseSelectedYears(): string[] {
    let years = Object.keys(this.selectedYears).map(k => {
      return this.selectedYears[k] === true ? k : null
    }).filter(e => e)
    return years.length ? years : ["1990", "2019"]
  }

  private createSvgPie(): void {
    this.svgPie = d3.select("figure#pie")
    .append("svg")
    .attr("width", this.widthPie)
    .attr("height", this.heightPie)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.widthPie / 2 + "," + this.heightPie / 2 + ")"
    );
  }

  private createColors(data: any[]): void {
    this.colorsPie = d3.scaleOrdinal()
    .domain(data.map(d => d.value.toString()))
    // .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
    .range([
      "#75e901", // Green
      "#01e9e9", // Blue
      "#0175e9", // Dark Blue
      "#7501e9", // Purple
      "#e901e9", // Magenta
      "#e97501", // Orange
    ]);
  }

  private drawChart(data: any[]): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.value));

    // Build the pie chart
    this.svgPie
    .selectAll('pieces')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(this.radiusPie)
    )
    .attr('sector', d => d.data.name)
    .attr('class', d => `pieSlice`)
    .attr('fill', (d, i) => (this.colorsPie(i)))
    .attr("stroke", "#121926")
    .style("stroke-width", "1px");

    // Add labels
    const labelLocation = d3.arc()
    .innerRadius(100)
    .outerRadius(this.radiusPie);

    this.svgPie
    .selectAll('pieces')
    .data(pie(data))
    .enter()
    .append('text')
    .text(d => d.data.name)
    .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 15);

    this.mouseEnterPie = (e, i) => {
      console.log(`Mouse enter`)
      console.log(e)
      e.fromElement.classList.add("selected")
      d3.selectAll(".selected").style("opacity", 0.5)
      console.log(i)
      this.redoBars(i.data.name);
    }
    this.mouseLeavePie = (e, i) => {
      this.redoBars("");
    }

    this.updateSlices = data => {
      this.svgPie
        .selectAll('pieces')
        .data(pie(data))
        .enter()
        .append('path')
        .merge(this.svgPie.selectAll('pieces'))
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(this.radiusPie)
        )
        .attr('sector', d => d.data.name)
        .attr('class', d => `pieSlice`)
        .attr('fill', (d, i) => (this.colorsPie(i)))
        .attr("stroke", "#121926")
        .style("stroke-width", "1px");
      // for(let sector of this.sliceNames) {
      //   d3.select(`.pieSlice`)
      //     .transition()
      //     .duration(80)
      //     .attrTween("d", d => arcTween(d, pie(data)[0]))
      //     .data(pie(data), (d: {data: {name}}) => d.data.name)
      // }

      // Replace Labels
      this.svgPie
        .selectAll('pieces')
        .data(pie(data))
        .enter()
        .append('text')
        .text(d => d.data.name)
        .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .on('mouseenter', this.mouseEnterPie)
        .on('mouseleave', this.mouseLeavePie)
    }
    this.updateChart();
  }

  updateChart() {
    this.updateSlices(this.transformData(this.data))
  }

}
