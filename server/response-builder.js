const utils = require("./utils")

class ResponseBuilder{
	static RES_TYPE_INITIAL = "initial"
	static RES_TYPE_SDP = "sdp"

	constructor(){
		this.response = {}
	}


	getResponse(){
		this.response.responseTime = utils.getNowMillis()
		return JSON.stringify(this.response)
	}


	// for building the data value in response for type initial
	buildTypeInitial(id, connectionCreationTime){
		const response = this.response
		response.type = ResponseBuilder.RES_TYPE_INITIAL
		response.id = id
		response.connectionCreationTime = connectionCreationTime
	}
}



module.exports = {
	ResponseBuilder:ResponseBuilder
}