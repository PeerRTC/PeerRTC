class PeerRTC {
	static REQ_TYPE_CONNECT_PEER = "connectpeer"
	static REQ_TYPE_ANSWER_PEER = "answerpeer"
	static REQ_TYPE_PEER_IDS = "peerids"

	constructor(myId, serverURL, onConnectToServer) {	
		this.serverURL = serverURL
		this.isConnectedToServer = false
		this.onPeerIds = null
		this.id = null
		this.socket = null
	}

	connect(peerId){
		this.socket.send(JSON.stringify({
			"type": PeerRTC.REQ_TYPE_CONNECT_PEER,
			"peerId": peerId,
			"sdp": "test sdp"
		}))
	}

	//retrieve all the peer ids from the server
	getAllPeerIds(callback){
		this.onPeerIds = callback
		this.socket.send(JSON.stringify({
			"type": PeerRTC.REQ_TYPE_PEER_IDS,
			"id": this.id
		}))
	}



	
	start(onConnect){
		// Convert the provided server url to a web socket url
		const webSocketURL = "ws://" + this.serverURL.replaceAll(/((http(s{0,1}))|(ws(s{0,1}))):\/\//g, "")
		new Promise(async(resolve)=>{
			const socket = new WebSocket(webSocketURL)
			this.socket = socket

			socket.onclose =()=>{
				console.log("closed")
			}

			socket.onmessage = data=>{
				this.handleServerData(data)
			}

			socket.onopen= ()=>{
				this.isConnectedToServer = true
				resolve()
				console.log("opened")
			}
		}).then(()=>onConnect(this))

	}

	handleServerData(data){
		const jsonData = JSON.parse(data.data)
		
		if (jsonData.type == "initial") {
			this.id = jsonData.id
			this.connectionCreationTime = jsonData.connectionCreationTime
		} else if(jsonData.type == "incomingpeer"){
			console.log(jsonData.fromId)
			this.socket.send(JSON.stringify({
				"type": PeerRTC.REQ_TYPE_ANSWER_PEER,
				"peerId": jsonData.fromId,
				"sdp": "answer sdp"
			}))
		}

		 else if(jsonData.type == "answerpeer"){
			console.log(jsonData.fromId)
			console.log("answering")
		} else if (jsonData.type == "peerids") {
			const peerIdsCallback = this.onPeerIds
			if (peerIdsCallback != null) {
				peerIdsCallback(jsonData.ids)
			}
		}
	}

	
	
	
}

