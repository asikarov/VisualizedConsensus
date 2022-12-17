# VisualizedConsensus

Our front end consist of a simple html webpage with a styling sheet and javascript to perform functions

For the html page we have forms and buttons so that they can trigger their corresponding javascript functiions to store user input

The run button triggers the run function which triggers the algorithm to send all the user input to the backend algorithm written in go

Run calls the function create_json which takes the user inputs and makes them into a json to be passed to the http url where the AWS lambda is
Then the function will parse the response from the lambda and add all the relevant information into an array called view_json which will be used to create the dots on the graph



Note: rounds signifies how many rounds the algorithm will be ran for, initial nodes start at round 1 so to see the last round of the algorithm you must select round+1 in the selection box
