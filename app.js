//app.js

//global variables
var all_coordinates = [];
var view_json = [];
var spliited;
var data_return;
var global_edit_failures = 0
var global_edit_rounds = 0
var global_view_failures = 0
var global_view_rounds = 0
var global_view_round = -1
var mode = "editMode";

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

// Add element for dots
svg.append('g')
.attr("id", "dots");

// Tooltip setup for hovering on dots for info
var tooltip = d3.select("#tooltip")
  .append("div")
  .style("opacity", 1)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip")

// Changes mode to edit mode  
function editMode() {
    console.log("editing...");
    mode = "editMode";
    const editButton = document.querySelector('#edit');
    editButton.disabled = true;
    const viewButton = document.querySelector('#view');
    viewButton.disabled = false;

    // Checks whether clear button should be available
    const clearButton = document.querySelector('#clear');
    if (isBlankCanvas()) {
        clearButton.disabled = true;
    } else {
        clearButton.disabled = false;
    }

    drawPlot();

    // Disable the viewing nodes by round button
    const roundButton = document.querySelector('#viewRoundButton');
    roundButton.disabled = true;

    // Display the failures and rounds that they last had when they were editing
    document.getElementById("failureNumber").innerHTML = ("Failures: " + global_edit_failures);
    document.getElementById("roundNumber").innerHTML = ("Rounds: " + global_edit_rounds);
}

// Changes mode to view mode
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

    // Eisable the viewing nodes by round button
    const roundButton = document.querySelector('#viewRoundButton');
    roundButton.disabled = false;

    // Display the failures and rounds from their last run
    document.getElementById("failureNumber").innerHTML = ("Failures: " + global_view_failures);
    document.getElementById("roundNumber").innerHTML = ("Rounds: " + global_view_rounds);
}

// Clear all dots
function clearing() {
    console.log("clearing...");
    svg.selectAll('circle').remove();
}

// Handle when the user presses clear
function handleClear() {
    const confirmation = confirm("Are you sure you want to reset?");
    if (confirmation) {
        // Clear dots
        clearing();
        
        // Clear stored coordinates
        all_coordinates = []

        button = document.getElementById('clear');
        button.disabled = true;
        var failures = document.getElementById('failure');
        failures.value = "0";
        updateFailures();
        var rounds = document.getElementById('rounds');
        rounds.value = "0";
        updateRounds();
    }
}

// Determine color of a dot; currently using linear scaling
function determineColor(delay, round, maxDelay, maxRounds, failed = 0) {
    if (mode == "editMode") {
        return "grey";
    }
    if (mode == "viewMode") {
        if (failed == 1) {
            return "black";
        }
        if(document.getElementById('delay').checked) {
            const color = d3.scaleLinear()
            .domain([0, maxDelay/2, maxDelay])
            .range(["red", "yellow", "green"]);
            return color(delay);
        }
        if (document.getElementById('round').checked) {
            const color = d3.scaleLinear()
            .domain([1, (maxRounds+1)/2, maxRounds])
            .range(["red", "yellow", "green"]);
            return color(round);
        }
    }
}

// Add a dot to the grid WITHOUT storing it internally in the list of coordinates
function addDotRaw(xCoor, yCoor, color = "grey") {
    d3.select("#dots")
    .insert("circle", ":first-child")
    .attr("cx", xCoor)
    .attr("cy", yCoor)
    .attr("r", 10)
    .style('fill', color)
    .on("mousemove", function(d) {
        return tooltip.text(d.value + ": " + d.value);
      })
    .on("mousemove", function(d) {
        // Grabbing relevant info from view_json for tooltip that shows on hover
        var display = 0
        for (var i = 0; i < view_json.length; i++) {
            display = 0
            var node_id = 0
            var xx = 0
            var yy = 0
            var round = 0
            var delay = 0
            var failed = "True"
            if ((view_json[i][1] == xCoor) & (view_json[i][2] == yCoor)) {
                display = view_json[i]
                node_id = view_json[i][0]
                xx = Math.round(x.invert(view_json[i][1]) * 100) / 100
                yy = Math.round(y.invert(view_json[i][2]) * 100) / 100
                round = view_json[i][3]
                delay = view_json[i][5]
                if (view_json[i][4] == 0) {
                    failed = "False"
                }
                break
            }
        }
        tooltip
        .style("visibility", "visible")
        .html(
            "Node ID: "+ node_id + "<br>"
            + "The round of this node is: "+ round + "<br>"
            + "The x,y coordinates are: " + xx +", "+ yy + "<br>"
            + "Elapsed time: " + delay + " ms" +  "<br>"
            + "Failed: " + failed +  "<br>"
            )
      })
    .on("mouseout", function(d) {
        return tooltip.style("visibility", "hidden");
      });
}

