var peer = null
var isSearching = false
var metadaSet = false
var stopFuncCalled = true

// prevent waiting for other peer for so long to accept request
const MIN_PEER_CONNECT_WAITING_TIME = 1000
const MAX_PEER_CONNECT_WAITING_TIME = 5000


// Since we are using default servers, this serves as an identity for clients created from this specific project.
const identity = "random_chat123124"



const onConnected =p=>{
	const incomingVideoHTML = document.getElementById("incoming-video")
	const messageBoxHTML = document.getElementById("message-box-display")
  
  p.onnewtrack = (newTrack, trackStreams)=>{
  	incomingVideoHTML.srcObject = trackStreams[0]
  }

  p.oncloseP2P = ()=>{
  	incomingVideoHTML.srcObject = null
  	messageBoxHTML.innerText = null
  	p.deleteAllBlobFiles()
  	document.getElementById("skip-bttn").style.display = "none"
  	document.getElementById("connected-to-peer-indicator").style.visibility = "hidden"
  	if (isAvailable() || !stopFuncCalled) {
  		startSearching()
  	}

  }

  p.onClose = ()=>{
  	incomingVideoHTML.srcObject = null
  	messageBoxHTML.innerHTML = null
  	metadaSet = false
  	isSearching = false
  	document.getElementById("connected-to-peer-indicator").style.visibility = "hidden"
  }

 

  p.onpeerconnectsuccess  = ()=>{
  	isSearching = false
  	messageBoxHTML.innerHTML = null
  	appendMessage(null, null, true)
  	document.getElementById("message-displays-container").style.visibility = "visible"
  	document.getElementById("skip-bttn").style.display = "block"
  	document.getElementById("connected-to-peer-indicator").style.visibility = "visible"
  	console.log("Connected to peer")
  }


  p.onpeerconnectrequest = (peerId, accept, decline)=>{
  	console.log("Connection request")
  	if (isAvailable()) {
  		accept()
			isSearching = false
			setTimeout(()=>{
				if (!stopFuncCalled && !isSearching && !peer.currentPeerId){
					startSearching()
				}
			}, random(MIN_PEER_CONNECT_WAITING_TIME, MAX_PEER_CONNECT_WAITING_TIME))
  	} else{
  		console.log("Declined")
  		decline()
  	}
  }

  p.onpeerconnectdecline = peerId=>{
  	if (isAvailable()) {
  		startSearching()
  		console.log("Connection request decline by " + peerId)
  	}
  }


  p.ontextmessage = message=>{
  	appendMessage(false, message)
  }

  p.onfilemessage = (fname, fileTotalSize, fileBytesArray, done)=>{
		try{
			p.updateBlob(fname, fileBytesArray)
		}catch(e){
			// memory error
		}

		if (done) {
  		const blob = p.getBlob(fname)
  		p.deleteBlob(fname)
  		displayImageMessage(false, blob)
  		
  	}

  	
  }

   p.onnewpayload  = payload=>{
   	const jsonPayload = JSON.parse(payload)
   	if (jsonPayload.identity == identity) {
   		metadaSet = true
   	}
  }



 
  p.addPayload({identity:identity})
 	
  console.log(p.id)
}

export const startPeer =  (stream)=>{
	document.getElementById("my-video").srcObject = stream

	/* eslint-disable */
	peer = new PeerRTC()
	/* eslint-enable */
	peer.setMediaStream(stream)
	peer.ping(10000)
	peer.start(true, onConnected)
}


export const sendMessage = message=>{
	peer.sendText(message)
	appendMessage(true, message)	
}


export const sendFile = file=>{
	const splitted = file.name.split(".")
	var fname = `${Date.now()}`
	const ext = splitted[1]

	if (ext) {
		fname+=`.${ext}`
	}
	
	peer.sendFile(fname, file)
}


export const displayImageMessage= (isSender, blob)=>{
	const url = window.URL || window.webkitURL
	const imgMessage = document.createElement("img")
	imgMessage.src = url.createObjectURL(blob)

	var className = "incoming-message-img-display"
	if (isSender) {
		className = "my-message-img-display"
	}

	imgMessage.className = `${className} message-img-display`
	document.getElementById("message-box-display").appendChild(imgMessage)

	const messageBoxHTML = document.getElementById("messageBoxHTML")
	const scrollOffset = 10
	if (isSender || messageBoxHTML.scrollHeight - messageBoxHTML.offsetHeight - scrollOffset >= messageBoxHTML.scrollTop) {
		scrollMessageToEnd()
	} 
}



export const startSearching = ()=>{
	isSearching = true
	stopFuncCalled = false
	console.log("Searching")
	peer.onpeerpayloads = payloads =>{
  	if (!isAvailable()) return

  	console.log(payloads)

  	const validPeers = []
  	const myId = peer.id
  	for(const data of payloads){
  		const jsonData = JSON.parse(data)
  		const payload = jsonData.payload
  		if (payload && payload.identity == identity && jsonData.id != myId) {
  			validPeers.push(jsonData)
  		}
  	}

  	if (validPeers.length > 0 && isAvailable()) {
  		const peerId = validPeers[random(0, validPeers.length)].id
  		peer.connect(peerId)
  		setTimeout(()=>{
  			if (isAvailable()) {
  				startSearching()
  			}
  		}, random(MIN_PEER_CONNECT_WAITING_TIME, MAX_PEER_CONNECT_WAITING_TIME))
  		console.log("Connecting to peer: " + peerId)
  	} else if (isSearching) {
  		console.log("Is searchng")
  		startSearching()
  	}
  	
  }

  // get all available peers to connect 
  peer.getAllPeerPayloads()
}

export const stop = ()=>{
	isSearching = false
	stopFuncCalled = true
	peer.closeP2P()
}


export const skip =()=>{
	isSearching = true
	peer.closeP2P()
}

function appendMessage(isSender, message){
	if (message && message.trim() != "") {
		const messageBoxHTML = document.getElementById("message-box-display")
		var className = "my-message-text-display"
		if (!isSender) {
			className = "incoming-message-text-display"
		}

		const messageDiv = document.createElement("text")
		messageDiv.innerText = `${message}\n`
		messageDiv.className = `${className} message-text-display`
		messageBoxHTML.appendChild(messageDiv)

		const scrollOffset = 10
		if (isSender || messageBoxHTML.scrollHeight - messageBoxHTML.offsetHeight - scrollOffset >= messageBoxHTML.scrollTop) {
			scrollMessageToEnd()
		} 
	}
	
	
}


function scrollMessageToEnd() {
	setTimeout(()=>{
		const messageBoxHTML = document.getElementById("message-box-display")
		messageBoxHTML.scrollTo(0, messageBoxHTML.scrollHeight)
	}, 100)
}


function isAvailable() {
	return isSearching && peer && !peer.currentPeerId && metadaSet
}

function random(from, to){
	return Math.floor(Math.random() * to) + from
}

