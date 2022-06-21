/**
 * A simple module for easy peer to peer connection. Github repository can be found
 * at https://github.com/ShimShim27/PeerRTC
 * 
 * @author ShimShim27
 * 
 */

class PeerRTC {
	// server request constants
	static #REQ_TYPE_CONNECT_PEER = "connectpeer"
	static #REQ_TYPE_ANSWER_PEER = "answerpeer"
	static #REQ_TYPE_PEER_IDS = "peerids"
	static #REQ_TYPE_ADD_PAYLOAD = "addpayload"
	static #REQ_TYPE_ADD_PRIVATE_PAYLOAD = "addprivatepayload"
	static #REQ_TYPE_GET_ALL_PEER_PAYLOADS = "getallpeerpayloads"
	static #REQ_TYPE_GET_PEER_PAYLOAD = "getpeerpayload"
	static #REQ_TYPE_DECLINE_PEER_CONNECT = "declinepeerconnect"
	static #REQ_TYPE_PING = "ping"


	// response related constants
	static #RES_TYPE_INITIAL = "initial"
	static #RES_TYPE_INCOMING_PEER = "incomingpeer"
	static #RES_TYPE_ANSWER_PEER = "answerpeer"
	static #RES_TYPE_PEER_IDS = "peerids"
	static #RES_TYPE_NEW_PAYLOAD = "newpayload"
	static #RES_TYPE_NEW_PRIVATE_PAYLOAD = "newprivatepayload"
	static #RES_ALL_PEER_PAYLOADS = "allpeerpayloads"
	static #RES_PEER_PAYLOAD = "peerpayload"
	static #RES_PEER_CONNECT_DECLINE = "peerconnectdecline"
	static #RES_TYPE_ADMIN_BROADCAST_DATA = "broadcastdata"
	static #RES_TYPE_ADMIN_GET_ALL_CLIENTS_DATA = "getallclientsdata"
	static #RES_TYPE_ADMIN_ACTION_DECLINE = "adminactiondecline"


	// admin related constants
	static #REQ_TYPE_ADMIN = "admin"
	static #ADMIN_ACTION_BROADCAST_DATA = "broadcastdata"
	static #ADMIN_ACTION_GET_ALL_CLIENTS_DATA = "getallclientsdata"

	// This server is not secure and stable. It is adviseable to use own.
	static DEFAULT_SERVER_URL = "https://peer-rtc-sever.herokuapp.com/"

	#browserRTC = null
	#socket = null
	#blobs = null
	#pinger = null

	constructor(serverURL, configuration) {	
		
		if (!serverURL) {
			serverURL = PeerRTC.DEFAULT_SERVER_URL
		}
		
		if (!configuration) {
			configuration = {
				"iceServers": [{ "urls" : "stun:stun.l.google.com:19302" }]
			}
		} 

		
		


		this.serverURL = serverURL
		this.configuration = configuration
		this.#blobs = new BlobsStorage()
		this.isConnectedToServer = false

		// declaring all global variables to null for easy visualization purposes only
		this.id = null
		this.currentPeerId = null
		this.mediaStream = null

		this.onpeerconnectsuccess = null
		this.onpeerids = null
		this.ontextmessage = null
		this.onfilemessage = null
		this.onsendfilemessage = null
		this.oncloseP2P = null
		this.onclose = null
		this.onnewpayload = null
		this.onnewprivatepayload = null
		this.onpeerpayloads = null
		this.onpeerconnectrequest= null
		this.onpeerconnectdecline = null
		this.onnewtrack = null

		this.onservererror = null

		this.onadminbroadcastdata = null
		this.onadmingetallclientsdata = null
		this.onadminactiondecline = null
	}


