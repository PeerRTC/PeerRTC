class PeerRTC {
	
	constructor(myId, serverURL) {	
		this.serverURL = serverURL
		this.isConnectedToServer = false
		this.socket = this.initWebSocket()
	}


	initWebSocket(){
		// Convert the provided server url to web socket url

		const webSocketURL = "ws://" + this.serverURL.replaceAll(/((http(s{0,1}))|(ws(s{0,1}))):\/\//g, "")
		
		const socket = new WebSocket(webSocketURL)

		socket.onopen= ()=>{
			this.isConnectedToServer = true
			console.log("opened")
		}

		socket.onmessage = data=>{
			console.log(data)
		}

		return socket
	}

	
	
	
}

