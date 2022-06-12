

peer = new PeerRTC()
peer.start( false, p=>{
	document.getElementById("peer-id").innerHTML = "My Id: " + p.id

	p.ontextmessage = ((m)=>{
		addMessageToMessageBox("Other", m)
		
	})

	
	

	p.onfilemessage = ((fname, fileBytesArray, done)=>{
		p.updateBlob(fname, fileBytesArray)
		
		if (done) {
			const blob = p.getBlob(fname)
			blobUrl = URL.createObjectURL(blob)
			p.deleteBlob(fname)

			const newFile = document.getElementById("incoming-file");
			newFile.href = blobUrl;
			newFile.download = fname;
			newFile.innerHTML = "New file to download: " + fname;
			
			
		}
	})

	p.oncloseP2P = (()=>{
		document.getElementById("otherVideo").srcObject = null
	})


	p.onclose = (()=>{
		console.log("Server closed ")
	})

	p.onnewpayload = ((payload)=>{
		console.log("New Payload: " + payload)
	})

	p.onpeerpayloads = ((payloads)=>{
		console.log("Peer Payloads: " + payloads)
	})

	p.onpeerids = ((ids) => {
		console.log("Peer Ids: " + ids)
	})


	p.onpeerconnectrequest = ((peerId, accept, decline)=>{
		const container = document.getElementById("incoming-connection-container")
		const messageDisplay = document.getElementById("incoming-connection-message")
		const acceptButton = document.getElementById("accept")
		const declineButton = document.getElementById("decline")

		const buttonClick = (action)=>{
			container.style.visibility  = "hidden"
			action()
		}
		
		container.style.visibility  = "visible"
		messageDisplay.innerText = "Incoming call from " + peerId
		acceptButton.onclick  = ()=>{
			buttonClick(accept)
		}

		declineButton.onclick = ()=>{
			buttonClick(decline)
		}

	})

	p.onpeerconnectdecline = (peerId => {
		alert("Decline request connect to " + peerId)
	})

	p.onnewtrack = (newTrack, trackStreams) => {
		document.getElementById("otherVideo").srcObject = trackStreams[0]
		console.log(newTrack)
	}


	p.onpeerconnectsuccess = peerId =>{
		console.log("Successfully connected to " + peerId)
	}


	navigator.mediaDevices.getUserMedia({audio:true, video:true}).then(stream =>{
		document.getElementById("myVideo").srcObject = stream
		p.addMediaStream(stream)
	})
	
})


function sendFile(){
	const fileInput = document.getElementById("file-input")
	const files = fileInput.files
	for(file of files){
		peer.sendFile(file.name, file)
	}

}

function connectPeer(){
	const input = document.getElementById("peer-id-input")
	const peerId = input.value
	input.value = ""
	
	if (peerId) {
		peer.connect(peerId.trim())

	}
}


function sendMessage(){
	const messageInput = document.getElementById("message-input")
	const messageBox = document.getElementById("message-box")
	addMessageToMessageBox("Me", messageInput.value)
	peer.sendText(messageInput.value)
	messageInput.value = ""
}


function endConnect(){
	peer.closeP2P()
}

function addMessageToMessageBox(sender, message){
	const messageBox = document.getElementById("message-box")
	messageBox.innerText = `${messageBox.innerText}\n ${sender}: ${message}`
}