	pingServer(everyMillis, onserverping){
		clearInterval(this.#pinger)
		this.#pinger = setInterval(()=>{
			const socket = this.#socket
			try{
				if (socket && socket.readyState == 1) {
					socket.send(JSON.stringify({
						"type": PeerRTC.#REQ_TYPE_PING
					}))
					if (onserverping) {
						onserverping()
					}
				}
			}catch(e){
				
			}
		}, everyMillis)
	}


	clearServerPinger(){
		clearInterval(this.#pinger)
	}



	sendText(text){
		this.#browserRTC.sendText(text)
	}

	sendFile(fname, file, chunkSize=1024){
		this.#browserRTC.sendFile(fname, file, chunkSize)
	}


	// For creating data payload associated to the websocket of this client
	addPayload(jsonData){
		this.#socket.send(JSON.stringify({
			"type":PeerRTC.#REQ_TYPE_ADD_PAYLOAD,
			"payload": JSON.stringify(jsonData)
		}))
	}

	addPrivatePayload(jsonData){
		this.#socket.send(JSON.stringify({
			"type": PeerRTC.#REQ_TYPE_ADD_PRIVATE_PAYLOAD,
			"payload": JSON.stringify(jsonData)
		}))
	}


	getAllPeerPayloads(){
		this.#socket.send(JSON.stringify({
			"type": PeerRTC.#REQ_TYPE_GET_ALL_PEER_PAYLOADS
		}))
	}


	getPeerPayload(peerId){
		this.#socket.send(JSON.stringify({
			"type": PeerRTC.#REQ_TYPE_GET_PEER_PAYLOAD,
			"peerId": peerId
		}))
	}



	closeP2P(){
		const browserRTC  = this.#browserRTC
		if (browserRTC ) {
			browserRTC.close()
		}
		
		this.#browserRTC = null
		this.currentPeerId = null
	}

	close(){
		this.closeP2P()
		const socket = this.#socket
		const onclose = this.onclose
		if (socket  && onclose) {
			this.#socket = null
			this.id = null

			socket.close()
			onclose()
		}
	}

	connect(peerId){
		const connect = ()=>{
			this.#initBrowserRTC(peerId, true, null, (iceCandidates, sdp)=>{
				this.#socket.send(JSON.stringify({
					"type": PeerRTC.#REQ_TYPE_CONNECT_PEER,
					"peerId": peerId,
					"iceCandidates": iceCandidates,
					"sdp": sdp
				}))
			})
		}

		if (this.currentPeerId) {
			this.#browserRTC.onclose = connect
			this.closeP2P()
		} else{
			connect()
		}
		
		
		
	}

	//retrieve all the peer ids from the server
	getAllPeerIds(){
		this.#socket.send(JSON.stringify({
			"type": PeerRTC.#REQ_TYPE_PEER_IDS,
			"id": this.id
		}))
	}



	
	start(isSecure, onConnect){
		var scheme = "ws://"
		if (isSecure) {
			scheme = "wss://"
		}
		
		// Convert the provided server url to a web socket url
		const webSocketURL =scheme + this.serverURL.replaceAll(/((http(s{0,1}))|(ws(s{0,1}))):\/\//g, "")

		new Promise(async(resolve)=>{
			const socket = new WebSocket(webSocketURL)
			this.#socket = socket

			socket.onopen= ()=>{
				this.isConnectedToServer = true
				socket.onclose =()=>{
					this.isConnectedToServer = false
					this.close()
				}

				socket.onmessage = data=>{
					this.#handleServerData(data, resolve)
				}
				
			}

			socket.onerror = event =>{
				const onservererror = this.onservererror
				if (onservererror) {
					onservererror(event)
				}
			}

		}).then(()=>onConnect(this))

	}



	updateBlob(fname, arrayBuffer){
		this.#blobs.updateBlob(fname, arrayBuffer)
	}


	getBlob(fname){
		return this.#blobs.getBlob(fname)
	}

	deleteBlob(fname){
		this.#blobs.deleteBlob(fname)
	}


	getAllBlobFiles(){
		return this.#blobs.getAllFiles()
	}


	deleteAllBlobFiles(){
		this.#blobs.deleteAllFiles()
	}


	setMediaStream(stream){
		const browserRTC = this.#browserRTC
		this.mediaStream = stream
		if (browserRTC) {
			browserRTC.setMediaStream(stream)
		}

	}


	
	adminBroadcastData(key, data){
		this.#socket.send(JSON.stringify({
			"type": PeerRTC.#REQ_TYPE_ADMIN,
			"key": key,
			"action": PeerRTC.#ADMIN_ACTION_BROADCAST_DATA,
			"data": data
		}))
	}

	adminGetAllClientsData(key){
		this.#socket.send(JSON.stringify({
			"type": PeerRTC.#REQ_TYPE_ADMIN,
			"key": key,
			"action": PeerRTC.#ADMIN_ACTION_GET_ALL_CLIENTS_DATA
		}))
	}

	#initBrowserRTC(targetPeerId, isOffer, answerSdp, sdpCallBack){
		var browserRTC  = this.#browserRTC

		if (!browserRTC) {
			browserRTC = new BrowserRTC(this.configuration, this.mediaStream)
		} else if (targetPeerId != this.currentPeerId) {
			// ensures that only the current peer id is able to update the current connection
			return
		}

		this.#browserRTC = browserRTC

		const onConnectionEstablished = peerId=>{
			this.currentPeerId = peerId

			const onpeerconnectsuccess = this.onpeerconnectsuccess
			if (onpeerconnectsuccess) {
				onpeerconnectsuccess(peerId)
			}
		}

		const ontextmessage = text => {
			const ontextmessage = this.ontextmessage
			if (ontextmessage ) {} {
				ontextmessage(text)
			}
			
		}

		const onfilemessage = (fileName, fileTotalSize, fileBytesArray, finishDownloading) =>{
			const onfilemessage = this.onfilemessage
			if (onfilemessage ) {
				onfilemessage(fileName, fileTotalSize, fileBytesArray, finishDownloading)
			} 
		}

		const onicecandididate = (iceCandidates, sdp) => {
			sdpCallBack(iceCandidates, sdp)
		}

		const oncloseP2P = ()=>{
			this.closeP2P()
			const oncloseP2P = this.oncloseP2P
			if (oncloseP2P) {
				oncloseP2P()
			}
		}


		const onnewtrack = (newTrack, trackStreams) => {
			const onnewtrack = this.onnewtrack
			if (onnewtrack ) {
				onnewtrack(newTrack, trackStreams)
			}

		}


		const onsendfilemessage = (file, fileSizeSent)=>{
			const onsendfilemessage = this.onsendfilemessage
			if (onsendfilemessage) {
				onsendfilemessage(file, fileSizeSent)
			}
		}


		

		browserRTC.setCallbacks(onConnectionEstablished, oncloseP2P, onicecandididate, ontextmessage, onfilemessage, onsendfilemessage, onnewtrack)
		browserRTC.addStreamToConnection()

		if(isOffer){
			browserRTC.createOffer()
		} else{
			browserRTC.createAnswer(targetPeerId, answerSdp)
		}

	}

	#handleServerData(data, resolve){
		const jsonData = JSON.parse(data.data)
		
		if (jsonData.type == PeerRTC.#RES_TYPE_INITIAL) {
			this.id = jsonData.id
			this.connectionCreationTime = jsonData.connectionCreationTime
			resolve()
			
		} else if(jsonData.type == PeerRTC.#RES_TYPE_INCOMING_PEER){
			const peerId = jsonData.fromId
			const accept = ()=>{
				this.#initBrowserRTC(jsonData.fromId, false, jsonData.sdp, (iceCandidates, sdp)=>{
					this.#browserRTC.addIceCandidates(jsonData.iceCandidates)
					this.#socket.send(JSON.stringify({
						"type": PeerRTC.#REQ_TYPE_ANSWER_PEER,
						"peerId": peerId,
						"iceCandidates": iceCandidates,
						"sdp": sdp
					}))
				})
			}


			const decline = ()=>{
				this.#socket.send(JSON.stringify({
					"type":PeerRTC.#REQ_TYPE_DECLINE_PEER_CONNECT,
					"peerId":peerId
				}))
			
			}
			

			const onpeerconnectrequest = this.onpeerconnectrequest
			if (onpeerconnectrequest ) {
				onpeerconnectrequest(peerId, accept, decline)
			}
			
		}

		 else if(jsonData.type == PeerRTC.#RES_TYPE_ANSWER_PEER){
		 	const browserRTC = this.#browserRTC
		 	browserRTC.setRemoteDescription(jsonData.fromId, jsonData.sdp).then(o=>{
		 		browserRTC.addIceCandidates(jsonData.iceCandidates)
		 	}).catch(e=>{})

		} else if (jsonData.type == PeerRTC.#RES_TYPE_PEER_IDS) {
			const onpeerids = this.onpeerids
			if (onpeerids ) {
				onpeerids(jsonData.ids)
			}
		} else if (jsonData.type == PeerRTC.#RES_TYPE_NEW_PAYLOAD) {
			const onnewpayload = this.onnewpayload
			if (onnewpayload ) {
				onnewpayload(jsonData.payload)
			}
		}  else if (jsonData.type == PeerRTC.#RES_TYPE_NEW_PRIVATE_PAYLOAD) {
			const onnewprivatepayload = this.onnewprivatepayload
			if(onnewprivatepayload){
				onnewprivatepayload(jsonData.payload)
			}

		} else if (jsonData.type == PeerRTC.#RES_ALL_PEER_PAYLOADS) {
			const onpeerpayloads = this.onpeerpayloads
			if (onpeerpayloads ) {
				onpeerpayloads(jsonData.payloads)
			}
		} else if (jsonData.type == PeerRTC.#RES_PEER_PAYLOAD) {
			const onpeerpayloads = this.onpeerpayloads
			if (onpeerpayloads ) {
				onpeerpayloads(JSON.stringify({
					"id":jsonData.peerId,
					"payload":jsonData.payload
				}))
			}
		} else if (jsonData.type == PeerRTC.#RES_PEER_CONNECT_DECLINE) {
			const onpeerconnectdecline = this.onpeerconnectdecline
			if (onpeerconnectdecline ) {
				onpeerconnectdecline(jsonData.peerId)
			}
		} else if(jsonData.type == PeerRTC.#ADMIN_ACTION_BROADCAST_DATA){
			const onadminbroadcastdata = this.onadminbroadcastdata
			if (onadminbroadcastdata) {
				onadminbroadcastdata(jsonData.data)
			}
		} else if (jsonData.type == PeerRTC.#ADMIN_ACTION_GET_ALL_CLIENTS_DATA) {
			const onadmingetallclientsdata = this.onadmingetallclientsdata
			if (onadmingetallclientsdata) {
				onadmingetallclientsdata(jsonData.data)
			}
		} else if (jsonData.type == PeerRTC.#RES_TYPE_ADMIN_ACTION_DECLINE) {
			const onadminactiondecline = this.onadminactiondecline
			if (onadminactiondecline) {
				onadminactiondecline()
			}
		}
	}

}


