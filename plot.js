fakeSendData = {"f": 4, "values": [[1,2], [60, 70]]}
fakeReturnData = {"output":[[1,20,40,0,0,0.25],[1,25,25,5,0,0.25], [2,60,80,9,0,0.75]]}

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
width = 1000 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
.append("svg")
.attr("id", "graph_svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// color for dots (defined globally so that flip function knows the current state)
const colorScale1 = d3.scaleLinear()
	.domain([0, 100])
	.range(["#FFFE00", "#E900FF"]);

//new colors
const colorScale2 = d3.scaleLinear()
    .domain([0, 100])
    .range(["#E900FF", "#FFFE00"]);

//color mode
var colorMode = colorScale1;

// Add X axis
const x = d3.scaleLinear()
.domain([0, 100])
.range([ 0, width]);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleLinear()
.domain([0, 100])
.range([ height, 0]);
svg.append("g")
.call(d3.axisLeft(y));

// Add gridlines
const inner_height = height - margin.top - margin.bottom;
const xAxisGrid = d3.axisBottom(x).tickSize(-(97/90)*inner_height).tickFormat('').ticks(20); // 97/90*inner_height to cover entire graph, not sure why
svg.append('g')
.attr('class', 'x axis-grid')
.attr('transform', 'translate(0,' + height + ')')
.call(xAxisGrid);

const inner_width  = width - margin.left - margin.right;
const yAxisGrid = d3.axisLeft(y).tickSize(-(10/9)*inner_width).tickFormat('').ticks(20); // 10/9*inner_width to cover entire graph, not sure why
svg.append('g')
.attr('class', 'y axis-grid')
.call(yAxisGrid);

svg.append('g')
.attr("id", "dots");

// edit or view mode
var mode = "editMode";



function editMode() {
    console.log("editing...");
    mode = "editMode";
    const editButton = document.querySelector('#edit');
    editButton.disabled = true;
    const viewButton = document.querySelector('#view');
    viewButton.disabled = false;
    const clearButton = document.querySelector('#clear');
    clearButton.disabled = false;
    drawPlot();
}

function viewMode() {
    console.log("viewing...");
    mode = "viewMode";
    const editButton = document.querySelector('#edit');
    editButton.disabled = false;
    const viewButton = document.querySelector('#view');
    viewButton.disabled = true;
    const clearButton = document.querySelector('#clear');
    clearButton.disabled = true;
    drawPlot();
}

//clear
function clearing() {
    console.log("clearing...");
    svg.selectAll('circle').remove();
}

function handleClear() {
    const confirmation = confirm("Are you sure you want to clear all nodes?");
    if (confirmation) {
        clearing();
    }
}

function determineColor(delay, round, failed = false) {
    if (mode == "editMode") {
        return "grey";
    }
    if (mode == "viewMode") {
        if (failed) {
            return "black";
        }
        if(document.getElementById('delay').checked) {
            const color = d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(["red", "yellow", "green"]);
            return color(delay);
        }
        if (document.getElementById('round').checked) {
            const color = d3.scaleLinear()
            .domain([0, 5, 10])
            .range(["red", "yellow", "green"]);
            return color(round);
        }
    }
}

function addDot(xCoor, yCoor, color = "grey") {
    d3.select("#dots")
    .insert("circle", ":first-child")
    .attr("cx", xCoor)
    .attr("cy", yCoor)
    .attr("r", 30)
    .style('fill', color);
    //.style('fill', colorMode(100*xCoor/(width))); //manually get text coordinate
}

function addDotText() {
    var textInput = document.getElementById('addCoors');
    const coordinates = textInput.value.split(" ");
    const xCoor = coordinates[0];
    const yCoor = coordinates[1];
    if (Number.isInteger(+xCoor) && Number.isInteger(+yCoor)) {
        if (mode != "editMode"){
            editMode();
        }
        addDot(x(xCoor), y(yCoor));
    }
    textInput.value = "";
}

function addDotClick() {
    console.log("listening for clicks...")
    d3.select('svg').on("click", function(event) {
        if (mode == "editMode") {
            var coors = [d3.pointer(event)[0], d3.pointer(event)[1]];
            console.log("coors", coors);
            if (coors[0]-62 >= 0 && coors[0]-62 <= 910 && coors[1]-13.21875 >= 0 && coors[1]-13.21875 <= 560) {
                console.log("adding dot clicking...")
                addDot(coors[0]-62, coors[1]-13.21875); // found through trial and error, may need redo
            }
        }
      });
}

function deleteDot() {
    var textInput = document.getElementById('delCoors');
    const coordinates = textInput.value.split(" ");
    const xCoor = coordinates[0];
    const yCoor = coordinates[1];
    if (Number.isInteger(+xCoor) && Number.isInteger(+yCoor)) {
        if (mode != "editMode") {
            editMode();
        }
        d3.select("#dots")
        .selectAll("circle")
        .filter(function() {return d3.select(this).attr("cx") == x(xCoor);})
        .filter(function() {return d3.select(this).attr("cy") == y(yCoor);})
        .remove();
    }
    textInput.value = "";  
}

function run() {
    console.log('running...');
    if (mode != "newMode") {
        viewMode();
    }
    drawPlot();
}

function drawPlot() {
    clearing();
    if (mode == "viewMode") {
        for (const node of fakeReturnData["output"]) {
            const delay = Math.random();
            const round = node[3];
            addDot(x(node[1]), y(node[2]), determineColor(delay, round));
            console.log(determineColor(delay, node[3]));
        }
    }
    if (mode == "editMode") {
        for (const node of fakeSendData["values"]) {
            addDot(x(node[0]), y(node[1]));
        }
    }
}

function colorDelay() {
    console.log("color delay");
}
function colorRound() {
    console.log("color round");
}

addDotClick();