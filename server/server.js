const HOST = "127.0.0.1"
const PORT = 1000

const ws = require("ws")
const signaling = require("./signaling.js")

const wsserver = new ws.Server({host:HOST, port:PORT})
const httpserver = require("express")()


wsserver.on("connection", client=>{
	signaling.addNewClient(client)
})

