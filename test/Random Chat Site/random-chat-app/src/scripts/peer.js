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
  	document.getElementById("skip-bttn").style.visibility = "hidden"

  	if (isAvailable() || !stopFuncCalled) {
  		startSearching()
  	}

  }

  p.onClose = ()=>{
  	incomingVideoHTML.srcObject = null
  	messageBoxHTML.innerText = null
  	metadaSet = false
  	isSearching = false
  }

 

  p.onpeerconnectsuccess  = ()=>{
  	isSearching = false
  	appendMessage(null, null, true)
  	document.getElementById("skip-bttn").style.visibility = "visible"
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
	peer = new PeerRTC("http://127.0.0.1:1000", {})
	/* eslint-enable */
	peer.setMediaStream(stream)
	peer.start(false, onConnected)
}


export const sendMessage = (message)=>{
	appendMessage(true, message)
	peer.sendText(message)
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

function appendMessage(isSender, message, restart){
	const messageBoxHTML = document.getElementById("message-box-display")

	if (restart) {
		messageBoxHTML.innerText = "Connected to a stranger.\n"
	} else{
		var owner = "Me:"
		if (!isSender) {
			owner = "Other:"
		}

		messageBoxHTML.innerText += `${owner} ${message}\n`
	}
	
}



function isAvailable() {
	return isSearching && peer && !peer.currentPeerId && metadaSet
}

function random(from, to){
	return Math.floor(Math.random() * to) + from
}

