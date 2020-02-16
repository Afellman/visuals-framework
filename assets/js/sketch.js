let glBackground = [0, 0, 0, 1.0]
let scenes = [];
let goodColor = [];
let maxPal = 512;
let bgShader;
let glCanvas;
let showFPS = true;
var socket = io('http://localhost:3000');
let fft;
let mic;
let textureShader;
let images = [];
let shaders = [];
let videos = [];
let mirror = false;
let ctrlPressed = false;
let save;
let debug = false;

function setBuilder(sketches) {
  return sketches.map((sketch, i) => {
    return { setIndex: i, sketch: sketch };
  });
}

const controlScene = {
  "1": {
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Starry();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "2": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Sun();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "3": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new RopeSwing();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "4": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Proximity();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "5": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Geometry();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "6": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new GoldenSpiral();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "7": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new SineWaves();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "8": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Orbitals();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = normalToColor(val.args[0]);
    }
  },
  "9": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new LinesShader();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = val.args[0];
    }
  },
  "10": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new FlowShader();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = val.args[0];
    }
  },
  "11": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new DisplaceImg();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = val.args[0];
    }
  },
  "12": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Drops();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};

      }
    },
    opacity: function (val) {
      this.scene.opacity = val.args[0];
    }
  },
  "13": {
    isActive: false,
    scene: {},
    toggle: function (val) {
      if (val.args[0]) {
        this.scene = new Feedback();
        loadScene(this.scene);
      } else {
        unloadScene(this.scene.id);
        this.scene = {};
      }
    },
    opacity: function (val) {
      this.scene.opacity = val.args[0];
    }
  }
}

function setImages(imgs) {
  images = imgs;
}

function setShaders(shaderArry) {
  shaders = shaderArry;
}

function setVideos(videoArray) {
  console.log("videos loaded")
  this.videos = videoArray;
}

// ======================================== P5 Functions
// For any preloading of sounds or images.
function preload() {
  loadImages(setImages);
  loadShaders(setShaders);
  // loadVideos(setVideos);
}

// Starting with a canvas the full window size.
function setup() {
  console.log("setup")
  // disableFriendlyErrors = true;
  glCanvas = createCanvas(windowWidth, windowHeight);
  images.forEach((img, i) => takeColor(img, i)) // This is scary...
  loadScene(new BGShader(0)) // For background.

  // For Audio input
  // mic = new p5.AudioIn();
  // mic.getSources((devices) => {
  //   devices.forEach((device, i) => console.log(i, device.label))
  // });
  // mic.start();
  // fft = new p5.FFT(0.8, 512);
  // fft.setInput(mic);

}

function draw() {
  const length = scenes.length;
  // background(glBackground); // Moved to shader.
  for (let i = 0; i < length; i++) {
    if (scenes[i]) {
      push()
      scenes[i].draw();
      pop();
    }
  }
  if (showFPS) {
    push()
    stroke("black")
    fill('white')
    text("FPS:" + frameRate().toFixed(2), 10, 10)
    pop()
  }
}

// ======================================== Other Functions

function setupSockets() {
  socket.on('connect', function () {
    console.log(socket)
    console.log("Socket Connected")
  });

  socket.on('disconnected', function () {
    console.log("Socket Disconnected")
  });

  socket.on("refresh", (val) => {
    if (val) {
      window.location.reload()
    }
  });

  socket.on("debug", (val) => {
    debug = val;
    showFPS = val;
  });

  for (const i in controlScene) {
    socket.on(`/${i}/toggle`, val => controlScene[i].toggle(val))
    socket.on(`/${i}/opacity`, val => controlScene[i].opacity(val))
  }
}

function normalToColor(val) {
  return Math.round(map(val, 0, 1, 0, 255));
}

function loadScene(scene) {
  scene.init();
  scenes.push(scene);
}

function unloadScene(id) {
  let index = -1;
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].id === id) {
      index = i;
      break;
    }
  }
  scenes[index].unload();
  scenes.splice(index, 1);
}

function toggleMirror(vert) {
  if (!mirror) {
    loadScene(new Mirror(vert));
    mirror = true;
  } else {
    let mirrorIndex;
    scenes.forEach((scene, i) => {
      if (scene instanceof Mirror) {
        mirrorIndex = i;
      }
    });
    unloadScene(mirrorIndex);
    mirror = false;
  }
}

