const utils = require("./utils")

class ResponseBuilder{
	static RES_TYPE_INITIAL = "initial"
	static RES_TYPE_INCOMING_PEER = "incomingpeer"
	static RES_TYPE_ANSWER_PEER = "answerpeer"
	static RES_TYPE_CLIENT_IDS = "clientids"

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
	buildTypeIncomingPeer(fromId, sdpData){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_INCOMING_PEER
		response.fromId = fromId
		response.sdp = sdpData
	}


	// for building the response for type sdp
	buildTypeAnswerPeer(fromId, sdpData){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_ANSWER_PEER
		response.fromId = fromId
		response.sdp = sdpData
	}


	buildTypeClientIds(fromId, clientIds){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_CLIENT_IDS
		response.ids = clientIds
	}
}



module.exports = {
	ResponseBuilder:ResponseBuilder
}