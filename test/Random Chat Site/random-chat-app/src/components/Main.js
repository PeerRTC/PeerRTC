import {useState} from "react"
import videoPoster from "../images/video-placeholder.jpg"
import attachFileIcon from "../images/attach-file-icon.svg"

var peerFunc = {}

function Main(props){
	peerFunc = props.peerFunc
	return (
		<div id="main-container">
			<div id="video-displays-container">
				<video id="my-video" className="video-display" poster={videoPoster} autoPlay muted></video>
				<video id="incoming-video" className="video-display" poster={videoPoster} autoPlay></video>
			</div>

			<div id="message-displays-container">
				<p id="message-box-display"></p>
				<div id="send-message-container">
					<button id="start-bttn" onClick={()=>{startSearching()}}>Start</button>
					<button id="end-bttn" onClick={()=>{stop()}}>Stop</button>
					<button id="skip-bttn" onClick={()=>{skip()}}>Skip</button>
					<input id="message-box-input" type="text"/>
					<button id="send-message-bttn" onClick={()=>{sendMessage()}}>Send</button>
					<img id="attach-file-bttn" src={attachFileIcon}></img>
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
			return "visible"
		} else{
			return "hidden"
		}
	}
	document.getElementById("start-bttn").style.visibility = isVisible(isStartVisible)
	document.getElementById("end-bttn").style.visibility = isVisible(isStopVisible)
	document.getElementById("skip-bttn").style.visibility = isVisible(isSkipVisible)
}



export default Main