//global variables
var all_coordinates = [];
var view_json = [];
var spliited;
var data_return;
var global_edit_failures = 0
var global_edit_rounds = 0
var global_view_failures = 0
var global_view_rounds = 0

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

var tooltip = d3.select("#tooltip")
  .append("div")
  .style("opacity", 1)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  //.style("position", "relative")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip")
  //.style("float: right");
var mode = "editMode";



function editMode() {
    console.log("editing...");
    mode = "editMode";
    const editButton = document.querySelector('#edit');
    editButton.disabled = true;
    const viewButton = document.querySelector('#view');
    viewButton.disabled = false;
    const clearButton = document.querySelector('#clear');
    if (isBlankCanvas()) {
        clearButton.disabled = true;
    } else {
        clearButton.disabled = false;
    }
    drawPlot();
    document.getElementById("failureNumber").innerHTML = ("Failures: " + global_edit_failures);
    document.getElementById("roundNumber").innerHTML = ("Rounds: " + global_edit_rounds);
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
    document.getElementById("failureNumber").innerHTML = ("Failures: " + global_view_failures);
    document.getElementById("roundNumber").innerHTML = ("Rounds: " + global_view_rounds);
}

//clear
function clearing() {
    console.log("clearing...");
    svg.selectAll('circle').remove();
}

function handleClear() {
    const confirmation = confirm("Are you sure you want to reset?");
    if (confirmation) {
        clearing();
        //add clearing the whole array here
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
            console.log(delay, maxDelay);
            return color(delay);
        }
        if (document.getElementById('round').checked) {
            const color = d3.scaleLinear()
            .domain([0, maxRounds/2, maxRounds])
            .range(["red", "yellow", "green"]);
            console.log(round, maxRounds);
            return color(round);
        }
    }
}

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
        var display = 0
        for (var i = 0; i < view_json.length; i++) {
            display = 0
            var xx = 0
            var yy = 0
            var round = 0
            var delay = 0
            var failed = "True"
            if ((view_json[i][1] == xCoor) & (view_json[i][2] == yCoor)) {
                display = view_json[i]
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
            "The round of this node is: "+ round + "<br>"
            + "The x,y coordinates are: " + xx +", "+ yy + "<br>"
            + "Elapsed time: " + delay + " ms" +  "<br>"
            + "Failed: " + failed +  "<br>"
            )
      })
    .on("mouseout", function(d) {
        return tooltip.style("visibility", "hidden");
      });
}

function addDot(xCoor, yCoor, color = "grey") {
    d3.select("#dots")
    .insert("circle", ":first-child")
    .attr("cx", xCoor)
    .attr("cy", yCoor)
    .attr("r", 10)
    .style('fill', color);
    //.style('fill', colorMode(100*xCoor/(width))); //manually get text coordinate
    
    button = document.getElementById('clear');
    button.disabled = false;

    //adding to the global array
    xx = parseFloat(xCoor)
    yy = parseFloat(yCoor)
    //console.log(xx,yy)
    temp = []
    temp.push(xx,yy)
    //console.log(temp)
    all_coordinates.push(temp)
}

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

