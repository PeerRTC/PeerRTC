# PeerRTC
PeerRTC is built on top of modern browser's WebRTC technology and also already handled most of the complicated parts in working with RTC technology. 
PeerRTC is packed with easy to call api for sending raw text, sending raw files, audio streaming, video streaming, connecting to peers via unique id and more.

## Note
This module is still in beta phase and can be unstable. Source code contributions and bug reports are welcome.

## Sample Project
* [Video call and file sharing site]([https://github.com/ShimShim27/PeerRTC](https://github.com/ShimShim27/PeerRTC/tree/master/test/Video%20call%20with%20file%20sharing))

## Setup

1. If you will be using the default PeerRTC backend server provided by us for testing purposes, you can skip this step. For own
managed backend server, refer to [PeerRTC server's](https://github.com/ShimShim27) repository. Server owned by us is unstable and not managed so it is
recommended to host your own.<br/>

2. Add PeerRTC module in your html project's body.
```
  <script  type="text/javascript" src="https://shimshim27.github.io/PeerRTC/peer.js"></script>
```


3. Initialize the PeerRTC class in your main or index javascript file. <br/>
 
  ```
    // using default settings
    
    peer = new PeerRTC()
  ```
    
  ```
    // using custom settings
    
    serverUrl = "https://peer-rtc-sever.herokuapp.com/"

    configurations = {
      "iceServers": [{ "urls" : "stun:stun.l.google.com:19302" }]
    }

    peer = new PeerRTC(serverUrl, configurations)
  ``` 
 
  
4. Connect to the backend server. <br/>
```
  onConnect = p=>{
    // Code after successful connection to the server goes here
    
    myId = p.id 
    
    p.ontextmessage = (m)=>{
      console.log("New message: " + m)
    }

    
    p.onpeerconnectsuccess = peerId =>{
      p.send("Hello there")
      console.log("Successfully connected to " + peerId)
    }
    
    // triggered from incoming connection request
    p.onpeerconnectrequest = (peerId, accept, decline)=>{
      accept()
    }
    
    p.connect("test-another-peer-id")
    
  }

  // true will only work if your server's url is SSL supported.
  isSecure = true

  peer.start(isSecure, onConnect)
```
## Api Reference

