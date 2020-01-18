const express = require('express');
const path = require('path');
const osc = require("osc");
const simpleGit = require("simple-git")("./");
const fs = require('fs');
const port = 3000;
const app = express();
const remoteIP = "192.168.1.234";
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let updateInterval = Date.now();
let udpPort;
let glClient;


app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
});

setupUDP();
setupSocket();

if (!process.argv[2]) {
  setupWatcher();
}


function setupUDP() {
  /****************
   * OSC Over UDP *
   ****************/
  udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 12345,
  });

  udpPort.on("ready", function () {
    let ipAddresses = getIPAddresses();
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

  function getIPAddresses() {
    let os = require("os"),
      interfaces = os.networkInterfaces(),
      ipAddresses = [];

    for (let deviceName in interfaces) {
      let addresses = interfaces[deviceName];
      for (let i = 0; i < addresses.length; i++) {
        let addressInfo = addresses[i];
        if (addressInfo.family === "IPv4" && !addressInfo.internal) {
          ipAddresses.push(addressInfo.address);
        }
      }
    }
    return ipAddresses;
  };
}

function setupSocket() {
  io.on('connection', client => {
    glClient = client
    console.log('Web socket connected')
    client.on('disconnect', () => { /* … */ });
    // On socket message, send OSC message to device
    registerIncoming();
  });
  server.listen(port, () => {
    console.log("Server listening on port: " + port);
  });
}

function registerIncoming() {
  glClient.on("sceneOff", (val) => {
    udpPort.send({ address: `/${val}/led`, args: [{ type: "f", value: 0 }] }, remoteIP, 9000)
  });

  glClient.on("updateOsc", (val) => {
    for (let i in val.params) {
      udpPort.send({ address: `/${val.scene}/${i}`, args: [{ type: "f", value: val.params[i] }] }, remoteIP, 9000)
    }
    udpPort.send({ address: `/${val.scene}/led`, args: [{ type: "f", value: 1 }] }, remoteIP, 9000)

  });
}

function setupWatcher() {
  fs.watch("./", { recursive: true }, (e, name) => {
    if (
      name.indexOf('.git') == -1
      && name.indexOf("node_modules") == -1
      && Date.now() - updateInterval > 15000
    ) {
      try {
        console.log(Date.now() - updateInterval);
        updateInterval = Date.now();
        console.log(name + " changed");
        pushToGit(name);
        glClient.emit("refresh", true);
      } catch (err) {
        console.log(err);
      }
    }
  });
}

function pushToGit(file) {
  try {
    simpleGit.add(file, (err) => {
      simpleGit.commit("save", (res) => {
        simpleGit.push("origin", "master", () => {
          console.log(file + " pushed");
        })
      })
    })
  } catch (err) {
    console.log("Git ERROR", err);
  }
}


// Dont thing I need this, but jsut in case.
/*******************
 * OSC Over Serial *
 *******************/

// // Instantiate a new OSC Serial Port.
// let serialPort = new osc.SerialPort({
//   devicePath: process.argv[2] || "/dev/tty.usbmodem221361"
// });

// serialPort.on("message", function (oscMessage) {
//   console.log(oscMessage);
// });

// // Open the port.
// serialPort.open();

