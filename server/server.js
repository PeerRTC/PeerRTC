var functions = require("./functions.js")

var express = require("express")
var server = express()

// for enabling CORS
var cors = require("cors")


const clients = []

server.get("/clientConnect", cors(), (req, res)=>{
	const id = functions.clientConnect(req, res, clients)
	clients.push(id)
})



server.get("/initiateConnect", cors(), (req, res)=>{
	res.send("")
})

server.listen(3000, "127.0.0.1", ()=>{
	console.log("listen")
})


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
  });
}