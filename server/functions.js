module.exports = {
	clientConnect : clientConnect,
}

function clientConnect(req, res, clients){
	var id = req["id"]
	while(clients.includes(id) || id== undefined || id == null){
		id = uuidv4()
	}
	
	res.send(id)
	return id
}



function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
  });
}