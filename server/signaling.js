module.exports = {
	addNewClient:addNewClient
}

const utils = require("./utils")

const clients = new Map()

function addNewClient(client){
	client.on("message", data=>{

	})

	client.on("close", () => {
		clients.delete(client)
	})

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
	
}