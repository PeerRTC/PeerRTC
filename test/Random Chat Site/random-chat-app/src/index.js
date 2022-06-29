import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from "./components/Main.js"
import "./styles/main.css"
import {startPeer, sendMessage, startSearching, stop, skip, sendFile, displayImageMessage} from "./scripts/peer.js"


const peerFunc = {
  sendMessage:sendMessage,
  startSearching:startSearching,
  stop:stop,
  skip:skip,
  sendFile:sendFile,
  displayImageMessage:displayImageMessage
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main peerFunc={peerFunc}/>);



navigator.mediaDevices.getUserMedia({audio:false, video:true}).then(stream=>{
  startPeer(stream)
}).catch(e=>{
  alert(e)
})

