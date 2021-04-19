let data;
let states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],
    ages = [0, 1, 2, 3, 4, 5],
    yearBottom = 1999,
    yearTop = 2019;

const margin = {top: 10, right: 30, bottom: 40, left: 60},
    width = 690 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    textOffset = {x: 30, y: -50},
    transitionDuration = 500;

let yearAttr = new Object(),
    ageAttr = new Object();

function initializeData() {
    var request = new XMLHttpRequest();
    request.open("GET", "./raw_data.csv");
    request.onreadystatechange = () => {
        if (request.readyState === 4 && (request.status === 200 || request.status === 0)) {
            data = csvToDim3Table(request.responseText);
            initializeYearData();
            initializeAgeData();
        }
    }
    request.send();
}

// Create Year Graph
function initializeYearData() {
    // Append SVG Object
    yearAttr.svg = d3.select("#year-data")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X Axis
    yearAttr.x = d3.scaleTime()
        .range([0, width]);
    yearAttr.xAxis = d3.axisBottom().scale(yearAttr.x).tickFormat(d3.timeFormat("%Y"));
    yearAttr.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "lineXAxis");
    yearAttr.svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + textOffset.x)
        .style("text-anchor", "middle")
        .text("Year");

    // Add Y Axis
    yearAttr.y = d3.scaleLinear()
        .range([height, 0]);
    yearAttr.yAxis = d3.axisLeft().scale(yearAttr.y);
    yearAttr.svg.append("g")
        .attr("class", "lineYAxis");
    yearAttr.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", textOffset.y)
        .attr("x", - height / 2)
        .style("text-anchor", "middle")
        .text("People");

    // Add Brush
    yearAttr.brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", e => {
            var bounds = e.selection == null ?
                yearAttr.x.domain() :
                [yearAttr.x.invert(e.selection[0]), yearAttr.x.invert(e.selection[1])];
            yearBottom = bounds[0].getFullYear();
            yearTop = bounds[1].getFullYear();
            updateAgeData();
        });
    
    // Create Clip Path
    yearAttr.svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Create Line Group
    var line = yearAttr.svg.append('g')
        .attr("clip-path", "url(#clip)")
    line.append("g")
        .attr("class", "brush")
        .call(yearAttr.brush);

    updateYearData();
}

// Update Year Data
function updateYearData() {
    var yearData = data.getYearData(ages, states);

    // Create X Axis
    yearAttr.x.domain(d3.extent(yearData, d => d.x));
    yearAttr.svg.selectAll(".lineXAxis")
        .transition()
        .duration(transitionDuration)
        .call(yearAttr.xAxis);

    // Create Y Axis
    yearAttr.y.domain([0, d3.max(yearData, d => d.y)]);
    yearAttr.svg.selectAll(".lineYAxis")
        .transition()
        .duration(transitionDuration)
        .call(yearAttr.yAxis);

    // Bind Data
    var update = yearAttr.svg.selectAll(".line")
        .data([yearData], d => d.x);

    // Update Selection
    update.enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .merge(update)
        .transition()
        .duration(transitionDuration)
        .attr("d", d3.line()
            .x(d => yearAttr.x(d.x))
            .y(d => yearAttr.y(d.y))
        );
}

// Create Age Graph
function initializeAgeData() {
    // Append SVG Object
    ageAttr.svg = d3.select("#age-data")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X Axis
    ageAttr.x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    ageAttr.xAxis = d3.axisBottom().scale(ageAttr.x);
    ageAttr.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "barXAxis");
    ageAttr.svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + textOffset.x)
        .style("text-anchor", "middle")
        .text("Age Group");

    // Add Y Axis
    ageAttr.y = d3.scaleLinear()
        .range([height, 0]);
    ageAttr.yAxis = d3.axisLeft().scale(ageAttr.y);
    ageAttr.svg.append("g")
        .attr("class", "barYAxis");
    ageAttr.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", textOffset.y)
        .attr("x", - height / 2)
        .style("text-anchor", "middle")
        .text("People");

    updateAgeData();
}

// Update Age Data
function updateAgeData() {
    var ageData = data.getAgeData(yearBottom, yearTop, states);

    // Create X Axis
    ageAttr.x.domain(ageData.map(d => d.x));
    ageAttr.svg.selectAll(".barXAxis")
        .transition()
        .duration(transitionDuration)
        .call(ageAttr.xAxis);

    // Create Y Axis
    ageAttr.y.domain([0, d3.max(ageData, d => d.y)]);
    ageAttr.svg.selectAll(".barYAxis")
        .transition()
        .duration(transitionDuration)
        .call(ageAttr.yAxis);
    
    // Bind Data
    var update = ageAttr.svg.selectAll(".bar")
        .data(ageData, d => d.x);

    // Update Selection
    update.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-group", d => getAgeGroup(d.x))
        .attr("fill", d => ages.includes(getAgeGroup(d.x)) ? "steelblue" : "lightgray")
        .attr("x", d => ageAttr.x(d.x))
        .attr("width", ageAttr.x.bandwidth())
        .attr("y", d => ageAttr.y(0))
        .attr("height", d => height - ageAttr.y(0))
        .on('click', e => {
            var active = e.target.getAttribute("fill") === "steelblue",
                group = parseInt(e.target.dataset.group);
            if (active && ages.length != 1 || !active) {
                d3.select(e.target).attr("fill", active ? "lightgray" : "steelblue");
                if (active) removeFromList(ages, group);
                else ages.push(group);
                updateYearData();
            }
        })
        .merge(update)
        .transition()
        .duration(transitionDuration)
        .attr("y", d => ageAttr.y(d.y))
        .attr("height", d => height - ageAttr.y(d.y));
}

window.onload = initializeData;