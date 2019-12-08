var express = require('express');
var path = require('path');
var app = express();
var port = 3001;
var osc = require("osc");
const server = require('http').createServer(app);
const remoteIP = "192.168.1.16";
const io = require('socket.io')(server);
let glClient;


app.use(express.static(__dirname + '/'))
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
});


/*******************
 * OSC Over Serial *
 *******************/

// Instantiate a new OSC Serial Port.
var serialPort = new osc.SerialPort({
  devicePath: process.argv[2] || "/dev/tty.usbmodem221361"
});

serialPort.on("message", function (oscMessage) {
  console.log(oscMessage);
});

// Open the port.
serialPort.open();


/****************
 * OSC Over UDP *
 ****************/

var getIPAddresses = function () {
  var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

  for (var deviceName in interfaces) {
    var addresses = interfaces[deviceName];
    for (var i = 0; i < addresses.length; i++) {
      var addressInfo = addresses[i];
      if (addressInfo.family === "IPv4" && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }
  return ipAddresses;
};

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 12345,
});



udpPort.on("ready", function () {
  var ipAddresses = getIPAddresses();
  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
    console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });
  // Sends new OSC message to device
  // udpPort.send({ address: '/1/speed', args: [{ type: "f", value: 0.00 }] }, remoteIP, 9000)
});

udpPort.on("message", function (oscMessage) {
  console.log(oscMessage);
  // Relay OSC message to client via websocket
  glClient.emit(oscMessage.address, oscMessage);
});

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();



io.on('connection', client => {
  glClient = client
  console.log('Web socket connected')
  client.on('disconnect', () => { /* … */ });
  // On socket message, send OSC message to device
  // glClient.on("rowChange", (val) => {
  //   udpPort.send({ address: '/1/rowAmtLabel', args: [{ type: "f", value: val }] }, remoteIP, 9000)
  // });
});
server.listen(port, () => {
  console.log("Server listening on port: " + port);
});
