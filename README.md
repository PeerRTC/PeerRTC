# PeerRTC 🌐
PeerRTC is a simple module for easy peer to peer connection. 
PeerRTC is built on top of modern browser's WebRTC technology and also already handled most of the complicated parts in working with RTC technology. 
PeerRTC is packed with easy to call api for sending raw text, sending raw files, audio streaming, video streaming, connecting to peers via unique id and more.

## ❗ Note
* Add credits and attribution to this [repository](https://github.com/ShimShim27/PeerRTC) when using the [module](https://github.com/ShimShim27/PeerRTC/blob/master/peer.js).
* This module is still in beta phase and can be unstable. 
* Source code contributions and bug reports are welcome.

## 📖 Sample Project
* [Video call and file sharing site](https://github.com/ShimShim27/PeerRTC/tree/master/test/Video%20call%20with%20file%20sharing)

## ⚙️ Setup

1. If you will be using the default PeerRTC backend server provided by us for testing purposes, you can skip this step. For own
managed backend server, refer to [PeerRTC server's](https://github.com/ShimShim27) repository. Server owned by us is unstable and not managed so it is
recommended to host your own.<br/>

2. Add PeerRTC module in your html project's body.
```
  <script type="text/javascript" src="https://shimshim27.github.io/PeerRTC/peer.js"></script>
```


3. Initialize the PeerRTC class in your main or index javascript file. <br/>
 
  ```
    peer = new PeerRTC()
  ```
  
4. Connect to the backend server. <br/>
```
  onConnect = p=>{
    // Code after successful connection to the server goes here
    myId = p.id 
    console.log("Successfully connected to the server")
    console.log("My Id: " + myId)
  }

  // true will only work if your server's url is SSL supported.
  isSecure = true
  
  // connect to the server
  peer.start(isSecure, onConnect)
```

## 📚 Api Reference

### PeerRTC `constructor`
```
  peer = new PeerRTC(serverURL, configurations)
```

`serverURL` : `optional` `string` `default=https://peer-rtc-sever.herokuapp.com/` <br/>
* The url in which the backend server is hosted. It is recommended to  use your own rather
than the default server since it is not stable. <br/>

`configurations` : `optional` `json` `default={ "iceServers": [{ "urls" : "stun:stun.l.google.com:19302" }] }` <br/>
* Json data that will be passed to the [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection)
constructor.<br/>

<hr/>

### id `attribute`
```
  peer.id
```
*  Returns a unique id assigned by the server to this client. <br/>

<hr/>

### currentPeerId `attribute`
```
  peer.currentPeerId
```
* Returns the peer id this client is connected with. To connect with other peer, call the `connect` method. <br/>

<hr/>

### serverURL `attribute`
```
  peer.serverURL
```
* Returns the server url. <br/>

<hr/>

### configuration `attribute`
```
  peer.configuration
```
* Returns the configurations set for [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection) constructor. </br>

<hr/>

### isConnectedToServer `attribute`
```
  peer.isConnectedToServer
```
* Returns whether connected to server that runs on the provided server url. </br>

<hr/>

### mediaStream `attribute`
```
  peer.mediaStream
```
* Returns the current media stream added by `addMediaStream` method. <br/>

<hr/>

### onpeerconnectsuccess `listener`
```
peer.onpeerconnectsuccess = peerId=>{ }
```
* Called on successful connection to a peer via `connect` method.  <br/>

`peerId` : `string`
* The peer id of the peer successfully connected to. <br/>

<hr/>

### onpeerids `listener`
```
peer.onpeerids = ids=>{}
```
* Called when `getAllPeerIds` method call is successful.  <br/>

`ids` : `array`
* Returns array of all peer ids connected to the server. Peer ids will only be returned if client ids are set 
to be publicly available in the [server](https://github.com/ShimShim27/PeerRTC-Server). <br/>

<hr/>

### ontextmessage `listener`
```
  peer.ontextmessage = text=>{ }
```
* Called when a new string message is received by the client. This is triggered when the peer client on the other end call the `sendText` method. <br/>

`text` : `string`
* Returns the string message.

<hr/>

### onfilemessage `listener`
```
peer.onfilemessage = (fname, fileTotalSize, fileBytesArray, done)=>{}
```
* Called when a new file is received by the client. <br/>

`fname` : `string`
* The filename of the current file received. <br/>

`fileTotalSize` : `number`
* Total size of the file when completed in bytes. <br/>

`fileBytesArray` : `ArrayBuffer`
* The array of bytes of the currently received parts of a file. <br/>

`done` : `boolean`
* Whether the file is finished downloading or not. <br/>

<hr/>

### onsendfilemessage `listener`
```
  peer.onsendfilemessage = (file, fileSizeSent)=>{}
```
* Triggered while currently uploading file to the connected peer.

`file` : `File`
* The current file sending. <br/>

`fileSizeSent` : `number`
* Current size of the part of the file being sent in bytes. <br/>

<hr/>

### oncloseP2P  `listener`
```
  peer.oncloseP2P = ()=>{}
```
* Triggered when connection to a peer is closed. <br/>

<hr/>

### onclose `listener`
```
  peer.onclose = ()=>{}
```
* Triggered when connection to the server is closed. <br/>

<hr/>

### onnewpayload `listener`
```
peer.onnewpayload = payload=>{}
```
* Triggered when a new payload for the current client is added in the server. To add new payload, call the `addPayload` method. <br/>

`payload` : `json`
* Returns the latest version of payload for this client stored in the server. <br/>

<hr/>

### onnewprivatepayload `listener`
```
  peer.onnewprivatepayload = payload =>{}
```
* Triggered when a new private payload for the current client is added in the server. To add new private payload, call the `addPrivatePayload` method. <br/>

`payload` : `json`
* Returns the latest version of the private payload for this client stored in the server. <br/>

<hr/>

### onpeerpayloads `listener`
```
peer.onpeerpayloads = payloads=> {}
```
* Triggered as a result of calling `getAllPeerPayloads` method. <br/>

`payloads` : `array`
* Array of payloads of all clients connected to the server. Client payloads will only be returned if client ids are set 
to be publicly available in the [config.json](https://github.com/ShimShim27/PeerRTC-Server/blob/main/server/config.json) in the server in the server.  <br/>

<hr/>

### onpeerconnectrequest `listener`
```
  peer.onpeerconnectrequest = (peerId, accept, decline)=>{}
```
* Triggered when there is an incoming connection request from another peer. <br/>

`peerId` : `string`
* The id of the peer attempting to connect. <br/>

`accept` : `function`
* Calling this function wil establish connection to the requesting peer. <br/>

`decline` : `function`
* Calling this function wil decline the connection request of the requesting peer. <br/>

<hr/>

### onpeerconnectdecline `listener`
```
  peer.onpeerconnectdecline = peerId => {}
```
* Triggered when connection request to a peer has been denied. <br/>

`peerId` : `string`
* The peerId that declines the connection request.

<hr/>

### onnewtrack `listener`
```
  peer.onnewtrack = (newTrack, trackStreams) => {}
```
* Triggered when `addMediaStream` method was called by the connected peer. <br/>

`newTrack` : `MediaStreamTrack`
* The newly added track [object](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack). <br/>

`trackStreams` : `MediaStreams`
* The current stream [object](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) the `newTrack` parameter belongs to. <br/>

<hr/>

### onadminbroadcastdata `listener`
```
  peer.onadminbroadcastdata = data =>{}
```
* Triggered by calling the `adminBroadcastData` method. <br/>

`data` : `object`
* The data broadcasted by the admin. <br/>

<hr/>

### onadmingetallclientsdata `listener`
```
  peer.onadmingetallclientsdata = clientsData =>{}
```
* Triggered by calling `adminGetAllClientsData` method.

`clientsData` : `array`
* Array of all clients data stored in the server. <br/>

<hr/>

### onadminactiondecline `listener`
```
  peer.onadminactiondecline = ()=> {}
```
* Triggered when admin related actions are declined by the server due to any reasons. <br/>

<hr/>

### start `method`
```
  peer.start(isSecure, onConnect)
```
* Call this method to initiate connection to the backend server .<br/>

`isSecure` : `boolean` 
* Setting this to true will use secure connection from client to the server. Setting the parameter to true is only applicable in
SSL supported `serverURLs`. <br/>

`onConnect` : `function`
```
onConnect = (peer)=>{}
``` 
* A callback function after a successful connection to the server. The callback returns PeerRTC instance. <br/>

<hr/>

### connect `method`
```
  peer.connect(peerId)
```
* Used for connecting with other peer ids. This method will throw an error if there are still existing connection
with other peers.  <br/>

`peerId` : `string`
* Peer id wanted to connect with. <br/>

<hr/>

### sendText `method`
```
  peer.sendText(text)
```
* For sending string data. This method triggers the `ontextmessage` listener of the connected peer. <br/>

`text` : `string`
* String message to send. <br/>

<hr/>

### sendFile `method`
```
  peer.sendFile(fname, file, chunkSize)
```
* For sending file. This method triggers the `onfilemessage` listener of the connected peer. <br/>

`fname` : `string`
* Desired name for the file, <br/>

`file` : `File`
* The file to be sent. <br/>

`chunkSize` : `number`, default=1024
* Size in bytes on how big is the chunk of the file that will be sent to the other end. <br/>

<hr/>

### addPayload `method`
```
  peer.addPayload(jsonData)
```
* For adding extra data or payload stored on the server associated to the current client. This data are also public and can be accessible to other peers
when client ids are public available in [config.json](https://github.com/ShimShim27/PeerRTC-Server/blob/main/server/config.json) in the server in the server.

`jsonData` : `json` <br/>
* Desired data payload to be store in the server associated to the current client. <br/>

<hr/>

### addPrivatePayload `method`
```
  peer.addPrivatePayload(jsonData)
```
* For adding private extra data or payload stored on the server associated to the current client. <br/>

`jsonData` : `json` <br/>
* Desired private data payload to be store in the server associated to the current client. <br/>

<hr/>

### getAllPeerPayloads `method`
```
peer.getAllPeerPayloads()
```
* For getting all peer payloads. Calling the method successfully will trigger `onpeerpayloads` listener. This method will not work properly if client public ids are not available to anyone in the [config.json](https://github.com/ShimShim27/PeerRTC-Server/blob/main/server/config.json) in the server in the server. <br/>

<hr/>

### getPeerPayload `method`
```
  peer.getPeerPayload(peerId)
```
* Getting public payload of a specific peer.

`peerId` : `string` </br>
* Target peer id.

<hr/>

### closeP2P `method`
```
  peer.closeP2P()
```
* For closing connection with another peer.  </br>

<hr/>

### close `method`
```
  peer.close()
```
* For closing connection with the server.  </br>

<hr/>

### getAllPeerIds `method`
```
  peer.getAllPeerIds()
```
* For fetching all the peer ids from the server.  Calling this method will trigger the `onpeerids` listener. This method will not work properly if client public ids are not available to anyone in the [config.json](https://github.com/ShimShim27/PeerRTC-Server/blob/main/server/config.json) in the server in the server. <br/>

<hr/>

### addMediaStream  `method`
```
  peer.addMediaStream (stream)
```
* This method is used for sending media stream to another connected peer. This method can be used for video and audio call functionality. <br/>

`stream` : `MediaStream` <br/>
* This parameter is the [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) parameter that will be sent to another connected peer. The `onnewtrack` listener for another peer will be triggered by calling
this method. <br/>

<hr/>

### updateBlob `method`
```
  peer.updateBlob(fname, arrayBuffer)
```
* This method can be used in building [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) instance out of array buffer of a chunk of a file.
This method can be helpful when building a chunked file received from `onfilemessage` listener. <br/>

`fname` : `string` <br/>
File name parameter. File name should be unique because it is used as the primary key to identify the stored blobs in a map. <br/>

`arrayBuffer` : `ArrayBuffer` <br/>
The chunked array buffer of a file parameter. Usually `arrayBuffer` can be received from `onfilemessage` listener. <br/>

<hr/>

### getBlob `method`
```
  peer.getBlob(fname)
```
* Getting a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) instance stored in the PeerRTC instance. <br/>

`fname` : `string`
* The unique file name of the blob being fetched. <br/>

<hr/>

### deleteBlob `method`
```
  peer.deleteBlob(fname)
```
* Deleting a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) instance stored in the PeerRTC instance. <br/>

`fname` : `string` <br/>
* The unique file name of the blob to be deleted. <br/>

<hr/>

### getAllBlobFiles `method` `returns array`
```
  peer.getAllBlobFiles()
```
* Returns an array of all stored [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) instance stored in the PeerRTC instance. <br/>

<hr/>

### deleteAllBlobFiles `method`
```
  peer.deleteAllBlobFiles()
```
* Delete all the [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) instance stored in the PeerRTC instance. <br/>

<hr/>

### adminBroadcastData `method`
```
  peer.adminBroadcastData(key, data)
```
* A purposely private api to broadcast data to all clients. Calling this method will trigger `onadminbroadcastdata` of all clients. <br/>

`key` : `string`  <br/>
* A string that match tha sha56 hash in [config.json](https://github.com/ShimShim27/PeerRTC-Server/blob/main/server/config.json) in the server. Wrong key will trigger the `onadminactiondecline` method. <br/>

`data` : `object` <br/>
* The data to be sent on all connected clients. <br/>

<hr/>

### adminGetAllClientsData `method`
```
  peer.adminGetAllClientsData(key)
```
* Method for getting all the clients data stored in the server including the private payloads. Successful call to this method 
will trigger `onadmingetallclientsdata` listener<br/>

`key` : `string`  <br/>
* A string that match tha sha56 hash in [config.json](https://github.com/ShimShim27/PeerRTC-Server/blob/main/server/config.json) in the server. Wrong key will trigger the `onadminactiondecline` method. <br/>

<hr/>