// Add dot to graph and add coordinates to storage
function addDot(xCoor, yCoor, color = "grey") {
    d3.select("#dots")
    .insert("circle", ":first-child")
    .attr("cx", xCoor)
    .attr("cy", yCoor)
    .attr("r", 10)
    .style('fill', color);
    
    button = document.getElementById('clear');
    button.disabled = false;

    //adding to the global array
    xx = parseFloat(xCoor)
    yy = parseFloat(yCoor)
    temp = []
    temp.push(xx,yy)
    all_coordinates.push(temp)
}

// Add dot through text input
function addDotText() {
    var textInput = document.getElementById('addCoors');
    const coordinates = textInput.value.split(" ");
    const xCoor = coordinates[0];
    const yCoor = coordinates[1];
    console.log(((+xCoor) >= 0 && (+yCoor) >= 0));
    if ((+xCoor) >= 0 && (+xCoor) <= 100 && (+yCoor) >= 0 && (+yCoor) <= 100) {
        if (mode != "editMode"){
            editMode();
        }
        addDot(x(xCoor), y(yCoor));
    }
    textInput.value = "";
}

// Add dot through click input
function addDotClick() {
    d3.select('svg').on("click", function(event) {
        if (mode == "editMode") {
            var coors = [d3.pointer(event)[0], d3.pointer(event)[1]];
            // Found constants through trial and error, needed to use a newer version of D3 than set up for project
            if (coors[0]-62 >= 0 && coors[0]-62 <= 910 && coors[1]-13.21875 >= 0 && coors[1]-13.21875 <= 560) {
                addDot(coors[0]-62, coors[1]-13.21875); 
            }
        }
      });
}

// Delete a dot through text input
function deleteDot() {
    var textInput = document.getElementById('delCoors');
    const coordinates = textInput.value.split(" ");
    const xCoor = coordinates[0];
    const yCoor = coordinates[1];
    if (Number.isInteger(+xCoor) && Number.isInteger(+yCoor)) {
        if (mode != "editMode") {
            editMode();
        }
        for (var i = 0; i < all_coordinates.length; i++) {
            temp = []
            xx = x(xCoor)
            yy = y(yCoor)
            temp.push(xx,yy)
            if (temp == all_coordinates[i].toString()) {
                all_coordinates.splice(i,1);
            }        
        }

        d3.select("#dots")
        .selectAll("circle")
        .filter(function() {return d3.select(this).attr("cx") == x(xCoor);})
        .filter(function() {return d3.select(this).attr("cy") == y(yCoor);})
        .remove();

        if (isBlankCanvas()) {
            button = document.getElementById('clear');
            button.disabled = true;
        }
    }
    textInput.value = "";
}

// Run the algorithm
function run() {
    global_view_round = -1;
    global_view_failures = global_edit_failures;
    global_view_rounds = global_edit_rounds;
    create_JSON()
    view_json = []
    // Give 5 seconds to gaurentee response
    setTimeout(function(){
        if (mode != "viewMode") {
        viewMode()
    } else{
        drawPlot();     
    }
}, 5000)
}

