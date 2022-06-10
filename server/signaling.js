const utils = require("./utils")
const resBuilder = require("./response-builder")

const clients = new Map()

var isClientIdPublic = false



function addNewClient(client){
	var id = null

	// prevent id duplicates
	while(id == null || clients.has(id)){
		id = utils.uuidv4()
	}

	client.on("message", data=>{
		handleMessage(id, data)
	})

	client.on("close", () => {
		clients.delete(client)
	})

	

	const metadata = {
		client: client,
		lastUpdateTime: utils.getNowMillis()
	}

	clients.set(id, metadata)

	const res = new resBuilder.ResponseBuilder()
	res.buildTypeInitial(id, metadata.lastUpdateTime)
	client.send(res.getResponse())
}



function handleMessage(requesterId, data){
	try{
		const jsonData = JSON.parse(data)
		const res = new resBuilder.ResponseBuilder()

		if (jsonData.type == "connectpeer") {
			const peerId = jsonData.peerId

			// Request connection only if not connecting to itself or peer target exists
			if (requesterId != peerId && clients.has(peerId)) {
				const peerClient = clients.get(peerId).client
				res.buildTypeIncomingPeer(requesterId, jsonData.sdp)
				peerClient.send(res.getResponse())
			}
			
		} else if (jsonData.type == "answerpeer") {
			const peerId = jsonData.peerId

			// Send answer only if not connecting to itself or target exists
			if (requesterId != peerId && clients.has(peerId)) {
				const peerClient = clients.get(peerId).client
				res.buildTypeAnswerPeer(requesterId, jsonData.sdp)
				peerClient.send(res.getResponse())
			}
		}
	}catch(e){
		console.log(e)
	}
	
}


function getAllClientIds(){
	const ids = []
	if (isClientIdPublic) {
		for (id of clients.keys()){
			ids.push(id)
		}
	} 

	return ids
}

module.exports = {
	addNewClient:addNewClient,
	setIsClientIdPublic:setIsClientIdPublic
}

