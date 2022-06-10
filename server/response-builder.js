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
	buildTypeInitial(id, creationTime){
		const response = this.response
		response.type = this.RES_TYPE_INITIAL
		response.id = id
		response.creationTime = creationTime
	}
}



module.exports = {
	ResponseBuilder:ResponseBuilder
}