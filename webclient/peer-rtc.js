class PeerRTC {
	
	constructor(myId, serverURL) {
		this.serverURL = serverURL

		var queryParams = `key=${this.uuidv4()}`
		if (myId != null && myId != undefined && myId.trim() != "") {
			queryParams+=`&id=${myId}`
		}
		this.id = this.getApiJSON(`${serverURL}/registerClient?${queryParams}`).id
		console.log(this.id)
	}

	

	 getApiJSON(theUrl){
	    var xmlHttp = new XMLHttpRequest()
	    xmlHttp.open("GET", theUrl, false)
	    xmlHttp.send(null)
	    return JSON.parse(xmlHttp.responseText)
	}



	uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
}