// Wrapper class on top of the built in WebRTC api in modern browsers
class BrowserRTC{
	
	constructor(configuration, mediaStream){
		const conn = new RTCPeerConnection(configuration)
		conn.peerId = null

		this.conn = conn
		this.mediaStream = mediaStream
		this.closed = false

		this.onsendfilemessage = null
		this.onmessage =  null
		this.datachannel = null
		this.onclose = null

	}

	setCallbacks(onConnectionEstablished, onclose, onicecandidate , ontextmessage, onfilemessage, onsendfilemessage, onnewtrack){
		const conn = this.conn
		const iceCandidates = []
		conn.onicecandidate  = event =>{
			const iceCandidate = event.candidate
			if (!iceCandidate) {
				onicecandidate (iceCandidates, conn.localDescription)
			} else{
				iceCandidates.push(iceCandidate)
			}
			
		}

		conn.ontrack = event => {
			onnewtrack(event.track, event.streams)
		}

		this.onclose = ()=>{
			onclose()
		}

		this.onmessage = message => {
			const data = message.data
			if (data instanceof ArrayBuffer) {
				const extracted = FileArrayBuffer.extractDataFromArrayBuffer(data)
				onfilemessage(extracted.fileName, extracted.fileTotalSize, extracted.fileArrayBuffer, extracted.finishDownloading)
			} else{
				ontextmessage(data.toString())
			}
			
		}
		this.onConnectionEstablished = ()=>{
			onConnectionEstablished(this.conn.peerId)
		}

		this.onsendfilemessage = onsendfilemessage


	}


