module.exports = {
	registerClient : registerClient,
}

const utils = require("./utils.js")
const SHA256  = require("crypto-js/sha256")


const ERROR_REPONSE = {"error": ""}
const clients = {}


function registerClient(req, res){
	var response
	var id
	var hash

	try{
		var query = req.query
		var key = query.key
		if (key == undefined) {
			throw  Error("No key parameter provided")
		}


		
		id = query.id
		if (clients[id] != undefined) {
			throw  Error("Provided peer id is already in use")
		}


		hash = SHA256(key).toString()
		

		// ensure that ids are unique for each client
		while(id== undefined || id == null || clients[id] != undefined){
			id = utils.uuidv4()
		}
	
		response = {
			"id":`${id}`
		}

	} catch(e){
		id = null
		hash = null
		response = ERROR_REPONSE
		response.error = e.message
	}


	if (id != null && hash!= null) {
		clients[id] = {}
		clients[id].hash = hash
		clients[id].lastActive = utils.getNowMillis()

		console.log(clients)
	}

	res.send(response)

}

