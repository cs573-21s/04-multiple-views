// // references
// // https://bl.ocks.org/mbostock/ca5b03a33affa4160321
// // https://medium.com/@mbostock/a-better-way-to-code-2b1d2876a3a0

// var svg = d3.select("svg"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");

// var format = d3.format(",d");

// var color = d3.scaleSequential(d3.interpolateMagma)
//     .domain([-4, 4]);

// var stratify = d3.stratify()
//     .parentId(function (d) {
//         console.log(d.fmat)
//         console.log(d)
//         return d.class.substring(0, d.class.lastIndexOf("."));
//     });

// var pack = d3.pack()
//     .size([width - 2, height - 2])
//     .padding(3);




// var nest = d3.nest()
//     .key(function (d) {
//         return d.Kingdom;
//     })
//     .key(function (d) {
//         return d.Phylum;
//     })
//     .key(function (d) { return d.Class; })
//     .key(function (d) { return d.Over; })

//     .key(function (d) {
//         // console.log(d.Family)
//         return d.Family;
//     })
//     .key(function (d) {
//         // console.log(d.Genus)
//         return d.Genus;
//     })
//     .key(function (d, i) {
//         // console.log(d.Species, i)
//         return d.Species;
//     })
//     .rollup(function (d) { return d3.sum(d, function (d) { return d.Species; }); });

// // var treemap = d3.treemap()
// //     .size([width, height])
// //     .padding(1)
// //     .round(true);

// d3.csv("https://raw.githubusercontent.com/imogencs/04-multiple-views/main/simple_reptiles.csv", function (data) {
//     // console.log(data.columns)


//     var root = d3.hierarchy({ fmats: nest.entries(data) }, function (d) { return d.fmats; })
//         .sum(function (d) { return d.fmat; })
//         .sort(function (a, b) { return b.fmat - a.fmat; });

//     // treemap(root);

//     // var root = stratify(data)
//     //     .sum(function (d) { return d.fmat; })
//     //     .sort(function (a, b) { return b.fmat - a.fmat; });

//     pack(root);


//     // console.log(data)
//     // // console.log(data.fmat)
//     // var root = stratify(data)
//     //     .sum(function (d) {
//     //         console.log(d.fmat)
//     //         return d.fmat;
//     //     })
//     //     .sort(function (a, b) { return b.fmat - a.fmat; });
//     // console.log(root)

//     // pack(root);

//     console.log('here :) 1')

//     var node = svg.select("g")
//         .selectAll("g")
//         .data(root.descendants())
//         .enter().append("g")
//         // .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
//         .attr("class", function (d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
//         .each(function (d) { d.node = this; })
//         .on("mouseover", hovered(true))
//         .on("mouseout", hovered(false));
//     console.log('here :) 2')

//     node.append("circle")
//         .attr("id", function (d) { return "node-" + d.class; })
//         // .attr("r", function (d) { return d.r; })
//         .attr("r", 20)
//         .style("fill", function (d) { return color(d.depth); })
//         .attr('opacity', .01)
//     console.log('here :) 3')
//     var leaf = node.filter(function (d) { return !d.children; });

//     leaf.append("clipPath")
//         .attr("id", function (d) { return "clip-" + d.class; })
//         .append("use")
//         .attr("xlink:href", function (d) { return "#node-" + d.class + ""; });




//     console.log('here :) 4')
//     console.log(data)
//     console.log(data.columns)
//     // leaf.append("text")
//     //     .attr("clip-path", function (d) { return "url(#clip-" + d.class + ")"; })
//     //     .selectAll("tspan")
//     //     .data(function (d) {
//     //         console.log(d)
//     //         console.log(d.class)
//     //         return d.class;
//     //     })
//     //     .enter().append("tspan")
//     //     .attr("x", 0)
//     //     .attr("y", function (d, i, nodes) { 
//     //         // return 50
//     //         return 13 + (i - nodes.length / 2 - 0.5) * 10; 
//     //     })
//     //     .text(function (d) { return d; });

//     console.log('here :) 5')
//     node.append("title")
//         .text(function (d) { return d.class + "\n" + format(d.fmat); });

//     svg.append('circle')
//         .attr('r', 10)
// });

// function hovered(hover) {
//     return function (d) {
//         d3.selectAll(d.ancestors().map(function (d) { return d.node; })).classed("node--hover", hover);
//     };
// }








