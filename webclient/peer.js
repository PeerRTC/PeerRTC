class PeerRTC {
	static REQ_TYPE_CONNECT_PEER = "connectpeer"
	static REQ_TYPE_ANSWER_PEER = "answerpeer"
	static REQ_TYPE_PEER_IDS = "peerids"

	constructor(serverURL, onConnectToServer) {	
		this.serverURL = serverURL
		this.isConnectedToServer = false
		this.onPeerIds = null
		this.id = null
		this.socket = null
		this.browserRTC = null
		this.currentPeerId = null

		this.onmessage = null
		this.oncloseP2P = null
		this.onclose = null
	}

	sendData(data){
		this.browserRTC.send(data)
	}


	closeP2P(){
		const browserRTC  = this.browserRTC
		if (browserRTC != null) {
			browserRTC.close()
		}
		
		this.browserRTC = null
		this.currentPeerId = null
	}

	close(){
		this.closeP2P()
		const socket = this.socket
		const onclose = this.onclose
		if (socket != null && onclose) {
			this.socket = null
			this.id = null

			socket.close()
			onclose()
		}
	}

	connect(peerId){
		this.initBrowerRTC(peerId, true, null, (iceCandidates, sdp)=>{
			this.socket.send(JSON.stringify({
				"type": PeerRTC.REQ_TYPE_CONNECT_PEER,
				"peerId": peerId,
				"iceCandidates": iceCandidates,
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

			socket.onopen= ()=>{
				this.isConnectedToServer = true
				socket.onclose =()=>{
					this.close()
				}

				socket.onmessage = data=>{
					this.handleServerData(data)
				}
				resolve()
			}

		}).then(()=>onConnect(this))

	}


	initBrowerRTC(targetPeerId, isOffer, answerSdp, sdpCallBack){
		var browserRTC  = this.browserRTC

		if (browserRTC == null) {
			browserRTC = new BrowserRTC()
		} else if (targetPeerId != this.currentPeerId) {
			// ensures that only the current peer id is able to update the current connection
			return
		}

		this.browserRTC = browserRTC

		const onConnectionEstablished = ()=>{
			console.log("Connection established")
		}

		const onmessage = message => {
			const onmessage = this.onmessage
			if (onmessage != null) {
				onmessage(message)
			}
		}

		const onicecandididate = (iceCandidates, sdp) => {
			sdpCallBack(iceCandidates, sdp)
		}

		const oncloseP2P = ()=>{
			this.closeP2P()
			const oncloseP2P = this.oncloseP2P
			if (oncloseP2P != null) {
				var currentPeerId = this.currentPeerId
				if (currentPeerId == null) {
					currentPeerId = ""
				}
				oncloseP2P(currentPeerId)
			}
		}

		

		browserRTC.setCallbacks(onConnectionEstablished, oncloseP2P, onicecandididate, onmessage)
		
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
			this.initBrowerRTC(jsonData.fromId, false, jsonData.sdp, (iceCandidates, sdp)=>{
				this.browserRTC.addIceCandidates(jsonData.iceCandidates)
				this.socket.send(JSON.stringify({
					"type": PeerRTC.REQ_TYPE_ANSWER_PEER,
					"peerId": jsonData.fromId,
					"iceCandidates": iceCandidates,
					"sdp": sdp
				}))
			})
			
			
		}

		 else if(jsonData.type == "answerpeer"){
		 	const browserRTC = this.browserRTC
		 	browserRTC.setRemoteDescription(jsonData.sdp).then(o=>{
		 		browserRTC.addIceCandidates(jsonData.iceCandidates)
		 	}).catch(e=>{})

		} else if (jsonData.type == "peerids") {
			const peerIdsCallback = this.onPeerIds
			if (peerIdsCallback != null) {
				peerIdsCallback(jsonData.ids)
			}
		}
	}

}


// Wrapper class on top of the built in WebRTC api in modern browsers
class BrowserRTC{
	constructor(){
		const conn = new RTCPeerConnection()
		this.conn = conn
		this.onmessage =  null
		this.datachannel = null
		this.onclose = null
		this.closed = false
	}

	setCallbacks(onConnectionEstablished, onclose, onicecandidate , onmessage){
		const conn = this.conn
		const iceCandidates = []
		conn.onicecandidate  = event =>{
			const iceCandidate = event.candidate
			if (iceCandidate == null) {
				onicecandidate (iceCandidates, conn.localDescription)
			} else{
				iceCandidates.push(iceCandidate)
			}
			
		}
		this.onclose = onclose

		this.onmessage = message => {
			onmessage(message.data)
		}
		this.onConnectionEstablished = onConnectionEstablished
	}




	createOffer(){
		const conn = this.conn
		const datachannel = conn.createDataChannel("Data Channel")
		this.initDataChannel(datachannel)
		conn.createOffer().then(o => conn.setLocalDescription(o)).catch(e=>{})

	}


	createAnswer(sdp){
		const conn = this.conn
		conn.ondatachannel = event=> {
			this.initDataChannel(event.channel)
		}
		conn.setRemoteDescription(sdp)
		conn.createAnswer().then(o => conn.setLocalDescription(o)).catch(e=>{})
	}


	setRemoteDescription(sdp){
		return this.conn.setRemoteDescription(sdp)
	}

	send(data){
		this.datachannel.send(data)
	}
	

	addIceCandidates(candidates){
		for(var candidate of candidates){
			this.conn.addIceCandidate(candidate)
		}
	}


	initDataChannel(channel){
		channel.onmessage = this.onmessage
		channel.onopen = this.onConnectionEstablished
		channel.onclose= this.onclose
		this.datachannel = channel
	}



	close(){
		if (!this.closed) {
			this.closed  = true
			this.conn.close()
			const datachannel = this.datachannel
			if (datachannel!= null) {
				datachannel.close()
			}
		}
		
	}
}