	addStreamToConnection(){
		try{
			const stream = this.mediaStream
			if (stream) {
				for(const track of stream.getTracks()){
					this.conn.addTrack(track, stream)
				}
			}
		}catch(e){

		}
	}


	createOffer(){
		const conn = this.conn
		const datachannel = conn.createDataChannel("Data Channel")

		this.conn.peerId = null
		this.initDataChannel(datachannel)
		conn.createOffer().then(o => conn.setLocalDescription(o)).catch(e=>{})

	}


	createAnswer(peerId, sdp){
		const conn = this.conn
		conn.ondatachannel = event=> {
			this.initDataChannel(event.channel)
		}
		this.setRemoteDescription(peerId, sdp)
		conn.createAnswer().then(o => conn.setLocalDescription(o)).catch(e=>{})
	}


	setRemoteDescription(peerId, sdp){
		const conn = this.conn
		conn.peerId = peerId
		return conn.setRemoteDescription(sdp)
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
			const onsendfilemessage = this.onsendfilemessage
			const chunked = new Uint8Array (event.target.result)
			const totalFileSize = file.size
			const finishDownloading = offset + chunked.byteLength >= totalFileSize

			const finalArrayBuffer = FileArrayBuffer.buildByteArrayForSending(fname, totalFileSize, chunked, finishDownloading)

			offset += chunked.byteLength

			this.datachannel.send(finalArrayBuffer)

			if (onsendfilemessage) {
				onsendfilemessage(file, chunked.byteLength)
			}



			if (!finishDownloading) {
				readChunk()
			}
		}

