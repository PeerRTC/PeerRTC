const HOST = "127.0.0.1"
const PORT = 1000

const ws = require("ws")
const signaling = require("./signaling.js")


const wsserver = new ws.Server({host:HOST, port:PORT})

// If true, all client ids are retrievable in the client side
signaling.setConfig({
	isClientIdsPublic: true,
	clientMaxUnreachableTime: 5000	//milliseconds
})


wsserver.on("connection", client=>{
	signaling.addNewClient(client)
})