var margin = { top: 20, right: window.innerWidth / 10, bottom: 30, left: window.innerWidth / 10 },
    width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("https://raw.githubusercontent.com/imogencs/04-multiple-views/main/simple_reptiles.csv", function (data) {


    svg.append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mousemove', function (event) {
            crosshairs(event)
        })
        .attr('id', 'background')

    // axes
    var x = d3.scaleTime()
        .range([0, width])
        .domain([1500, 5000]);
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([5, 50]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append('text')
        .text('MPG')
        .attr('transform', 'rotate(-90)')
        .attr('x', -1 * height / 2)
        .attr('y', -50)

    // colors categorical
    // var colormapper = d3.scaleOrdinal().domain(data)
    //     .range(d3.schemeSet2);

    // points
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", function (d) {
            console.log(d.Maximumlongevity)
            return (d.Maximumlongevity) / 10000;
        })
        .attr("cx", function (d) {
            console.log(d.fmat)
            return x(d.fmat);
        })
        .attr("cy", function (d) { return y(d.Malematurity); })
        // .attr('fill', function (d) { return colormapper(d.Manufacturer); })
        .style("opacity", .5)
        .on("mouseover", function (d) {
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", 'black')
                .raise()
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("opacity", .5)
                .style("stroke", 'none')
        })

    svg.selectAll("circle")
        .transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(2000)
        .attr("cx", function (d) { return x(d.Weight); })
        .attr("cy", function (d) { return y(d.MPG); })


    svg.append('line')
        .style("stroke", "black")
        .attr('id', 'horizLeft')

    svg.append('line')
        .style("stroke", "black")
        .attr('id', 'horizRight')

    svg.append('line')
        .style("stroke", "black")
        .attr('id', 'verticalUpper')

    svg.append('line')
        .style("stroke", "black")
        .attr('id', 'verticalLower')
    svg.on('mousemove', function (event) {
        crosshairs(event)
    })


    function crosshairs(event) {
        var x0 = d3.pointer(event)[0]
        var y0 = d3.pointer(event)[1]
        d3.select('#horizLeft')
            .attr('x1', 0)
            .attr('x2', x0 - 1)
            .attr('y1', y0)
            .attr('y2', y0)
        d3.select('#horizRight')
            .attr('x1', x0 + 1)
            .attr('x2', width)
            .attr('y1', y0)
            .attr('y2', y0)

        d3.select('#verticalLower')
            .attr('x1', x0)
            .attr('x2', x0)
            .attr('y1', 0)
            .attr('y2', y0 - 1)
        d3.select('#verticalUpper')
            .attr('x1', x0)
            .attr('x2', x0)
            .attr('y1', y0 + 1)
            .attr('y2', height)
    }
});










// data = FileAttachment("flare-2.json").json()
// partition = data => {
//     const root = d3.hierarchy(data)
//         .sum(d => d.value)
//         .sort((a, b) => b.value - a.value);
//     return d3.partition()
//         .size([2 * Math.PI, root.height + 1])
//       (root);
//   }
// color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
// format = d3.format(",d")
// width = 932
// radius = width / 6

// d3 = require("d3@6")


// arc = d3.arc()
//     .startAngle(d => d.x0)
//     .endAngle(d => d.x1)
//     .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
//     .padRadius(radius * 1.5)
//     .innerRadius(d => d.y0 * radius)
//     .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))




// chart = {
//     const root = partition(data);

//     const svg = d3.create("svg");

//     svg.append("g")
//         .attr("fill-opacity", 0.6)
//         .selectAll("path")
//         .data(root.descendants().filter(d => d.depth))
//         .join("path")
//         .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
//         .attr("d", arc)
//         .append("title")
//         .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

//     svg.append("g")
//         .attr("pointer-events", "none")
//         .attr("text-anchor", "middle")
//         .attr("font-size", 10)
//         .attr("font-family", "sans-serif")
//         .selectAll("text")
//         .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
//         .join("text")
//         .attr("transform", function (d) {
//             const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
//             const y = (d.y0 + d.y1) / 2;
//             return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
//         })
//         .attr("dy", "0.35em")
//         .text(d => d.data.name);

//     return svg.attr("viewBox", autoBox).node();
// }


// function autoBox() {
//     document.body.appendChild(this);
//     const { x, y, width, height } = this.getBBox();
//     document.body.removeChild(this);
//     return [x, y, width, height];
// }


// data = FileAttachment("flare-2.json").json()


// partition = data => d3.partition()
//     .size([2 * Math.PI, radius])
//     (d3.hierarchy(data)
//         .sum(d => d.value)
//         .sort((a, b) => b.value - a.value))


// color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))

// format = d3.format(",d")

// width = 975

// radius = width / 2

// arc = d3.arc()
//     .startAngle(d => d.x0)
//     .endAngle(d => d.x1)
//     .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
//     .padRadius(radius / 2)
//     .innerRadius(d => d.y0)
//     .outerRadius(d => d.y1 - 1)

// d3 = require("d3@6")





