import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'dvmv-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit, OnChanges {

  @Input() selectedYears: any;
  @Input() changeTrigger: number;
  data: any[];
  updateSlices: any;
  sliceNames = [
    "Transportation",
    "Electricity generation",
    "Industry",
    "Agriculture",
    "Commercial",
    "Residential"
  ];

  constructor() { }

  ngOnInit(): void {
    d3.csv('../../assets/transpose.csv').then(data => {
      this.data = data;
      this.createSvg();
      let transform = this.transformData(data)
      this.createColors(transform);
      this.drawChart(transform);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    this.updateChart()
    debugger;
    this.updateChart()
  }

  // private data = [
  //   {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
  //   {"Framework": "React", "Stars": "150793", "Released": "2013"},
  //   {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
  //   {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
  //   {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
  // ];
  private svg;
  private margin = 50;
  private width = 750;
  private height = 600;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;

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

    debugger;
    console.log(`pie chart data selection: ${selection}`)
  }

  private objToArray(object): {name: string, value: string}[] {
    delete object.year
    delete object.Total
    return Object.keys(object).map((key: string) => {return {name: key, value: object[key]}})
  }

  debug() {
    console.log(this);
    debugger;
  }

  parseSelectedYears(): string[] {
    let years = Object.keys(this.selectedYears).map(k => {
      return this.selectedYears[k] === true ? k : null
    }).filter(e => e)
    return years.length ? years : ["1990", "2019"]
  }

  private createSvg(): void {
    this.svg = d3.select("figure#pie")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
  }

  private createColors(data: any[]): void {
    this.colors = d3.scaleOrdinal()
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
    this.svg
    .selectAll('pieces')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius)
    )
    .attr('sector', d => d.data.name)
    .attr('class', d => `pieSlice`)
    .attr('fill', (d, i) => (this.colors(i)))
    .attr("stroke", "#121926")
    .style("stroke-width", "1px");

    // Add labels
    const labelLocation = d3.arc()
    .innerRadius(100)
    .outerRadius(this.radius);

    this.svg
    .selectAll('pieces')
    .data(pie(data))
    .enter()
    .append('text')
    .text(d => d.data.name)
    .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 15);

    this.updateSlices = data => {
      this.svg
        .selectAll('pieces')
        .data(pie(data))
        .enter()
        .append('path')
        .merge(this.svg.selectAll('pieces'))
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(this.radius)
        )
        .attr('sector', d => d.data.name)
        .attr('class', d => `pieSlice`)
        .attr('fill', (d, i) => (this.colors(i)))
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
      this.svg
        .selectAll('pieces')
        .data(pie(data))
        .enter()
        .append('text')
        .text(d => d.data.name)
        .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 15);
    }
    this.updateChart();
  }

  updateChart() {
    this.updateSlices(this.transformData(this.data))
  }
}
