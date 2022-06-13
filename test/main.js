const sendingFiles = new Map()
const receivingFiles = new Map()



const serverURL = null	

//used in web's RTCPeerConnection as found here - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection
const configurations = {}	 


peer = new PeerRTC(serverURL, configurations)
peer.start( false, p=>{
	document.getElementById("peer-id").innerHTML = "My Id: " + p.id

	p.ontextmessage = (m)=>{
		addMessageToMessageBox("Other", m)
		
	}

	
	
	p.onsendfilemessage = (file, fileSizeSent)=>{
		var currentDownloaded = sendingFiles.get(file)
		if (currentDownloaded) {
			currentDownloaded += fileSizeSent
		} else{
			currentDownloaded = fileSizeSent
		}

		
		if (currentDownloaded < file.size) {
			sendingFiles.set(file, currentDownloaded)
			display = `${currentDownloaded}/${file.size} bytes`
		} else{
			display = ""
			sendingFiles.delete(file)
		}
		document.getElementById("downloaded").innerText = display
	}


	p.onfilemessage = (fname, fileTotalSize, fileBytesArray, done)=>{
		var currentReceivedSize = receivingFiles.get(fname)

		const receivedSize = fileBytesArray.byteLength
		if (currentReceivedSize) {
			currentReceivedSize += fileBytesArray.byteLength
		} else{
			currentReceivedSize = receivedSize
		}

		receivingFiles.set(fname, currentReceivedSize)
		var display = `${currentReceivedSize}/${fileTotalSize} bytes`

		p.updateBlob(fname, fileBytesArray)

		
		if (done) {
			display = ""
			receivingFiles.delete(fname)

			const blob = p.getBlob(fname)
			blobUrl = URL.createObjectURL(blob)
			p.deleteBlob(fname)

			const newFile = document.getElementById("incoming-file");
			newFile.href = blobUrl;
			newFile.download = fname;
			newFile.innerHTML = "New file to download: " + fname;
			
			
		}

		document.getElementById("received").innerText = display
	}

	p.oncloseP2P = ()=>{
		document.getElementById("connected-to").innerText = ""
		document.getElementById("otherVideo").srcObject = null
	}


	p.onclose = ()=>{
		document.getElementById("connected-to").innerText = ""
		console.log("Server closed ")
	}

	p.onnewpayload = (payload)=>{
		console.log("New Payload: " + payload)
	}


	p.onnewprivatepayload = payload =>{
		console.log("New Private Payload: " + payload)
	}

	p.onpeerpayloads = (payloads)=>{
		console.log("Peer Payloads: " + payloads)
	}

	p.onpeerids = (ids) => {
		console.log("Peer Ids: " + ids)
	}


	p.onpeerconnectrequest = (peerId, accept, decline)=>{
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

	}

	p.onpeerconnectdecline = peerId => {
		alert("Decline request connect to " + peerId)
	}

	p.onnewtrack = (newTrack, trackStreams) => {
		document.getElementById("otherVideo").srcObject = trackStreams[0]
	}


	p.onpeerconnectsuccess = peerId =>{
		document.getElementById("connected-to").innerText = "Successfully connected to " + peerId
	}



	p.onadminbroadcastdata = data =>{
		console.log(data)
	}

	p.onadmingetallclientsdata = clientsData =>{
		console.log(clientsData)
	}

	p.onadminactiondecline = ()=> {
		console.log("Failed to execute admin only action")
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