function someColor(index) {
  // pick some random good color
  let palette = goodColor[index];
  const color = palette[int(random(palette.length))];
  return [color[0], color[1], color[2]];
}

function getPixel(context, x, y) {
  return context
    .getImageData(x, y, 1, 1)
    .data;
}

function takeColor(img, index) {
  let numPal = 0;
  let canvas = document.getElementById('defaultCanvas0');
  let context = canvas.getContext('2d');
  image(img, 0, 0);
  goodColor[index] = [];
  for (let x = 0; x < img.width; x += 100) {
    for (let y = 0; y < img.height; y += 100) {
      let c = getPixel(context, x, y);
      let exists = false;
      for (let n = 0; n < numPal; n++) {
        if (c == goodColor[index][n]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        // add color to pal
        if (numPal < maxPal) {
          goodColor[index][numPal] = c;
          numPal++;
        } else {
          break;
        }
      }
    }
  }
}

// ======================================== Dom Listeners
function windowResized() { // p5
  resizeCanvas(windowWidth, windowHeight);
}

// Sending the mouseClicked event to the sketches[currentSketch].
function mouseClicked() {
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) {
      scenes[i].mouseClicked();
    }
  };
};

function keyPressed(e) {
  const key = e.key;
  if (key == "d") {
    unloadScene(0);
  }

  if (key == "f") {
    if (document.getElementById("controls").style.display == "none") {
      document.getElementById("controls").style.display = "block";
    } else {
      document.getElementById("controls").style.display = "none";
    }
  }

  if (key == "b") {
    if (glBackground[3] == 0) {
      glBackground[3] = 100
    } else {
      glBackground[3] = 0
    }
  }
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) {
      scenes[i].keyPressed(e);
    }
  };

  if (key == "Control") {
    ctrlPressed = true;
  }
  if (ctrlPressed && key == "s") {
    scenes.forEach(scene => {
      save = JSON.stringify(scene.save());
    });
    ctrlPressed = false;
  }

  if (ctrlPressed && key == "i") {
    let wasFpsOn = showFPS;
    showFPS = false;
    saveCanvas(glCanvas, "./canvas" + Date.now(), "png")
    if (wasFpsOn) showFPS = true;
  }
};

// ================================================  
//                     Midi 
// ================================================  
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = onMidiMessage;
  }
}

function onMIDIFailure() {
  console.log('Could not access your MIDI devices.');
}

// const genericMidi = {
//   "1": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 180) {
//         glBackground[3] = map(vel, 0, 127, 0, 1);
//       }
//     }
//   },
//   "2": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           unloadScene(this.scene.id);
//           this.isActive = false;
//           this.scene = {};
//         } else {
//           this.scene = new Mirror(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         this.scene.opacity = midiToNormal(vel);
//       }
//     }
//   },
//   "3": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           // unloadScene(this.scene.id);
//           this.scene = {};
//           this.isActive = false;
//         } else {
//           // this.scene = new Mirror(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         genericMidi[5].scene.params.faders.yOff = midiToNormal(vel) / 10;
//       }
//     }
//   },
//   "4": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           // unloadScene(this.scene.id);
//           this.scene = {};
//           this.isActive = false;
//         } else {
//           // this.scene = new Mirror(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         genericMidi[5].scene.params.faders.xOff = midiToNormal(vel) / 10;
//       }
//     },
//   },
//   "5": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           unloadScene(this.scene.id);
//           this.scene = {};
//           this.isActive = false;
//         } else {
//           this.scene = new LinesShader(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         genericMidi[5].scene.params.faders.freq = midiToNormal(vel) / 10;
//       }
//     }
//   },
//   "6": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           // unloadScene(this.scene.id);
//           this.scene = {};
//           this.isActive = false;
//         } else {
//           // this.scene = new Mirror(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         genericMidi[5].scene.params.faders.amp = midiToNormal(vel) / 10;
//       }
//     },
//   },
//   "7": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           // unloadScene(this.scene.id);
//           this.scene = {};
//           this.isActive = false;
//         } else {
//           // this.scene = new Mirror(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         genericMidi[5].scene.params.faders.noise = midiToNormal(vel) / 10;
//       }
//     },
//   },
//   "8": {
//     scene: {},
//     method: function (vel, cmd) {
//       if (cmd == 148) {  // 148 == Pad
//         if (this.isActive) {
//           // unloadScene(this.scene.id);
//           this.scene = {};
//           this.isActive = false;
//         } else {
//           // this.scene = new Mirror(true);
//           loadScene(this.scene);
//           this.isActive = true;
//         }
//       } else if (cmd == 180) {
//         genericMidi[5].scene.params.faders.speed = midiToNormal(vel) / 10;
//       }
//     },
//   }
// }