		readChunk()

	}
	

	addIceCandidates(candidates){
		for(const candidate of candidates){
			this.conn.addIceCandidate(candidate)
		}
	}

	
	setMediaStream(stream){
		this.mediaStream = stream

		const replaceTrack = kind=>{
			
			const tracks = stream.getTracks()
			var currentTrack
			var count = 0
			for(const track of tracks){
				if (track.kind == kind) {
					if (count > 1) {
						throw Error(`Max of one track only for ${kind} in a MediaStream.`)
					}

					currentTrack = track
					count++
				}
				
			}

			for(const sender of this.conn.getSenders()){
				if (sender.track.kind == kind) {
					if (currentTrack) {
						sender.replaceTrack(currentTrack)
					} else{
						sender.track.enabled = false
					}
					
					break
				}
			}
			


		}


		replaceTrack("audio")
		replaceTrack("video")
		
	}




	initDataChannel(channel){
		
		channel.onmessage = this.onmessage
		channel.onopen = this.onConnectionEstablished
		channel.onclose= ()=>{
			this.onclose()
		}
		this.datachannel = channel
	}



	close(){
		if (!this.closed) {
			this.closed  = true
			this.conn.close()
			const datachannel = this.datachannel
			if (datachannel) {
				datachannel.close()
			}
		}
		
	}

}

class FileArrayBuffer{
	// for array buffer in send fike
	static FNAME_POS = 0
	static FTOTAL_SIZE_POS = 1
	static FDOWNLOAD_DONE_POS = 2

