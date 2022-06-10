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
		this.browserRTC = null
	}

	sendData(data){
		this.browserRTC.send(data)
	}


	closeP2P(){
		this.browserRTC.close()
	}

	connect(peerId){
		this.initBrowerRTC(true, null, sdp=>{
			this.socket.send(JSON.stringify({
				"type": PeerRTC.REQ_TYPE_CONNECT_PEER,
				"peerId": peerId,
				"sdp": sdp
			}))
		})
		
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


	initBrowerRTC(isOffer, answerSdp, sdpCallBack){
		var browserRTC  = this.browserRTC

		if (browserRTC == null) {
			browserRTC = new BrowserRTC()
		}

		this.browserRTC = browserRTC

		const onConnectionEstablished = ()=>{
			console.log("Connection established")
		}

		const onmessage = message => {
			console.log(message)
		}

		const onicecandididate = sdp => {
			sdpCallBack(sdp)
			console.log(sdp)
		}

		

		browserRTC.setCallbacks(onConnectionEstablished, onicecandididate, onmessage)
		
		if(isOffer){
			browserRTC.createOffer()
		} else{
			browserRTC.createAnswer(answerSdp)
		}

	}

	handleServerData(data){
		const jsonData = JSON.parse(data.data)
		
		if (jsonData.type == "initial") {
			this.id = jsonData.id
			this.connectionCreationTime = jsonData.connectionCreationTime
		} else if(jsonData.type == "incomingpeer"){

			
			this.initBrowerRTC(false, jsonData.sdp, sdp=>{
				this.socket.send(JSON.stringify({
					"type": PeerRTC.REQ_TYPE_ANSWER_PEER,
					"peerId": jsonData.fromId,
					"sdp": sdp
				}))
			})
			
			
		}

		 else if(jsonData.type == "answerpeer"){
		 	this.browserRTC.setRemoteDescription(jsonData.sdp)
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


class BrowserRTC{
	constructor(){
		const conn = new RTCPeerConnection()
		this.conn = conn
		this.onmessage =  null
		this.datachannel = null
	}

	setCallbacks(onConnectionEstablished, onicecandidate , onmessage){
		const conn = this.conn
		conn.onicecandidate  = event =>{
			onicecandidate (conn.localDescription)
		}
		this.onmessage = message => {
			onmessage(message.data)
		}
		this.onConnectionEstablished = onConnectionEstablished
	}




	createOffer(){
		const conn = this.conn
		const datachannel = conn.createDataChannel("Data Channel")
		this.initDataChannel(datachannel)
		conn.createOffer().then(o => conn.setLocalDescription(o))

	}


	createAnswer(sdp){
		const conn = this.conn
		conn.ondatachannel = event=> {
			this.initDataChannel(event.channel)
			console.log(event.channel)
		}
		conn.setRemoteDescription(sdp)
		conn.createAnswer().then(o => conn.setLocalDescription(o))
	}


	setRemoteDescription(sdp){
		this.conn.setRemoteDescription(sdp)
	}

	send(data){
		this.datachannel.send(data)
	}
	

	initDataChannel(channel){
		channel.onmessage = this.onmessage
		channel.onopen = this.onConnectionEstablished
		this.datachannel = channel
	}



	close(){
		this.conn.close()
	}
}

