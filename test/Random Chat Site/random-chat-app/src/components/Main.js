import videoPoster from "../images/video-placeholder.jpg"
import attachFileIcon from "../images/attach-file-icon.svg"


function Main(){
	return (
		<div id="main-container">
			<div id="video-displays-container">
				<video id="my-video" className="video-display" poster={videoPoster} autoPlay muted></video>
				<video id="incoming-video" className="video-display" poster={videoPoster} autoPlay></video>
			</div>

			<div id="message-displays-container">
				<p id="message-box-display">dsads</p>
				<div id="send-message-container">
					<input id="message-box-input" type="text"/>
					<button id="send-message-bttn">Send</button>
					<img id="attach-file-bttn" src={attachFileIcon}></img>
				</div>
			</div>
		</div>
	)
}




export default Main