	// total extra data count added on file bytes array. The file name itself is excluded from this count
	static FEXTRA_DATA_COUNT = 3

	static FINISH_DOWNLOADING = 1
	static NOT_YET_FINISH_DOWNLOADING = 0

	static buildByteArrayForSending(fname, totalFileSize, chunkBytes, finishDownloading){
		const fnameLength = fname.length
		const fnameArray = new TextEncoder().encode(fname)
		const fileSizeString = totalFileSize.toString()
		const fileSizeLength = fileSizeString.length

		const chunked = new Uint8Array (event.target.result)
		const finalArrayBuffer = new Uint8Array(fnameLength + chunkBytes.length + fileSizeLength + FileArrayBuffer.FEXTRA_DATA_COUNT)

		finalArrayBuffer[FileArrayBuffer.FNAME_POS] = fnameLength
		finalArrayBuffer[FileArrayBuffer.FTOTAL_SIZE_POS] = fileSizeLength

		var done = FileArrayBuffer.NOT_YET_FINISH_DOWNLOADING
		if (finishDownloading) {
			done = FileArrayBuffer.FINISH_DOWNLOADING
		}

		finalArrayBuffer[FileArrayBuffer.FDOWNLOAD_DONE_POS] = done


		const fileSizeArray = []
		for(const num of fileSizeString){
			fileSizeArray.push(num)
		}

		finalArrayBuffer.set(fileSizeArray, FileArrayBuffer.FEXTRA_DATA_COUNT)
		finalArrayBuffer.set(fnameArray,  FileArrayBuffer.FEXTRA_DATA_COUNT + fileSizeLength)
		finalArrayBuffer.set(chunkBytes,FileArrayBuffer.FEXTRA_DATA_COUNT + fileSizeLength + fnameLength)

		return finalArrayBuffer
	}


	static extractDataFromArrayBuffer(data){
		const buffer = new Uint8Array(data)
		const fileSizeLength = buffer[FileArrayBuffer.FTOTAL_SIZE_POS]
		const fileNameLength = buffer[FileArrayBuffer.FNAME_POS]

		const fileTotalSizeEnd = FileArrayBuffer.FEXTRA_DATA_COUNT + fileSizeLength
		const fileNameAsciiEnd = fileTotalSizeEnd + fileNameLength

		const fileTotalSize = parseInt(buffer.slice(FileArrayBuffer.FEXTRA_DATA_COUNT, fileTotalSizeEnd).join(""))
		const fileNameAscii = buffer.slice(fileTotalSizeEnd,  fileNameAsciiEnd)
		const fileArrayBuffer = buffer.slice(fileNameAsciiEnd, buffer.length)

		const fileName =  new TextDecoder().decode(fileNameAscii)

		var finishDownloading = false
		if (buffer[FileArrayBuffer.FDOWNLOAD_DONE_POS] == FileArrayBuffer.FINISH_DOWNLOADING) {
			finishDownloading = true
		}

		return {
			"fileName": fileName,
			"fileTotalSize": fileTotalSize,
			"fileArrayBuffer": fileArrayBuffer,
			"finishDownloading":  finishDownloading
		}
	}
}


class BlobsStorage{
	constructor(){
		this.blobs = new Map()
	}


	// Be sure to handle memory errors as blobs can grow bigger
	updateBlob(fname, arrayBuffer){
		const blobs = this.blobs
		if (!blobs.has(fname)) {
			blobs.set(fname, new Blob([]))
		}
		blobs.set(fname, new Blob([blobs.get(fname), arrayBuffer]))		
	
	}

	getBlob(fname){
		return this.blobs.get(fname)
	}

	deleteBlob(fname){
		this.blobs.delete(fname)
	}


	getAllFiles(){
		const files = []
		for(file in this.blobs.keys()){
			files.push(file)
		}

		return files
	}	


	deleteAllFiles(){
		this.blobs.clear()
	}

}