// Draw the appropriate dots
function drawPlot(viewRound = -1) {
    const storeNodes = all_coordinates;
    clearing();
    if (mode == "viewMode") {
        // Calculate max delay and max rounds for colors
        var delays = [];
        var rounds = [];
        for (var i = 0; i < view_json.length; i++) {
            delays.push(Number(view_json[i][5]));
            rounds.push(Number(view_json[i][3]));
        }
        const maxDelay = Math.max(...delays);
        const maxRounds = Math.max(...rounds);

        // Add each dot
        for (var i = 0; i < view_json.length; i++) {
            const delay = view_json[i][5];
            const round = view_json[i][3];
            const failed = view_json[i][4];
            if (viewRound == -1){
                addDotRaw((view_json[i][1]), (view_json[i][2]), determineColor(delay, round, maxDelay, maxRounds, failed));
            }
            else {
                if (round == viewRound) {
                    addDotRaw((view_json[i][1]), (view_json[i][2]), determineColor(delay, round, maxDelay, maxRounds, failed));
                }
            }
        }
    }
    if (mode == "editMode") {
        console.log("storeNodes: ", storeNodes);
        for (const node of storeNodes) {
            addDotRaw(node[0], node[1]);
        }
    }
}

// Update the number of failures to run the algorithm with
function updateFailures() {
    var failures = document.getElementById('failure');
    if (Number.isInteger(Number(failures.value)) && (Number(failures.value) > 0 || failures.value == "0")) {
        global_edit_failures = Number(failures.value)
        document.getElementById("failureNumber").innerHTML = ("Failures: " + Number(failures.value));
        failures.value = "";
        if (mode != "editMode") {
            editMode();
        }
        button = document.getElementById('clear');
        if (isBlankCanvas()) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    }
}

// Update the number of rounds to run the algorithm with
function updateRounds() {
    var rounds = document.getElementById('rounds');
    if (Number.isInteger(Number(rounds.value)) && (Number(rounds.value) > 0 || rounds.value == "0")) {
        global_edit_rounds = Number(rounds.value)
        document.getElementById("roundNumber").innerHTML = ("Rounds: " + Number(rounds.value));
        rounds.value = "";
        if (mode != "editMode") {
            editMode();
        }
        button = document.getElementById('clear');
        if (isBlankCanvas()) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    }
}

// Update which round of dots the user is viewing
function updateViewRound() {
    var round = document.getElementById('addViewRound');
    console.log("first condition: ", Number.isInteger(Number(round.value)));
    console.log("second condition: ", (round.value == "0"));
    if (Number.isInteger(Number(round.value)) && (Number(round.value) > 0 || round.value == "0" || round.value == "-1")) {
        global_view_round = Number(round.value);
        drawPlot(global_view_round);
        round.value = "";
        console.log("should be updating");
    }
    console.log("updating view round");
    

}

// Check if there is any edits made from a blank page (used to know whether clear should be an option)
function isBlankCanvas() {
    return (all_coordinates.length == 0 && global_edit_failures == 0 && global_edit_rounds == 0)
}
// start listening for clicks
addDotClick();

var btn_run = document.getElementById("run")
var btn_rounds = document.getElementById("rounds")
function create_JSON() {
    const to_send = {
        "F": parseInt(global_edit_failures),
        "R": parseInt(global_edit_rounds),
        "Values": all_coordinates
    }
    const data = JSON.stringify(to_send)
    var http = new XMLHttpRequest();
    var url = 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/cors/helloWorld';
    http.open('POST', url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-Type', 'application/json');

    http.send(data);
    http.onload = function() {
        if (http.status != 200) { // analyze HTTP status of the response
          alert(`Error ${http.status}: ${http.statusText}`); // e.g. 404: Not Found
        } else { // show the result
            data_return = http.response
            console.log(typeof(data_return))
            splitted = data_return.slice(11,data_return.length - 2)
            var splitted1 = JSON.parse("[" + splitted + "]");
            parse_data(splitted1);
        }
      };
}

function parse_data (x) {
    for(var key in x) {
        view_json.push(x[key])
     }
}



