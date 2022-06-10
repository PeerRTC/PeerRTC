const client = require("./client-connection.js")
const express = require("express")
const server = express()

// for enabling CORS
const cors = require("cors")



server.get("/registerClient", cors(), (req, res)=>{
	client.registerClient(req, res)
})

server.get("/hook", cors(), async(req, res)=>{
	await new Promise(r => setTimeout(r, 2000))
	res.send({"data":"hello"})
})

server.get("/initiateConnect", cors(), (req, res)=>{
	res.send("")
})

server.listen(3000, "127.0.0.1", ()=>{
	console.log("listen")
})
