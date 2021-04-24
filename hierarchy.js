// var margin = {top: 0, bottom: 80, left: 50, right: 80};
// var width = 960;
// var height = 500;

// // Generate svg
// var g = d3.select('body').append('svg')
//     .attr('width', width)
//     .attr('height', height)
//     .append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
//     .attr('width', width - margin.left - margin.right)
//     .attr('height', height - margin.top - margin.bottom);

// // Create cluster
// var cluster = d3.cluster()
//   .size([height - margin.bottom - margin.top, width - margin.right - margin.left]);

// // Get data
// d3.json("https://raw.githubusercontent.com/imogencs/04-multiple-views/main/animals2.json", function(error, data) {

//   if (error) throw error;

//   // If data is already in a hierarchical form
//   // such as json, it can directly be passed
//   // into to d3.hierarchy. If not
//   // use d3.stratify
//   var root = d3.hierarchy(data);

//   // By assigning the root to cluster
//   // the x and y values are computed
//   cluster(root);

//   // Add links between the nodes
//   var link = g.selectAll(".link")
//       // root.descendants() returns an array
//       // of all elements in the hierarchy with
//       // parent and children methods.
//       // The first element is not necessary
//       // because we can infer the x and y
//       // coordinates from the parent attribute
//       // of the first children
//       .data(root.descendants().slice(1))
//       .enter().append("path")
//       .attr("class", "link")
//       .attr("d", function(d) {
//         return "M" + d.y + "," + d.x
//             + "C" + (d.parent.y + 100) + "," + d.x
//             + " " + (d.parent.y + 100) + "," + d.parent.x
//             + " " + d.parent.y + "," + d.parent.x;
//       });

//   // Create g element which holds
//   // the circles and texts
//   var node = g.selectAll(".node")
//       .data(root.descendants())
//       .enter().append("g")
//       .attr("class", function(d) {
//         // If node has children assign a different
//         // class to the g element
//         return "node" + (d.children ? " node--internal" : " node--leaf");
//       })
//       .attr("transform", function(d) {
//         return "translate(" + d.y + "," + d.x + ")";
//       });

//   // Append circles
//   node.append("circle")
//       .attr("r", 2.5);

//   // Append text
//   node.append("text")
//       .attr("dy", 5)
//       .attr("x", function(d) {
//         // If element has children change the
//         // relative x coordinate
//         return d.children ? -8 : 8;
//       })
//       .style("text-anchor", function(d) {
//         // If element has children anchor text
//         // and the end. If not at the start
//         return d.children ? "end" : "start";
//       })
//       .text(function(d) {
//         return d.data.name;
//       });
// });






const width = window.innerWidth,
    height = window.innerHeight,
    maxRadius = (Math.min(width, height) / 2) - 5;

const formatNumber = d3.format(',d');

const x = d3.scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

const y = d3.scaleSqrt()
    .range([maxRadius * .1, maxRadius]);

const color = d3.scaleOrdinal(d3.schemeCategory20);

const partition = d3.partition();

const arc = d3.arc()
    .startAngle(d => x(d.x0))
    .endAngle(d => x(d.x1))
    .innerRadius(d => Math.max(0, y(d.y0)))
    .outerRadius(d => Math.max(0, y(d.y1)));

const middleArcLine = d => {
    const halfPi = Math.PI / 2;
    const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }

    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
};

const textFits = d => {
    const CHAR_SPACE = 6;

    const deltaAngle = x(d.x1) - x(d.x0);
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    // console.log(d)
    // console.log(d.data)
    // console.log(d.data.name)
    // console.log(d.name)
    return d.data.name.length * CHAR_SPACE < perimeter;
};

const svg = d3.select('body').append('svg')
    .style('width', '100vw')
    .style('height', '100vh')
    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
    .on('click', () => focusOn()); // Reset zoom on canvas click

d3.json('https://raw.githubusercontent.com/imogencs/04-multiple-views/main/animale22.json', (error, root) => {
    if (error) throw error;
    // console.log(root)

    root = d3.hierarchy(root);
    root.sum(d => d.size);

    const slice = svg.selectAll('g.slice')
        .data(partition(root).descendants());

    slice.exit().remove();


    const newSlice = slice.enter()
        .append('g').attr('class', 'slice')
        .on('click', d => {
            d3.event.stopPropagation();
            focusOn(d);
        });

    newSlice.append('title')
        .text(d => d.data.name + '\n' + formatNumber(d.value));


    // console.log("here 1")
    newSlice.append('path')
        .attr('class', 'main-arc')
        // .style('fill', d => color((d.children ? d : d.parent).name))
        .style('fill', function () {
            return "hsl(" + Math.random() * 360 + ",100%,50%)";
        })
        .attr('d', arc);
    // console.log("here 2")

    newSlice.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', middleArcLine);
    // console.log("here 3")
    const text = newSlice.append('text')
        .attr('display', d => textFits(d) ? null : 'none');
    // console.log("here 4")
    // Add white contour
    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text(d => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 5)
        .style('stroke-linejoin', 'round');

    console.log("here 5")
    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text(d => d.data.name);
});

function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    // Reset to top-level if no data point specified

    const transition = svg.transition()
        .duration(750)
        .tween('scale', () => {
            const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]);
            return t => { x.domain(xd(t)); y.domain(yd(t)); };
        });

    transition.selectAll('path.main-arc')
        .attrTween('d', d => () => arc(d));

    transition.selectAll('path.hidden-arc')
        .attrTween('d', d => () => middleArcLine(d));

    transition.selectAll('text')
        .attrTween('display', d => () => textFits(d) ? null : 'none');

    moveStackToFront(d);

    //

    function moveStackToFront(elD) {
        svg.selectAll('.slice').filter(d => d === elD)
            .each(function (d) {
                this.parentNode.appendChild(this);
                if (d.parent) { moveStackToFront(d.parent); }
            })
    }
}
