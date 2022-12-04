//const fs = require('fs')
//const fileSystem = require("browserify-fs")

//global array for the coordinates
var all_coordinates = [];

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
	.domain([0, 4000])
	.range(["#FF0000", "#00FF00"]);

//new colors
const colorScale2 = d3.scaleLinear()
    .domain([0, 4000])
    .range(["#00FF00", "#FF0000"]);

//color mode
var colorMode = colorScale1;

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

function drawDots() {
    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then( function(data) {

    // Add dots
    svg.append('g')
    .attr("id", "dots")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", function (d) { return x(d.GrLivArea); } )
    .attr("cy", function (d) { return y(d.SalePrice); } )
    .attr("r", 1.5)
    .style('fill', function(d) {return colorMode(d.GrLivArea); });
    })
}

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

    if (colorMode == colorScale1) {
        colorMode = colorScale2;
    } else {
        colorMode = colorScale1;
    };

    clearing();
    drawDots();
}

//clear
function clearing() {
    console.log("clearing...");
    svg.selectAll('circle').remove();
}

function addDot() {
    var textInput = document.getElementById('addCoors');
    const coordinates = textInput.value.split(" ");
    // adding coordinates to global array to be used to create json
    all_coordinates.push(coordinates)
    const xCoor = coordinates[0];
    const yCoor = coordinates[1];

    console.log(textInput.value);
    console.log(xCoor);
    console.log(yCoor);

    textInput.value = "";

//    console.log(d3.select("#dots"));

    d3.select("#dots")
    .insert("circle", ":first-child")
    .attr("cx", x(xCoor))
    .attr("cy", y(yCoor))
    .attr("r", 30)
    .style('fill', colorMode(xCoor));   
}

function deleteDot() {
    var textInput = document.getElementById('delCoors');
    const coordinates = textInput.value.split(" ");
    //this for loops deletes the coordinates from the all_coordinates array
    for (var i = 0; i < all_coordinates.length; i++) {
        if (coordinates.toString() == all_coordinates[i].toString()) {
            all_coordinates.splice(i,1);
        }        
    }
    const xCoor = coordinates[0];
    const yCoor = coordinates[1];

    // console.log(textInput.value);
    // console.log(xCoor);
    // console.log(yCoor);

    textInput.value = "";

   // console.log(d3.select("#dots"));

    d3.select("#dots")
    .selectAll("circle")
    .filter(function() {return d3.select(this).attr("cx") == x(xCoor);})
    .filter(function() {return d3.select(this).attr("cy") == y(yCoor);})
    .remove();
    
    //console.log(all_coordinates)
}

drawDots();

var btn = document.getElementById("view")
function create_JSON() {
    var failures = document.getElementById('failure');
    //console.log(failures.value) // amount of failures to be tolerated   
    //console.log(all_coordinates)

    const to_send = {
        "F": failures.value,
        "Values": all_coordinates
    }
    console.log(to_send)
    const data = JSON.stringify(to_send)
    console.log(data)
    var http = new XMLHttpRequest();
    var url = 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/helloWorld';
    //var params = 'orem=ipsum&name=binny';
    http.open('POST', url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-Type', 'application/json');

    http.send(data);
    // const sendData = () => {
    //     console.log('inhere')
    //     // sendHTTPRequest('POST', 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/helloWorld', {
    //     //     data
    //     // })
    //     sendHTTPRequest('POST', 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/helloWorld', data)
    // }
    //writeFile("./data.json", data );

    // fs.writeFile('data.json', data, err => {
    //     if (err) {
    //       throw err
    //     }
    //     console.log('JSON data is saved.')
    //   })
}
// when view is clicked, this creat_json file is ran
btn.addEventListener('click', create_JSON)


const sendHTTPRequest = (method, url, data) => {
    const promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = 'json';

        if(data) {
            xhr.setRequestHeader('Content-Type', 'application/json')
        }

        xhr.onload = () => {
            if(xhr.status >= 400) {
                reject(xhr.response)
            } else {
                resolve(xhr.response)
            }
        }
        xhr.onerror = () => {
            reject('Something went wrong')
        }
        xhr.send(JSON.stringify(data))

    })
    return promise;
}
const getData = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/helloWorld');

}

const sendData = () => {
    sendHTTPRequest('POST', 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/helloWorld', {
        //content??
        //move this const into the create json???
    })
}


//btn.addEventListener('click', create_JSON);


