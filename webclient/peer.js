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
		this.currentPeerId = null
	}

	sendData(data){
		this.browserRTC.send(data)
	}


	closeP2P(){
		const browserRTC  = this.browserRTC
		browserRTC.close()
		this.browserRTC = null
		this.currentPeerId = null
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
			console.log(message)
		}

		const onicecandididate = (iceCandidates, sdp) => {
			sdpCallBack(iceCandidates, sdp)
		}

		const onclose = ()=>{
			this.closeP2P()
		}

		

		browserRTC.setCallbacks(onConnectionEstablished, onclose, onicecandididate, onmessage)
		
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


// Wrapper class on top of buit in WebRTC api in modern browsers
class BrowserRTC{
	constructor(){
		const conn = new RTCPeerConnection()
		this.conn = conn
		this.onmessage =  null
		this.datachannel = null
		this.onclose = null
		this.closed = false
	}

	setCallbacks(onConnectionEstablished, onClose, onicecandidate , onmessage){
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
		this.onclose = onClose

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

