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
	while(!id || clients.has(id)){
		id = utils.uuidv4()
	}

	client.on("message", data=>{
		handleMessage(id, data)
	})

	client.on("close", () => {
		clients.delete(id)
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
			toId = requesterId
			const payload = JSON.parse(jsonData.payload)
			clients.get(requesterId).payload = payload
			res.buildTypeNewPayload(jsonData.payload)
		} else if (jsonData.type == "getallpeerpayloads") {
			toId = requesterId
			const payloads = []
			if (config.isClientIdsPublic) {
				for(id of  clients.keys()){
					payloads.push(JSON.stringify({
						"id": id,
						"payload": clients.get(id).payload
					}))
				}

			}

			res.buildTypeAllPeerPayloads(payloads)

		} else if(jsonData.type == "getpeerpayload"){
			toId = requesterId
			var peerId = jsonData.peerId
			const peer = clients.get(peerId)
			var payload = undefined
			if (peer ) {
				payload = peer.payload
			} else{
				peerId = undefined
			}

			res.buildTypePeerPayload(peerId, payload)
		} else if(jsonData.type == "declinepeerconnect"){
			toId = jsonData.peerId
			res.buildTypePeerConnectDecline(requesterId)
		}


		if (toId) {
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

