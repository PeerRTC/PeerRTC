class PeerRTC {
	
	constructor(myId, serverURL) {
		this.serverURL = serverURL
		this.key = this.randomKey(100, 200)
		
		var queryParams = `key=${key}`
		if (myId != null && myId != undefined && myId.trim() != "") {
			queryParams+=`&id=${myId}`
		}
		this.id = this.getApiJSON(`${serverURL}/registerClient?${queryParams}`).id
		console.log(this.id)
	}

	

	 getApiJSON(url){
	    var xmlHttp = new XMLHttpRequest()
	    xmlHttp.open("GET", url, false)
	    xmlHttp.send(null)
	    return JSON.parse(xmlHttp.responseText)
	}



	randomKey(minLen, maxLen) {
	  const data = "abcdefghijklmnopqrstuvwxyz-_01234567890" 
	  var key = ""
	  for(var i=0; i< Math.round(Math.random() * maxLen) + minLen ; i++){
	  	var d = data[Math.round(Math.random() * data.length)]
	  	if (Math.random() <= 0.5) {
	  		d = d.toUpperCase()
	  	}
	  	key+=d
	  }

	  return key
	}
	
}

