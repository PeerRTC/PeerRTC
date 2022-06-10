class PeerRTC {
	
	constructor(myId, serverURL) {
		this.serverURL = serverURL
		
		const socket = new WebSocket(serverURL)
		this.socket = socket
	}

	
	
	
}

