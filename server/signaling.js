const utils = require("./utils")
const resBuilder = require("./response-builder")

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
		lastUpdateTime: utils.getNowMillis()
	}

	clients.set(client, metadata)

	const res = new resBuilder.ResponseBuilder()
	res.buildTypeInitial(metadata.id, metadata.lastUpdateTime)
	client.send(res.getResponse())
}


module.exports = {
	addNewClient:addNewClient
}