function addDotClick() {
    //console.log("listening for clicks...")
    d3.select('svg').on("click", function(event) {
        if (mode == "editMode") {
            var coors = [d3.pointer(event)[0], d3.pointer(event)[1]];
            //console.log("coors", coors);
            if (coors[0]-62 >= 0 && coors[0]-62 <= 910 && coors[1]-13.21875 >= 0 && coors[1]-13.21875 <= 560) {
                //console.log("adding dot clicking...")
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

function run() {
    //console.log('running...');
    global_view_failures = global_edit_failures;
    global_view_rounds = global_edit_rounds;
    create_JSON()
    view_json = []
    setTimeout(function(){
        if (mode != "viewMode") {
        viewMode()
    } else{
        drawPlot();     
    }
}, 7000)
}

function drawPlot() {
    console.log("when I click run .. drawplot")
    console.log(view_json.length)
    const storeNodes = all_coordinates;
    clearing();
    if (mode == "viewMode") {
        var delays = [];
        var rounds = [];
        for (var i = 0; i < view_json.length; i++) {
            delays.push(Number(view_json[i][5]));
            rounds.push(Number(view_json[i][3]));
        }
        const maxDelay = Math.max(...delays);
        const maxRounds = Math.max(...rounds);
        for (var i = 0; i < view_json.length; i++) {
            const delay = view_json[i][5];
            const round = view_json[i][3];
            const failed = view_json[i][4];
            addDotRaw((view_json[i][1]), (view_json[i][2]), determineColor(delay, round, maxDelay, maxRounds, failed));
        }
    }
    if (mode == "editMode") {
        console.log("storeNodes: ", storeNodes);
        for (const node of storeNodes) {
            addDotRaw(node[0], node[1]);
            console.log("coors: ", node[0], node[1]);
            console.log("mapped coors: ", x(node[0]), y(node[1]));
        }
    }
}

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

function isBlankCanvas() {
    return (all_coordinates.length == 0 && global_edit_failures == 0 && global_edit_rounds == 0)
}

addDotClick();

var btn_run = document.getElementById("run")
//btn_run.addEventListener('click', create_JSON())
var btn_rounds = document.getElementById("rounds")
function create_JSON() {
    console.log("inhere")
    //dont think i need this local rounds
    var failures1 = document.getElementById('failure');
    var rounds = document.getElementById('rounds');
    //console.log(failures.value) // amount of failures to be tolerated   
    //console.log(all_coordinates)
    //console.log(failures1.value)
    const to_send = {
        "F": parseInt(global_edit_failures),
        "R": parseInt(global_edit_rounds),
        "Values": all_coordinates
    }
    //console.log(to_send)
    //console.log(to_send)
    const data = JSON.stringify(to_send)
    //console.log(data)
    var http = new XMLHttpRequest();
    var url = 'https://jirqk5c6ik.execute-api.us-east-1.amazonaws.com/cors/helloWorld';
    //var url1 = 'https://txen52lqrkap5b7new5teqe7rm0hdsqe.lambda-url.us-east-1.on.aws/';
    http.open('POST', url, true);
    //http.open('POST', url1, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-Type', 'application/json');

    http.send(data);
    http.onload = function() {
        if (http.status != 200) { // analyze HTTP status of the response
          alert(`Error ${http.status}: ${http.statusText}`); // e.g. 404: Not Found
        } else { // show the result
            //console.log("in http")
            //console.log(http.response)
            data_return = http.response
            console.log(typeof(data_return))
            // console.log((data_return.length))
            splitted = data_return.slice(11,data_return.length - 2)
            //var splitted1 = splitted.split('],[')
            //var splitted1 = splitted.split("[" + splitted + "]");
            var splitted1 = JSON.parse("[" + splitted + "]");
            // console.log(splitted)
            // console.log((splitted1))
            parse_data(splitted1);
        }
      };
    // fetch(url)
    // .then(
    //     response => response.text() // .json(), .blob(), etc.
    // )
    //  .then(
    //     console.log("in data"),
    //     data => (console.log(data))
    // )
    // console.log("heyyy")
    //console.log(all_coordinates)
    

}

// when view is clicked, this create_json file is ran
//btn_run.addEventListener('click', create_JSON)

function parse_data (x) {
    for(var key in x) {
        //console.log(x[key])
        view_json.push(x[key])
     }
    // console.log("in parse")
    console.log((view_json))
}
//dont know if i need this below
// const sendHTTPRequest = (method, url, data) => {
//     const promise = new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open(method, url);
//         xhr.responseType = 'json';

//         if(data) {
//             xhr.setRequestHeader('Content-Type', 'application/json')
//         }

//         xhr.onload = () => {
//             if(xhr.status >= 400) {
//                 reject(xhr.response)
//             } else {
//                 resolve(xhr.response)
//             }
//         }
//         xhr.onerror = () => {
//             reject('Something went wrong')
//         }
//         xhr.send(JSON.stringify(data))

//     })
//     return promise;
//}
