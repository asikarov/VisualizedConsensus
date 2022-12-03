// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// color for dots (defined globally so that flip function knows the current state)
const colorScale1 = d3.scaleLinear()
	.domain([0, 4000])
	.range(["#FF0000", "#00FF00"]);

//new colors
const colorScale2 = d3.scaleLinear()
    .domain([0, 4000])
    .range(["#00FF00", "#FF0000"]);

//color mode
var colorMode = colorScale1;

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then( function(data) {

// Add X axis
const x = d3.scaleLinear()
.domain([0, 4000])
.range([ 0, width ]);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleLinear()
.domain([0, 500000])
.range([ height, 0]);
svg.append("g")
.call(d3.axisLeft(y));

// Add gridlines
const inner_height = height - margin.top - margin.bottom;
const xAxisGrid = d3.axisBottom(x).tickSize(-2*inner_height).tickFormat('').ticks(20); // 2*inner_height to cover entire graph, not sure why
svg.append('g')
  .attr('class', 'x axis-grid')
  .attr('transform', 'translate(0,' + height + ')')
  .call(xAxisGrid);

const inner_width  = width - margin.left - margin.right;
const yAxisGrid = d3.axisLeft(y).tickSize(-2*inner_width).tickFormat('').ticks(20); // 2*inner_width to cover entire graph, not sure why
svg.append('g')
  .attr('class', 'y axis-grid')
  .call(yAxisGrid);

// Add dots
svg.append('g')
.selectAll("dot")
.data(data)
.join("circle")
.attr("cx", function (d) { return x(d.GrLivArea); } )
.attr("cy", function (d) { return y(d.SalePrice); } )
.attr("r", 1.5)
.style('fill', function(d) {return colorMode(d.GrLivArea); });
})

function editMode() {
    console.log("editing...");
    const editButton = document.querySelector('#edit');
    editButton.disabled = true;
    const viewButton = document.querySelector('#view');
    viewButton.disabled = false;
    const clearButton = document.querySelector('#clear');
    clearButton.disabled = false;
    const flipButton = document.querySelector('#flip');
    flipButton.disabled = true;
}

function viewMode() {
    console.log("viewing...");
    const editButton = document.querySelector('#edit');
    editButton.disabled = false;
    const viewButton = document.querySelector('#view');
    viewButton.disabled = true;
    const clearButton = document.querySelector('#clear');
    clearButton.disabled = true;
    const flipButton = document.querySelector('#flip');
    flipButton.disabled = false;
}

//recolor dots
function flip() {
    console.log("flipping...");

    //determine new colorScale
    /*const element = document.querySelector("div > svg > g > g > circle");
    const scale = element.style.fill;
    console.log(element);
    console.log(scale);*/
    if (colorMode == colorScale1) {
        colorMode = colorScale2;
    } else {
        colorMode = colorScale1;
    };


    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then( function(data) {

    // Add X axis
    const x = d3.scaleLinear()
    .domain([0, 4000])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
    
    // Add Y axis
    const y = d3.scaleLinear()
    .domain([0, 500000])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));
    
    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", function (d) { return x(d.GrLivArea); } )
    .attr("cy", function (d) { return y(d.SalePrice); } )
    .attr("r", 1.5)
    .style('fill', function(d) {return colorMode(d.GrLivArea); });
    })
}

//clear
function clearing() {
    console.log("clearing...");

    //determine new colorScale
    /*const element = document.querySelector("div > svg > g > g > circle");
    const scale = element.style.fill;
    console.log(element);
    console.log(scale);*/
    if (colorMode == colorScale1) {
        colorMode = colorScale2;
    } else {
        colorMode = colorScale1;
    };

    svg.selectAll('circle').remove();
}