function onMidiMessage(midiMessage) {
  let command = midiMessage.data[0];
  let note = midiMessage.data[1];
  let velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;
  if (debug) console.log(note, velocity, command)

  // // Fader Fox
  // if (command == 179) {
  //   if (note >= 0 && note <= 47) {
  //     midi179[note].velocity += velocity - 64; // On Relative mode, always plus or minus 64.
  //   } else {
  //     midi179[note].velocity = velocity;
  //   }
  //   midi179[note].method(midi179[note].velocity);
  //   if (debug) console.log("Midi - Note: " + note + " | Velocity:" + midi179[note].velocity)

  // } else if (command == 180) {
  //   if (note >= 0 && note <= 47) {
  //     midi180[note].velocity += velocity - 64; // On Relative mode, always plus or minus 64.
  //   } else {
  //     midi180[note].velocity = velocity;
  //   }
  //   midi180[note].method(midi180[note].velocity);
  //   if (debug) console.log("Midi - Note: " + note + " | Velocity:" + midi180[note].velocity)

  // } else {
  if (command == 144 || command == 176) { // button press and knob.
    midiAkai[note].velocity = velocity;
    midiAkai[note].method(velocity);
  }
  // }
}

function midiToColor(vel) {
  return Math.round(map(vel, 0, 127, 0, 255));
}

function midiToNormal(vel) {
  return map(vel, 0, 127, 0, 1);
}

// ================================================  
//       Global midi bindings
// ================================================  

let midi179 = (function () { // Map of midi notes and attached methods with command 179.
  let ret = [];
  for (let i = 0; i < 96; i++) {
    ret.push({ method: () => { }, velocity: 0 }); // Method to call on incoming note.
  }
  return ret;
})();

let midi180 = (function () { // Map of midi notes and attached methods with command 180.
  let ret = [];
  for (let i = 0; i < 96; i++) {
    ret.push({ method: () => { }, velocity: 0 }); // Method to call on incoming note.
  }
  return ret;
})();

let midiAkai = (function () {
  let ret = [];
  for (let i = 0; i < 31; i++) {
    ret.push({ method: () => { }, velocity: 0 }); // Method to call on incoming note.
  }
  return ret;
})();

const currentSet = setBuilder([Proximity, Sun, FlowShader, DisplaceImg, WindShield, Gridz, Tares, FlowField]); // Where do I define the set list? Max 10.

class Launcher {
  constructor(classConstructor, setIndex) {
    this.scene = {};
    this.isActive = false;
    this.classConstructor = classConstructor;
    this.setIndex = setIndex;
  }

  toggle() {
    if (!this.isActive) {
      this.scene = new this.classConstructor();
      this.scene.setIndex = this.setIndex;
      this.scene.id = Math.random() * 9999999;
      loadScene(this.scene);
      this.isActive = true;
      midi180[32].velocity = 0;
    } else {
      unloadScene(this.scene.id);
      this.scene = {};
      this.isActive = false;
    }
  }

  opacity(velocity) {
    this.scene.opacity = midiToColor(velocity);
  }
}

function bindLaunchers() {
  const launchers = currentSet.map(setScene => {
    return new Launcher(setScene.sketch, setScene.setIndex);
  });
  launchers.forEach((launcher, i) => {
    // For Faderfox
    // midi180[i + 32].method = launcher.opacity.bind(launcher);
    // midi180[i + 80].method = launcher.toggle.bind(launcher);
    midiAkai[i].method = launcher.toggle.bind(launcher);
    midiAkai[i + 8].method = launcher.opacity.bind(launcher);
  });
}

