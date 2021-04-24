// references
// https://bl.ocks.org/mbostock/ca5b03a33affa4160321
// https://medium.com/@mbostock/a-better-way-to-code-2b1d2876a3a0
// https://bl.ocks.org/vasturiano/12da9071095fbd4df434e60d52d2d58d

var margin = { top: 20, right: window.innerWidth / 10, bottom: 30, left: window.innerWidth / 10 }
width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
// const width = window.innerWidth,
//     height = window.innerHeight - 300

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", (3 * height + margin.top + margin.bottom))
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)


// const svg = d3.select('body').append('svg')
//     .style('width', '100vw')
//     .style('height', '100vh')
//     .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
//     .on('click', () => focusOn()); // Reset zoom on canvas click

let classToHighlight = 'Amphibia'

d3.csv("https://raw.githubusercontent.com/imogencs/04-multiple-views/main/animals2.csv", function (data) {

    classToHighlight = 'Amphibia'

    let classes = ['Amphibia', 'Aves', 'Bivalvia', 'Cephalaspidomorphi',
        'Chondrichthyes', 'Chondrostei', 'Chromadorea', 'Echinoidea',
        'Holostei', 'Insecta', 'Mammalia', 'Reptilia', 'Teleostei']

    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(classes)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    svg.append('rect')
        .style("fill", "none")
        .style("mouse-events", "all")
        .attr('width', width)
        .attr('height', height)
        // .on('mousemove', function (event) {
        //     console.log('here')
        //     crosshairs(event)
        // })
        .attr('id', 'background')

    // axes
    var x = d3.scaleTime()
        .range([0, width])
        .domain([0, 10000]);
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 10000]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append('text')
        .text('Days to Mature for Males')
        .attr('transform', 'rotate(-90)')
        .attr('x', -1 * height / 2)
        .attr('y', -50)

    // colors categorical by class
    // console.log(data.Class)
    var colormapper = d3.scaleOrdinal().domain(
        classes)
        .range(
            ['brown', 'blue', 'red', 'darkgreen',
                'purple', 'lightblue', 'pink', 'magenta',
                'yellow', 'black', 'orange', 'green', 'cyan']);

    // points
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", function (d) {
            // console.log(d.Maximumlongevity)
            // console.log('r')
            return (d.Maximumlongevity) / 5;
        })
        .attr("cx", function (d) {
            // console.log(d.Femalematurity)
            // console.log('x')
            return x(d.Femalematurity);
        })
        .attr("cy", function (d) {
            // console.log('y')
            return y(d.Malematurity);
        })
        .attr('fill', function (d) {
            if (d.Class == classToHighlight) {
                return 'black'
            }
            return colormapper(d.Class)
        })
        .style("opacity", function (d) {
            if (d.Class == classToHighlight) {
                return 1
            }
            return .4
        })
        .style('stroke', function (d) {
            if (d.Class == classToHighlight) {
                return colormapper(d.Class)
            }
            return 'none'
        })
        .on("mouseover", function (d) {
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", 'black')
                .raise()
            // d3.select()
        })
        .on("mouseout", function (d) {
            if (d.Class == classToHighlight) {
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", colormapper(d.Class))
            }
            else {
                d3.select(this)
                    .style("opacity", .4)
                    .style("stroke", 'none')
            }
        })
        .style('stroke-width', 2)
    // .filter(function (d) { return d.Class == selectedGroup })  // <== This line

    console.log('here 1')

    svg.selectAll("circle")
        .transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(2000)
        .attr("cx", function (d) { return x(d.Femalematurity); })
        .attr("cy", function (d) { return y(d.Malematurity); })

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
    // svg.on('mousemove', function (event) {
    //     console.log(event)
    //     crosshairs(event)
    // })
    console.log('here 2')

    // function crosshairs(event) {
    //     // console.log(event)
    //     var x0 = d3.mouse(event)[0]
    //     var y0 = d3.mouse(event)[1]
    //     d3.select('#horizLeft')
    //         .attr('x1', 0)
    //         .attr('x2', x0 - 1)
    //         .attr('y1', y0)
    //         .attr('y2', y0)
    //     d3.select('#horizRight')
    //         .attr('x1', x0 + 1)
    //         .attr('x2', width)
    //         .attr('y1', y0)
    //         .attr('y2', y0)
    //     d3.select('#verticalLower')
    //         .attr('x1', x0)
    //         .attr('x2', x0)
    //         .attr('y1', 0)
    //         .attr('y2', y0 - 1)
    //     d3.select('#verticalUpper')
    //         .attr('x1', x0)
    //         .attr('x2', x0)
    //         .attr('y1', y0 + 1)
    //         .attr('y2', height)
    // }
    // console.log('here 3')


    // A function that update the chart
    function update(selectedGroup) {

        // Create new data with the selection?
        // svg.selectAll("dot")
        //     .data(data)
        //     .enter().append("circle")

        // var dataFilter = data.filter(function (row) {
        //     row.Class != selectedGroup
        // })
        console.log(selectedGroup)



        // Give these new data to update line
        d3.selectAll('circle')
            .data(data)
            .style("opacity", function (d) {
                if (d.Class == classToHighlight) {
                    return 1
                }
                return .4
            })
            .attr('fill', function (d) {
                if (d.Class == classToHighlight) {
                    return 'black'
                }
                return colormapper(d.Class)
            })

            .style('stroke', function (d) {
                if (d.Class == classToHighlight) {
                    return colormapper(d.Class)
                }
                return 'none'
            })
            .style('stroke-width', 2)

        // d3.selectAll('table').remove()

        // var container = d3.select("body")
        //     .append("table")

        //     .selectAll("tr")
        //     .data(data).enter()
        //     .append("tr")

        //     .selectAll("td")
        //     .data(function (d) {
        //         if (d.Class == classToHighlight)
        //             return d;
        //         return null
        //     }).enter()
        //     .append("td")
        //     .text(function (d) {
        //         if (d.Class == classToHighlight)
        //             return d;
        //         return null
        //     })

    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function (d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        classToHighlight = selectedOption
        console.log(selectedOption)
        update(selectedOption)
        // selectedGroup = selectedOption
    })



    d3.text("https://raw.githubusercontent.com/imogencs/04-multiple-views/main/animals2.csv", function (data) {
        var parsedCSV = d3.csvParseRows(data);

        // let indeces = data[]

        var longevityColorScale = d3.scaleLinear()
            .domain([0, 550])
            .range(["red", "yellow", "green"]);

        var container = d3.select("body")
            .append("table")

            .selectAll("tr")
            .data(parsedCSV).enter()

            .append("tr")

            .selectAll("td")
            .data(function (d) {
                return d
            }).enter()
            .append("td")
            .text(function (d) {
                return d
            })
            .style("background-color", function (d, i) {
                // console.log(d.Class)
                if (d.Class == classToHighlight) {
                    return longevityColorScale(d);
                }
                return 'none'
            })


        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function (d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            classToHighlight = selectedOption
            svg.selectAll("tr")
                .style('background-color', 'cyan')
            // d3.select(this).classed("highlight", true);

            console.log(selectedOption)
            // update(selectedOption)
            // selectedGroup = selectedOption
        })


    });

});






// const width = window.innerWidth,
// const height = window.innerHeight,
const maxRadius = (Math.min(width, height) / 2) - 5;

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
    if (!d.data) { return false; }
    return d.data.name.length * CHAR_SPACE < perimeter;
};

d3.json('https://raw.githubusercontent.com/imogencs/04-multiple-views/main/animale22.json', (error, root) => {
    if (error) throw error;
    console.log(root)

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

    newSlice.append('path')
        .attr('class', 'main-arc')
        .style('fill', d => color((d.children ? d : d.parent).data.name))
        .attr('d', arc);

    newSlice.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', middleArcLine);

    const text = newSlice.append('text')
        .attr('display', d => textFits(d) ? null : 'none');

    // Add white contour
    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text(d => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 5)
        .style('stroke-linejoin', 'round');

    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text(d => d.data.name);

    d3.selectAll('g.slice')
        .attr("transform", "translate(" + width / 2 + "," + height * 1.8 + ")")

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


    function moveStackToFront(elD) {
        svg.selectAll('.slice').filter(d => d === elD)
            .each(function (d) {
                this.parentNode.appendChild(this);
                if (d.parent) { moveStackToFront(d.parent); }
            })
    }
}