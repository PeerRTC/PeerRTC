import {useState} from "react"
import videoPoster from "../images/video-placeholder.jpg"
import attachFileIcon from "../images/attach-file-icon.svg"

var peerFunc = {}

function Main(props){
	peerFunc = props.peerFunc
	return (
		<div  id="main-container">
			<header id="main-header">
				<h1 id="heading-title">💖 Simple Random Chat</h1>
			</header>

			<div id="main-content-container">
				<div id="video-displays-container">
					<video id="my-video" className="video-display" poster={videoPoster} autoPlay muted></video>
					<video id="incoming-video" className="video-display" poster={videoPoster} autoPlay></video>
				</div>

				<div id="message-displays-container">
					<div id="connected-to-peer-indicator">Connected to a stranger 🔥</div>
					<div id="message-box-display"></div>
					<div id="send-message-container">
						<button id="start-bttn" onClick={()=>{startSearching()}}>Start</button>
						<button id="end-bttn" onClick={()=>{stop()}}>Stop</button>
						<button id="skip-bttn" onClick={()=>{skip()}}>Skip</button>
						<input id="message-box-input" type="text"/>
						<button id="send-message-bttn" onClick={()=>{sendMessage()}}>Send</button>
						<img id="attach-file-bttn" src={attachFileIcon} onClick={()=>{sendFile()}}></img>
						<input id="upload-file-chooser" type="file" accept="image/*" onChange={()=>{sendImage()}}></input>
					</div>
				</div>
			</div>
		</div>
	)
}


function sendMessage(){
	const messageBoxInput = document.getElementById("message-box-input")
	const message = messageBoxInput.value
	messageBoxInput.value = null
	peerFunc.sendMessage(message)
}


function startSearching(){
	messageContainerButtonsVisibility(false, true, false)
	peerFunc.startSearching()
}

function skip(){
	peerFunc.skip()
	messageContainerButtonsVisibility(false, true, false)
}

function stop(){
	messageContainerButtonsVisibility(true, false, false)
	peerFunc.stop()
}

function messageContainerButtonsVisibility(isStartVisible, isStopVisible, isSkipVisible){
	const isVisible = visible=>{
		if (visible) {
			return "block"
		} else{
			return "none"
		}
	}
	document.getElementById("start-bttn").style.display = isVisible(isStartVisible)
	document.getElementById("end-bttn").style.display = isVisible(isStopVisible)
	document.getElementById("skip-bttn").style.display = isVisible(isSkipVisible)
}


function sendFile(){
	document.getElementById("upload-file-chooser").click()
}

function sendImage() {
	const file = document.getElementById("upload-file-chooser").files[0]
	document.getElementById("upload-file-chooser").value = null
	peerFunc.sendFile(file)
	const reader = new FileReader()
	reader.onload = e=>{
		peerFunc.displayImageMessage(true, new Blob([new Uint8Array(e.target.result)]))
	}
	reader.readAsArrayBuffer(file)
	
}



export default Main