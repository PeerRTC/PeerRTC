import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from "./components/Main.js"
import "./styles/main.css"
const Peer = require("./scripts/peer.js")



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main/>);



navigator.mediaDevices.getUserMedia({audio:true, video:true}).then(stream=>{
  Peer.startPeer(stream)
}).catch(e=>{
  alert(e)
})

