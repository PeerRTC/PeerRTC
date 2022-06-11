const utils = require("./utils")

class ResponseBuilder{
	static RES_TYPE_INITIAL = "initial"
	static RES_TYPE_INCOMING_PEER = "incomingpeer"
	static RES_TYPE_ANSWER_PEER = "answerpeer"
	static RES_TYPE_PEER_IDS = "peerids"
	static RES_TYPE_NEW_PAYLOAD = "newpayload"

	constructor(){
		this.response = {}
	}


	getResponse(){
		this.response.responseTime = utils.getNowMillis()
		return JSON.stringify(this.response)
	}


	// for building the response for type initial
	buildTypeInitial(id, connectionCreationTime){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_INITIAL
		response.id = id
		response.connectionCreationTime = connectionCreationTime
	}


	// for building the response for type sdp
	buildTypeIncomingPeer(fromId, iceCandidates, sdpData){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_INCOMING_PEER
		response.fromId = fromId
		response.iceCandidates = iceCandidates
		response.sdp = sdpData
	}


	// for building the response for type sdp
	buildTypeAnswerPeer(fromId, iceCandidates, sdpData){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_ANSWER_PEER
		response.fromId = fromId
		response.iceCandidates = iceCandidates
		response.sdp = sdpData
	}


	buildTypePeerIds(peerIds){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_PEER_IDS
		response.ids = peerIds
	}


	buildTypeNewPayload(payload){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_NEW_PAYLOAD
		response.payload = payload
	}
}



module.exports = {
	ResponseBuilder:ResponseBuilder
}