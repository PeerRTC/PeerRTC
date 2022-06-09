class PeerRTC {
	
	constructor(myId, serverURL) {
		this.serverURL = serverURL
		this.getApi(`${serverURL}/clientConnect`)
	}

	

	 getApi(theUrl, data=null){
	    var xmlHttp = new XMLHttpRequest()
	    xmlHttp.open("GET", theUrl, false)
	    xmlHttp.send(data)
	    return xmlHttp.responseText
	}


	
}

