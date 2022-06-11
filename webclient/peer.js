class PeerRTC {
	static REQ_TYPE_CONNECT_PEER = "connectpeer"
	static REQ_TYPE_ANSWER_PEER = "answerpeer"
	static REQ_TYPE_PEER_IDS = "peerids"
	static REQ_TYPE_ADD_PAYLOAD = "addPayload"
	static REQ_TYPE_GET_ALL_PEER_PAYLOADS = "getallpeerpayloads"
	static REQ_TYPE_GET_PEER_PAYLOAD = "getpeerpayload"
	static REQ_TYPE_DECLINE_PEER_CONNECT = "declinepeerconnect"

	constructor(serverURL, onConnectToServer) {	
		this.serverURL = serverURL
		this.isConnectedToServer = false
		this.id = null
		this.socket = null
		this.browserRTC = null
		this.currentPeerId = null

		this.onpeerids = null
		this.ontextmessage = null
		this.onfilemessage
		this.oncloseP2P = null
		this.onclose = null
		this.onnewpayload = null
		this.onpeerpayloads = null
		this.onpeerconnectrequest= null
		this.onpeerconnectdecline = null
	}

	sendText(text){
		this.browserRTC.sendText(text)
	}

	sendFile(fname, file, chunkSize=1024){
		this.browserRTC.sendFile(fname, file, chunkSize)
	}


	// For creating data payload associated to the websocket of this client
	addPayload(jsonData){
		this.socket.send(JSON.stringify({
			"type":PeerRTC.REQ_TYPE_ADD_PAYLOAD,
			"payload": JSON.stringify(jsonData)
		}))
	}


	getAllPeerPayloads(){
		this.socket.send(JSON.stringify({
			"type": PeerRTC.REQ_TYPE_GET_ALL_PEER_PAYLOADS
		}))
	}


	getPeerPayload(peerId){
		this.socket.send(JSON.stringify({
			"type": PeerRTC.REQ_TYPE_GET_PEER_PAYLOAD,
			"peerId": peerId
		}))
	}



	closeP2P(){
		const browserRTC  = this.browserRTC
		if (browserRTC != null) {
			browserRTC.close()
		}
		
		this.browserRTC = null
		this.currentPeerId = null
	}

	close(){
		this.closeP2P()
		const socket = this.socket
		const onclose = this.onclose
		if (socket != null && onclose) {
			this.socket = null
			this.id = null

			socket.close()
			onclose()
		}
	}

	connect(peerId){
		this.initBrowerRTC(peerId, true, null, (iceCandidates, sdp)=>{
			this.socket.send(JSON.stringify({
				"type": PeerRTC.REQ_TYPE_CONNECT_PEER,
				"peerId": peerId,
				"iceCandidates": iceCandidates,
				"sdp": sdp
			}))
		})
		
	}

	//retrieve all the peer ids from the server
	getAllPeerIds(){
		this.socket.send(JSON.stringify({
			"type": PeerRTC.REQ_TYPE_PEER_IDS,
			"id": this.id
		}))
	}



	
	start(onConnect){
		// Convert the provided server url to a web socket url
		const webSocketURL = "ws://" + this.serverURL.replaceAll(/((http(s{0,1}))|(ws(s{0,1}))):\/\//g, "")

		new Promise(async(resolve)=>{
			const socket = new WebSocket(webSocketURL)
			this.socket = socket

			socket.onopen= ()=>{
				this.isConnectedToServer = true
				socket.onclose =()=>{
					this.close()
				}

				socket.onmessage = data=>{
					this.handleServerData(data)
				}
				resolve()
			}

		}).then(()=>onConnect(this))

	}


	initBrowerRTC(targetPeerId, isOffer, answerSdp, sdpCallBack){
		var browserRTC  = this.browserRTC

		if (browserRTC == null) {
			browserRTC = new BrowserRTC()
		} else if (targetPeerId != this.currentPeerId) {
			// ensures that only the current peer id is able to update the current connection
			return
		}

		this.browserRTC = browserRTC

		const onConnectionEstablished = ()=>{
			console.log("Connection established")
		}

		const ontextmessage = text => {
			const ontextmessage = this.ontextmessage
			if (ontextmessage != null) {} {
				ontextmessage(text)
			}
			
		}

		const onfilemessage = (fileName, file, finishDownloading) =>{
			const onfilemessage = this.onfilemessage
			if (onfilemessage != null) {
				onfilemessage(fileName, file, finishDownloading)
			} 
		}

		const onicecandididate = (iceCandidates, sdp) => {
			sdpCallBack(iceCandidates, sdp)
		}

		const oncloseP2P = ()=>{
			this.closeP2P()
			const oncloseP2P = this.oncloseP2P
			if (oncloseP2P != null) {
				var currentPeerId = this.currentPeerId
				if (currentPeerId == null) {
					currentPeerId = ""
				}
				oncloseP2P(currentPeerId)
			}
		}

		

		browserRTC.setCallbacks(onConnectionEstablished, oncloseP2P, onicecandididate, ontextmessage, onfilemessage)
		
		if(isOffer){
			browserRTC.createOffer()
		} else{
			browserRTC.createAnswer(answerSdp)
		}

	}

	handleServerData(data){
		const jsonData = JSON.parse(data.data)
		
		if (jsonData.type == "initial") {
			this.id = jsonData.id
			this.connectionCreationTime = jsonData.connectionCreationTime
		} else if(jsonData.type == "incomingpeer"){
			const peerId = jsonData.fromId
			const accept = ()=>{
				this.initBrowerRTC(jsonData.fromId, false, jsonData.sdp, (iceCandidates, sdp)=>{
					this.browserRTC.addIceCandidates(jsonData.iceCandidates)
					this.socket.send(JSON.stringify({
						"type": PeerRTC.REQ_TYPE_ANSWER_PEER,
						"peerId": peerId,
						"iceCandidates": iceCandidates,
						"sdp": sdp
					}))
				})
			}


			const decline = ()=>{
				this.socket.send(JSON.stringify({
					"type":PeerRTC.REQ_TYPE_DECLINE_PEER_CONNECT,
					"peerId":peerId
				}))
			
			}
			

			const onpeerconnectrequest = this.onpeerconnectrequest
			if (onpeerconnectrequest != null) {
				onpeerconnectrequest(peerId, accept, decline)
			}
			
		}

		 else if(jsonData.type == "answerpeer"){
		 	const browserRTC = this.browserRTC
		 	browserRTC.setRemoteDescription(jsonData.sdp).then(o=>{
		 		browserRTC.addIceCandidates(jsonData.iceCandidates)
		 	}).catch(e=>{})

		} else if (jsonData.type == "peerids") {
			const onpeerids = this.onpeerids
			if (onpeerids != null) {
				onpeerids(jsonData.ids)
			}
		} else if (jsonData.type == "newpayload") {
			const onnewpayload = this.onnewpayload
			if (onnewpayload != null) {
				onnewpayload(jsonData.payload)
			}
		} else if (jsonData.type == "allpeerpayloads") {
			const onpeerpayloads = this.onpeerpayloads
			if (onpeerpayloads != null) {
				onpeerpayloads(jsonData.payloads)
			}
		} else if (jsonData.type == "peerpayload") {
			const onpeerpayloads = this.onpeerpayloads
			if (onpeerpayloads != null) {
				onpeerpayloads(JSON.stringify({
					"id":jsonData.peerId,
					"payload":jsonData.payload
				}))
			}
		} else if (jsonData.type == "peerconnectdecline") {
			const onpeerconnectdecline = this.onpeerconnectdecline
			if (onpeerconnectdecline != null) {
				onpeerconnectdecline(jsonData.peerId)
			}
		}
	}

}


// Wrapper class on top of the built in WebRTC api in modern browsers
class BrowserRTC{
	static TYPE_TEXT = "text"
	static TYPE_FILE = "file"

	

	constructor(){
		const conn = new RTCPeerConnection()
		this.conn = conn

		this.onmessage =  null
		this.datachannel = null
		this.onclose = null
		this.closed = false
	}

	setCallbacks(onConnectionEstablished, onclose, onicecandidate , ontextmessage, onfilemessage){
		const conn = this.conn
		const iceCandidates = []
		conn.onicecandidate  = event =>{
			const iceCandidate = event.candidate
			if (iceCandidate == null) {
				onicecandidate (iceCandidates, conn.localDescription)
			} else{
				iceCandidates.push(iceCandidate)
			}
			
		}
		this.onclose = onclose

		this.onmessage = message => {
			const data = message.data
			if (data instanceof ArrayBuffer) {
				const extracted = FileArrayBuffer.extractDataFromArrayBuffer(data)
				onfilemessage(extracted.fileName, extracted.fileArrayBuffer, extracted.finishDownloading)
			} else{
				ontextmessage(data.toString())
			}
			
		}
		this.onConnectionEstablished = onConnectionEstablished
	}




	createOffer(){
		const conn = this.conn
		const datachannel = conn.createDataChannel("Data Channel")
		this.initDataChannel(datachannel)
		conn.createOffer().then(o => conn.setLocalDescription(o)).catch(e=>{})

	}


	createAnswer(sdp){
		const conn = this.conn
		conn.ondatachannel = event=> {
			this.initDataChannel(event.channel)
		}
		conn.setRemoteDescription(sdp)
		conn.createAnswer().then(o => conn.setLocalDescription(o)).catch(e=>{})
	}


	setRemoteDescription(sdp){
		return this.conn.setRemoteDescription(sdp)
	}

	sendText(text){
		this.datachannel.send(text)
	}


	sendFile(fname, file, chunkSize){

		const fileReader = new FileReader()
		var offset = 0;

		const readChunk = ()=>{
			const chunked = file.slice(offset, offset + chunkSize)
			fileReader.readAsArrayBuffer(chunked)
		}

		fileReader.onload = event=>{
			const chunked = new Uint8Array (event.target.result)
			const finishDownloading = offset + chunked.byteLength >= file.size

			const finalArrayBuffer = FileArrayBuffer.buildByteArrayForSending(fname, chunked, finishDownloading)

			offset += chunked.byteLength

			this.datachannel.send(finalArrayBuffer)

			if (!finishDownloading) {
				readChunk()
			}
		}

		readChunk()

	}
	

	addIceCandidates(candidates){
		for(var candidate of candidates){
			this.conn.addIceCandidate(candidate)
		}
	}


	initDataChannel(channel){
		
		channel.onmessage = this.onmessage
		channel.onopen = this.onConnectionEstablished
		channel.onclose= this.onclose
		this.datachannel = channel
	}



	close(){
		if (!this.closed) {
			this.closed  = true
			this.conn.close()
			const datachannel = this.datachannel
			if (datachannel!= null) {
				datachannel.close()
			}
		}
		
	}
}

class FileArrayBuffer{
	// for array buffer in send fike
	static FNAME_POS = 0
	static FDOWNLOAD_DONE = 1

	// total extra data count added on file bytes array. The file name itself is excluded from this count
	static FEXTRA_DATA_COUNT = 2

	static FINISH_DOWNLOADING = 1
	static NOT_YET_FINISH_DOWNLOADING = 0

	static buildByteArrayForSending(fname, chunkBytes, finishDownloading){
		const fnameLength = fname.length
		const fnameArray = new TextEncoder().encode(fname)

		const chunked = new Uint8Array (event.target.result)
		const finalArrayBuffer = new Uint8Array(fnameLength + chunkBytes.length + FileArrayBuffer.FEXTRA_DATA_COUNT)

		finalArrayBuffer[FileArrayBuffer.FNAME_POS] = fnameLength
		
		var done = FileArrayBuffer.NOT_YET_FINISH_DOWNLOADING
		if (finishDownloading) {
			done = FileArrayBuffer.FINISH_DOWNLOADING
		}

		finalArrayBuffer[FileArrayBuffer.FDOWNLOAD_DONE] = done

		finalArrayBuffer.set(fnameArray,  FileArrayBuffer.FEXTRA_DATA_COUNT)
		finalArrayBuffer.set(chunkBytes, fnameLength + FileArrayBuffer.FEXTRA_DATA_COUNT)

		return finalArrayBuffer
	}


	static extractDataFromArrayBuffer(data){
		const buffer = new Uint8Array(data)
		const fileNameAscii = buffer.slice(FileArrayBuffer.FEXTRA_DATA_COUNT, buffer[FileArrayBuffer.FNAME_POS] + FileArrayBuffer.FEXTRA_DATA_COUNT)
		const fileArrayBuffer = buffer.slice(buffer[FileArrayBuffer.FNAME_POS] + FileArrayBuffer.FEXTRA_DATA_COUNT, buffer.length)
		const fileName =  new TextDecoder().decode(fileNameAscii)

		var finishDownloading = false
		if (buffer[FileArrayBuffer.FDOWNLOAD_DONE] == FileArrayBuffer.FINISH_DOWNLOADING) {
			finishDownloading = true
		}

		return {
			"filename": fileName,
			"fileArrayBuffer": fileArrayBuffer,
			"finishDownloading":  finishDownloading
		}
	}
}