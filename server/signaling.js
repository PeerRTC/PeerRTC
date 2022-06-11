const utils = require("./utils")
const {ResponseBuilder} = require("./response-builder")

const clients = new Map()

var config = null

//set the configurations for signaling
function setConfig(c) {
	config = c
}

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

	const res = new ResponseBuilder()
	res.buildTypeInitial(id, metadata.lastUpdateTime)
	client.send(res.getResponse())

	clientLifeChecker(client)
}

function clientLifeChecker(client){
	var alive = true
	const interval = setInterval(()=>{
		if (!alive) {
			client.close()
			clearInterval(interval)
		}
		try{
			client.ping()
		}catch(e){

		}
		alive = false
	}, config.clientMaxUnreachableTime)

	client.on("pong", ()=>{
		alive = true
	})
}

function handleMessage(requesterId, data){
	try{
		const jsonData = JSON.parse(data)
		const res = new ResponseBuilder()
		var toId = null

		if (jsonData.type == "connectpeer") {
			const peerId = jsonData.peerId

			// Request connection only if target exists
			if (clients.has(peerId)) {
				toId = peerId
				res.buildTypeIncomingPeer(requesterId, jsonData.iceCandidates, jsonData.sdp)
			}
			
		} else if (jsonData.type == "answerpeer") {
			const peerId = jsonData.peerId

			// Send answer only if target exists
			if (clients.has(peerId)) {
				toId = peerId
				res.buildTypeAnswerPeer(requesterId, jsonData.iceCandidates, jsonData.sdp)
			}
		} else if (jsonData.type == "peerids") {
			toId = jsonData.id
			const ids = []
			if (config.isClientIdsPublic) {
				for(id of clients.keys()){
					ids.push(id)
				}
			}
			
			res.buildTypePeerIds(ids)

		} else if (jsonData.type == "addPayload") {
			const payload = JSON.parse(jsonData.payload)
			clients.get(requesterId).payload = payload
		}

		if (toId!= null) {
			clients.get(toId).client.send(res.getResponse())
		}


	}catch(e){
		console.log(e)
	}
	
}




module.exports = {
	addNewClient:addNewClient,
	setConfig:setConfig
	
}

