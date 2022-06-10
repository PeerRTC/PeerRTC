const ws = require("ws")
const utils = require("./utils")

const server = new ws.Server({port:1000})
const clients = new Map()

server.on("connection", client=>{
	var id = null

	// prevent id duplicates
	while(id == null || clients.has(id)){
		id = utils.uuidv4()
	}

	const metadata = {
		id: id,
		lastTime: utils.getNowMillis()
	}

	clients.set(client, ws)

	client.on("message", data=>{

	})

	client.on("close", () => {
		clients.delete(client)
	})
})