// references
// https://bl.ocks.org/mbostock/ca5b03a33affa4160321
// https://medium.com/@mbostock/a-better-way-to-code-2b1d2876a3a0

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var format = d3.format(",d");

var color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-4, 4]);

var stratify = d3.stratify()
    .parentId(function (d) {
        console.log(d.value)
        console.log(d)
        return d.class.substring(0, d.class.lastIndexOf("."));
    });

var pack = d3.pack()
    .size([width - 2, height - 2])
    .padding(3);




var nest = d3.nest()
    .key(function (d) {
        return d.Kingdom;
    })
    .key(function (d) {
        return d.Phylum;
    })
    .key(function (d) { return d.Class; })
    .key(function (d) { return d.Over; })

    .key(function (d) {
        console.log(d.Family)
        return d.Family;
    })
    .key(function (d) {
        console.log(d.Genus)
        return d.Genus;
    })
    .key(function (d, i) {
        console.log(d.Species, i)
        return d.Species;
    })
    .rollup(function (d) { return d3.sum(d, function (d) { return d.Species; }); });

// var treemap = d3.treemap()
//     .size([width, height])
//     .padding(1)
//     .round(true);

d3.csv("https://raw.githubusercontent.com/imogencs/04-multiple-views/main/simple_reptiles.csv", function (data) {
    // console.log(data.columns)


    var root = d3.hierarchy({ values: nest.entries(data) }, function (d) { return d.values; })
        .sum(function (d) { return d.value; })
        .sort(function (a, b) { return b.value - a.value; });

    // treemap(root);

    // var root = stratify(data)
    //     .sum(function (d) { return d.value; })
    //     .sort(function (a, b) { return b.value - a.value; });

    pack(root);


    // console.log(data)
    // // console.log(data.value)
    // var root = stratify(data)
    //     .sum(function (d) {
    //         console.log(d.value)
    //         return d.value;
    //     })
    //     .sort(function (a, b) { return b.value - a.value; });
    // console.log(root)

    // pack(root);

    var node = svg.select("g")
        .selectAll("g")
        .data(root.descendants())
        .enter().append("g")
        // .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("class", function (d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
        .each(function (d) { d.node = this; })
        .on("mouseover", hovered(true))
        .on("mouseout", hovered(false));

    node.append("circle")
        .attr("id", function (d) { return "node-" + d.class; })
        // .attr("r", function (d) { return d.r; })
        .attr("r", 20)
        .style("fill", function (d) { return color(d.depth); });

    var leaf = node.filter(function (d) { return !d.children; });

    leaf.append("clipPath")
        .attr("id", function (d) { return "clip-" + d.class; })
        .append("use")
        .attr("xlink:href", function (d) { return "#node-" + d.class + ""; });

    leaf.append("text")
        .attr("clip-path", function (d) { return "url(#clip-" + d.class + ")"; })
        .selectAll("tspan")
        .data(function (d) {
            console.log(d.class)
            return d.class.substring(d.class.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g);
        })
        .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function (d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
        .text(function (d) { return d; });

    node.append("title")
        .text(function (d) { return d.class + "\n" + format(d.value); });

    svg.append('circle')
        .attr('r', 10)
});

function hovered(hover) {
    return function (d) {
        d3.selectAll(d.ancestors().map(function (d) { return d.node; })).classed("node--hover", hover);
    };
}
