# VisualizedConsensus

<h2>Setup</h2>
Can be found at this link: https://asikarov.github.io/VisualizedConsensus/ 

Or alternatively: 

Set up a local development server such as https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer 

Run index.html

<h2>Usage</h2>
There are two modes, edit mode and view mode. The edit mode allows you to set up the parameters of your consensus, while the view mode shows the output of the most recently run consensus algorithm. 
<h3>Edit Mode</h3>

Add a node by typing its coordinates

Remove a node by typing its coordinates

Add a node by clicking on the graph

Set the maximum number of rounds by typing it in and clicking submit

Set the maximum number of failures by typing it in and clicking submit

Clear the nodes, number of rounds, and number of failures

Run the consensus algorithm

Switch to view mode (if you have already run a consensus)

<h3>View Mode</h3>

Select whether the color represents rounds or real time

See only nodes from a specific round by typing the round in and clicking select

Switch back to edit mode

<h2>Documentation</h2>

Our front end consist of a simple html webpage with a styling sheet and javascript to perform functions

For the html page we have forms and buttons so that they can trigger their corresponding javascript functiions to store user input

For user input we have the option of rounds, maximum failures, round selection, and adding and removing nodes based on coordinates. However users can also add nodes by just clicking on the graph
Clicking on the buttons or the graph will call their corresponding code in the javascript to perform said functions, whether to add, remove, or update certain values

The run button triggers the run function which triggers the algorithm to send all the user input to the backend algorithm written in go

Run calls the function create_json which takes the user inputs and makes them into a json to be passed to the http url where the AWS lambda is
Then the function will parse the response from the lambda and add all the relevant information into an array called view_json which will be used to create the dots on the graph

Within run, there is a 5 second timeout in order for us to make sure that the front end has recieved the data and view_json is populated before calling the functions to graph the points


Note: rounds signifies how many rounds the algorithm will be ran for, initial nodes start at round 1 so to see the last round of the algorithm you must select round+1 in the selection box
