const ws = require("ws")
const signaling = require("./signaling.js")

const server = new ws.Server({port:1000})

server.on("connection", client=>{
	signaling.addNewClient(client)
})