function bindMiscGlobal() {
  // Encoder 11
  midi180[42].method = (vel) => { glBackground[3] = midiToNormal(vel) };
  midi180[90].method = (vel) => { glBackground[3] = midiToNormal(vel) };
  midi180[42].velocity = 100;
  midi180[90].velocity = 127;
}

bindLaunchers();
bindMiscGlobal();

// ================================================  
//       Global OSC bindings
// ================================================ 

const mirrorLauncher = new Launcher(Mirror, -1);
const linesLauncher = new Launcher(LinesShader, -2);

function bindGlobalSockets() {

  const linesMethod = linesLauncher.toggle.bind(linesLauncher)

  const mirrorMethod = mirrorLauncher.toggle.bind(mirrorLauncher);
  const mirrorOpacity = mirrorLauncher.opacity.bind(mirrorLauncher);

  socket.on("/-2/on", () => {
    linesMethod();
  });

  socket.on("/-1/mirrorOn", (val) => {
    mirrorMethod();
  });

  socket.on("/-1/mirrorOpacity", (val) => {
    mirrorOpacity(map(val.args[0], 0, 1, 0, 127));
  });

  socket.on("/-1/glOpacity", (val) => {
    glBackground[3] = val.args[0];
  });

  socket.on("/-1/videoOpacity", (val) => {
    const video = document.getElementById("fireVideo");
    video.style.opacity = val.args[0];
  });

  socket.on("/-1/videoOn", (val) => {
    const video = document.getElementById("fireVideo");
    video.remove();
  });

  socket.on("/-1/videoPlay", (val) => {
    const video = document.getElementById("fireVideo");
    if (val.args[0]) {
      video.play();
    } else {
      video.pause();
    }
  });

  socket.emit("updateOsc", { scene: "-1", oscObj: "videoPlay", value: "0" })
  socket.emit("updateOsc", { scene: "-1", oscObj: "videoOn", value: "0" })
  socket.emit("updateOsc", { scene: "-1", oscObj: "videoOpacity", value: "1" })
}

bindGlobalSockets();
// ========================================= Async Loaders

function loadImages(cb) {
  Promise.all([
    loadImage("./assets/images/peter.jpg"),
    loadImage("./assets/images/leaves.jpg"),
    loadImage("./assets/images/austrailia/adam-ferguson-australia-fires-climate-change-1.jpg"),
    loadImage("./assets/images/ameen-fahmy-water.jpg"),
    loadImage("./assets/images/jason-leung-water.jpg"),
    loadImage("./assets/images/v2osk-sunset.jpg"),
    loadImage("./assets/images/colorImg1.jpg"),
  ])
    .then(res => cb(res))
    .catch(res => new Error(res));
}

function loadShaders(cb) {
  Promise.all([
    loadShader("./shaders/texture.vert", "./shaders/shader.frag"),
    loadShader("./shaders/texture.vert", "./shaders/movingLines.frag"),
    loadShader("./shaders/texture.vert", "./shaders/shader.frag"),
    loadShader("./shaders/texture.vert", "./shaders/meltingWaterfalls.frag"),
    loadShader("./shaders/texture.vert", "./shaders/trippy.frag"),
    loadShader("./shaders/texture.vert", "./shaders/trippytwo.frag"),
    loadShader("./shaders/texture.vert", "./shaders/videoShader.frag"),
    loadShader("./shaders/texture.vert", "./shaders/mirror.frag"),
    loadShader("./shaders/texture.vert", "./shaders/tares.frag"),
    loadShader("./shaders/texture.vert", "./shaders/flowField.frag"),
  ])
    .then(res => cb(res))
    .catch(res => new Error(res));
}

function loadVideos(cb) {
  let count = 0;
  function isDone() {
    count++;
    if (count == 3) {
      cb();
    }
  }
  videos = [
    createVideo(["./assets/videos/aussie1.mp4"], isDone),
    createVideo(["./assets/videos/aussie2.mp4"], isDone),
    createVideo(["./assets/videos/aussie3.mp4"], isDone),
  ];

  videos.forEach(video => video.hide())
}

setupSockets();