
class PeerRTC {
	
	constructor(myId, serverURL) {
		// The purpose is just to know the global variables
		this.conn = null
		this.datachannel = null
		this.isConnectedToPeer = null
		this.onDataReceived = null
		
		this.serverURL = serverURL

		console.log(myId)
		this.initConnection()
		this.connectToPeer()
	}

	initConnection(){
		const conn =  new RTCPeerConnection()
		this.conn = conn
		this.datachannel = null
		this.isConnectedToPeer = false	
	}


	initDataChannel(datachannel){
		this.datachannel = datachannel
		datachannel.onmessage = event => {
			if (this.onDataReceived != null) {
				this.onDataReceived(e.data)
			}
		} 


		datachannel.onopen = event => {
			this.isConnectedToPeer = true
		}
		datachannel.onclose = event => {
			this.isConnectedToPeer = false
		}
	}



	generateOfferAnswer(isInitiator){
		const conn = this.conn
		conn.onicecandidate = event =>  {
			// send to the other peer
			const sdp = JSON.stringify(conn.localDescription)
			console.log("SDP: ", sdp)
		}


		var promise
		if (isInitiator) {
			promise = conn.createOffer()
		} else{
			promise = conn.createAnswer()
		}

		promise.then(o => conn.setLocalDescription(o) )
	}




	

	sendData(data){
		var sent = false
		try{
			this.datachannel.send(data)
			sent = true
		} catch(e){

		}

		return send
	}


	

	connectToPeer(peerId){
		const channel = this.conn.createDataChannel("");
		this.initDataChannel(channel)
		this.generateOfferAnswer(true)

	}


	acceptConnectFromPeer(peerId){
		conn.ondatachannel = event => {

			const datachannel = this.datachannel
			if(datachannel != null){
				this.datachannel.close()
			}
			this.initDataChannel(event.channel)
		}

		this.generateOfferAnswer(false)
	}




	
}

const peer = new PeerRTC(null, "test.com")
peer.onDataReceived = data => {
	console.log(data)
}