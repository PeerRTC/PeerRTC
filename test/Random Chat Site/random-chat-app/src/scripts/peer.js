var peer = null
var isSearching = false
var metadaSet = false


// Since we are using default servers, this serves as an identity for clients created from this specific project.
const identity = "random_chat123124"

var onConnected =p=>{
	const incomingVideoHTML = document.getElementById("incoming-video")
	const messageBoxHTML = document.getElementById("message-box-display")
  
  p.onnewtrack = (newTrack, trackStreams)=>{
  	incomingVideoHTML.srcObject = trackStreams[0]
  }

  p.oncloseP2P = ()=>{
  	incomingVideoHTML.srcObject = null
  	messageBoxHTML.innerText = null
  	if (isSearching) {
  		startSearching()
  	}
  }

  p.onClose = ()=>{
  	incomingVideoHTML.srcObject = null
  	messageBoxHTML.innerText = null
  	metadaSet = false
  	isSearching = false
  }

  p.ontextmessage = message=>{
  	appendMessage(false, message)
  }


  p.onpeerconnectsuccess  = ()=>{
  	isSearching = false
  	console.log("Connected to peer")
  }


  p.onpeerconnectrequest = (peerId, accept, decline)=>{
  	if (isAvailable()) {
  		accept()
			isSearching = false
  	} else{
  		console.log("Declined")
  		decline()
  	}
  }

  p.onpeerconnectdecline = ()=>{
  	if (isAvailable()) {
  		startSearching()
  		console.log("A")
  	}
  }

   p.onnewpayload  = payload=>{
   	const jsonPayload = JSON.parse(payload)
   	if (jsonPayload.identity == identity) {
   		metadaSet = true
   		startSearching()
   	}
  }



 
  p.addPayload({identity:identity})
 	
  console.log(p.id)
}

function startPeer(stream){
	document.getElementById("my-video").srcObject = stream

	/* eslint-disable */
	peer = new PeerRTC("http://127.0.0.1:1000", {})
	/* eslint-enable */
	peer.setMediaStream(stream)
	peer.start(false, onConnected)
}


function sendMessage(message){
	appendMessage(true, message)
	peer.sendText(message)
}


function startSearching() {
	isSearching = true

	console.log("Searching")
	peer.onpeerpayloads = payloads =>{
  	if (!isAvailable) return

  	console.log("peer payloads")

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
  			if (!peer.currentPeerId) {
  				startSearching()
  			}
  		}, random(1000,2000))
  		console.log("Connecting to peer: " + peerId)
  	} else if (isSearching) {
  		console.log("Is searchng")
  		setTimeout(()=>{
  			startSearching()
  		}, random(500,2000))
  	}
  	
  }

  if(isAvailable) peer.getAllPeerPayloads()
}

function stopSearching() {
	isSearching = false
}

function appendMessage(isSender, message){
	const messageBoxHTML = document.getElementById("message-box-display")
	var owner = "Me:"
	if (!isSender) {
		owner = "Other:"
	}

	messageBoxHTML.innerText += `${owner} ${message}\n`
}


function isAvailable() {
	return isSearching && peer && !peer.currentPeerId && metadaSet
}

function random(from, to){
	return Math.floor(Math.random() * to) + from
}

module.exports = {
	startPeer:startPeer,
	sendMessage: sendMessage
}