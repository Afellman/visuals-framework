let glBackground = [0, 0, 0, 1.0];
let scenes = [];
let goodColor = [];
let maxPal = 512;
let bgShader;
let glCanvas;
let showFPS = true;
var socket = io("http://localhost:3000");
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
let glEasing = 0.05;
let glRotate = 0;

const currentSet = setBuilder([
  Proximity,
  WarpGrid,
  FlowShader,
  DisplaceImg,
  WindShield,
  Gridz,
  Tares,
  FlowField,
  Sun,
  Drops,
]); // Where do I define the set list? Max 10.

// ======================================== P5 Functions
// For any preloading of sounds or images.
function preload() {
  loadImages(setImages);
  loadShaders(setShaders);
  // loadVideos(setVideos);
}

// Starting with a canvas the full window size.
function setup() {
  console.log("setup");
  // disableFriendlyErrors = true;
  glCanvas = createCanvas(windowWidth, windowHeight);
  images.forEach((img, i) => takeColor(img, i)); // This is scary...
  const bg = new BGShader(0);
  bg.id = Math.random() * 9999999;
  loadScene(bg); // For background.

  // For audio setup.
  mic = new p5.AudioIn();
  mic.getSources((devices) => {
    devices.forEach((device, i) => console.log(i, device.label));
    console.log(devices);
  });
  mic.start();
  fft = new p5.FFT(0.8, 512);
  fft.setInput(mic);
}

function draw() {
  const length = scenes.length;
  for (let i = 0; i < length; i++) {
    if (scenes[i]) {
      // translate(width / 2, height / 2);
      // rotate(glRotate);
      // translate(-width / 2, - height / 2);

      // Crosshair for centering.
      // stroke(255)
      // line(width / 2 - 500, height / 2, width / 2 + 500, height / 2)
      // line(width / 2, height / 2 - 500, width / 2, height / 2 + 500)

      push();
      scenes[i].draw();
      scenes[i].easeParams();
      pop();
    }
  }
  if (showFPS) {
    push();
    stroke("black");
    fill("white");
    text("FPS:" + frameRate().toFixed(2), 10, 10);
    pop();
  }
}

// ======================================== Other Functions

function setupSockets() {
  socket.on("connect", function () {
    console.log(socket);
    console.log("Socket Connected");
  });

  socket.on("disconnected", function () {
    console.log("Socket Disconnected");
  });

  socket.on("refresh", (val) => {
    if (val) {
      window.location.reload();
    }
  });

  socket.on("debug", (val) => {
    debug = val;
    showFPS = val;
    if (val) {
      bindLiveCoding();
    }
  });
}

function normalToColor(val) {
  return Math.round(map(val, 0, 1, 0, 255));
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
  return context.getImageData(x, y, 1, 1).data;
}

function takeColor(img, index) {
  let numPal = 0;
  let canvas = document.getElementById("defaultCanvas0");
  let context = canvas.getContext("2d");
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
function windowResized() {
  // p5
  resizeCanvas(windowWidth, windowHeight);
}

// Sending the mouseClicked event to the sketches[currentSketch].
function mouseClicked() {
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) {
      scenes[i].mouseClicked();
    }
  }
}

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
      glBackground[3] = 100;
    } else {
      glBackground[3] = 0;
    }
  }
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) {
      scenes[i].keyPressed(e);
    }
  }

  if (key == "Control") {
    ctrlPressed = true;
  }
  if (ctrlPressed && key == "s") {
    scenes.forEach((scene) => {
      save = JSON.stringify(scene.save());
    });
    ctrlPressed = false;
  }

  if (ctrlPressed && key == "i") {
    let wasFpsOn = showFPS;
    showFPS = false;
    setTimeout(() => {
      saveCanvas(glCanvas, "./canvas" + Date.now(), "png");
    }, 500);
    if (wasFpsOn) showFPS = true;
  }
}

// ================================================
//                     Midi
// ================================================
navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
  console.log(midiAccess);
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = onMidiMessage;
  }
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
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
  let velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 0;
  if (debug) console.log(note, velocity, command);

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

  //AKAI
  if (command == 144 || command == 176 || command === 180 || command === 148) {
    // button press and knob.
    midiAkai[note].velocity = midiToColor(velocity);
    midiAkai[note].method({ args: [velocity] });
  }
  // }
  //Beat Step
  // if (note < 15) { // Recall 1, launchers
  //   if (command == 144) { // Button on
  //     launchers[note].on();
  //   } else if (command == 128) { // Button off
  //     launchers[note].off();
  //   } else { // Encoder
  //     // if (velocity < 64) change = -1;
  //     launchers[note].velocity = velocity;
  //     launchers[note].opacity(velocity);
  //   }
  // } else if (note == 127) { // Recall 1, Master knob
  //   let change = velocity - 64;
  //   // if (velocity < 64) change = -1;
  //   if (midiBeatStep[note] + change <= 127 && midiBeatStep[note] + change >= 0) {
  //     midiBeatStep[note] += change;
  //     glBackground[3] = midiToNormal(midiBeatStep[note]);
  //   }

  // } else { // Recall > 1
  //   if (command == 160) { // Button
  //     midiBeatStep[note][0].method(velocity);
  //   } else if (command == 176) { // Encoder
  //     midiBeatStep[note][1].velocity = velocity - 64;
  //     midiBeatStep[note][1].method(midiBeatStep[note][1].velocity);
  //   }
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

// let midiBeatStep = (function () {
//   let ret = [];
//   for (let i = 0; i < 128; i++) {
//     ret.push([{ method: () => { }, velocity: 0 }, { method: () => { }, velocity: 0 }]); // Method to call on incoming note.
//   }
//   return ret;
// })();

// midiBeatStep[127] = 127; // For big knob

let midiAkai = (function () {
  let ret = [];
  for (let i = 0; i < 63; i++) {
    ret.push({ method: () => {}, velocity: 0 }); // Method to call on incoming note.
  }
  return ret;
})();

class Launcher {
  constructor(classConstructor, setIndex) {
    this.scene = {};
    this.classConstructor = classConstructor;
    this.setIndex = setIndex;
    this.isActive = false;
  }

  toggle(val) {
    if (!this.isActive) {
      this.isActive = true;
      this.scene = new this.classConstructor();
      this.scene.setIndex = this.setIndex;
      this.scene.id = Math.random() * 9999999;
      loadScene(this.scene);
    } else {
      unloadScene(this.scene.id);
      this.scene = {};
      this.isActive = false;
    }
  }

  opacity(velocity) {
    let value;
    if (typeof velocity === "number") {
      // From Midi
      value = velocity;
    } else {
      value = velocity.args[0];
    }
    this.scene.opacity = value;

    socket.emit("updateOsc", {
      scene: this.setIndex,
      oscObj: "opacity",
      value: value,
    });
  }
}

function bindLaunchers() {
  const launchers = currentSet.map((setScene) => {
    return new Launcher(setScene.sketch, setScene.setIndex);
  });
  launchers.forEach((launcher, i) => {
    // For Faderfox
    // midi180[i + 32].method = launcher.opacity.bind(launcher);
    // midi180[i + 80].method = launcher.toggle.bind(launcher);

    // midiAkai[i].method = launcher.toggle.bind(launcher);
    // midiAkai[i + 8].method = launcher.opacity.bind(launcher);

    socket.on(`/${launcher.setIndex}/opacity`, launcher.opacity.bind(launcher));
    socket.on(`/${launcher.setIndex}/on`, launcher.toggle.bind(launcher));
  });
}

bindLaunchers();

function bindGlobalMidi() {
  const mirrorLauncher = new Launcher(Mirror, -1);
  midiAkai[0].method = mirrorLauncher.toggle.bind(mirrorLauncher);
  midiAkai[8].method = ({ args }) => {
    mirrorLauncher.opacity(midiToColor(args[0]));
  };
  midiAkai[9].method = ({ args }) => {
    glBackground[3] = midiToNormal(args[0]);
  };
  midiAkai[3].method = () => {
    if (glEasing !== 1) {
      glEasing = 1;
    } else {
      glEasing = 0.05;
    }
  };
  midiAkai[11].method = ({ args }) => {
    glEasing = map(args[0], 0, 127, 0.05, 0.5);
  };

  // Using just the LPD8 ===================================================================
  // let sceneToAdd = {};
  // let selectedScene = {};
  // const assignToPadHOF =
  //   (multiplier) =>
  //   ({ args }) => {
  //     console.log(multiplier);
  //     // Key down
  //     for (let i = 0; i < 14; i++) {
  //       // 1 for bgShader always in scenes
  //       midiAkai[multiplier * i].method = selectedScene.params[i];
  //       console.log(selectedScene, i + scenes.length - 1);
  //     }
  //   };
  // midiAkai[62].method = ({ args }) => {
  //   // Selecting
  //   const num = Math.floor(args[0] / 3.75);
  //   const scene = sceneMapArray[num];
  //   if (scene) {
  //     if (scene.name !== sceneToAdd.name) {
  //       console.log("Scene to add: ", scene.name);
  //       sceneToAdd = scene;
  //     }
  //   }
  // };
  // midiAkai[15].method = ({ args }) => {
  //   const num = Math.floor(args[0] / 3.75);
  //   const _selectedScene = scenes[num];
  //   if (_selectedScene !== selectedScene) {
  //     selectedScene = _selectedScene;
  //     console.log("Selected Scene: ", _selectedScene);
  //   }
  // };
  // midiAkai[52].method = assignToPadHOF(1);
  // midiAkai[53].method = assignToPadHOF(2);
  // midiAkai[54].method = assignToPadHOF(3);
  // midiAkai[55].method = ({ args }) => {
  //   const scene = new sceneToAdd();
  //   loadScene(scene);
  // };
  // Using just the LPD8 ===================================================================
}

bindGlobalMidi();

// ================================================
//       Global OSC bindings
// ================================================

function bindGlobalSockets() {
  const linesLauncher = new Launcher(LinesShader, -2);
  const linesMethod = linesLauncher.toggle.bind(linesLauncher);

  socket.on("/-2/on", (val) => {
    linesMethod(val);
  });
}

bindGlobalSockets();

// ================================================
//               Intial setups
// ================================================

/**
 * Calls scene init and pushes to scenes array
 * @param {Sketch} scene
 * @returns
 */
function loadScene(scene) {
  scene.init();
  scenes.push(scene);
  console.log("Scene Loaded: ");
  console.log(scene);
  return scene;
}

function unloadScene(id) {
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].id === id) {
      scenes[i].unload();
      scenes.splice(i, 1);
      break;
    }
  }
}

function setBuilder(sketches) {
  return sketches.map((sketch, i) => {
    return { setIndex: i, sketch: sketch };
  });
}

function setImages(imgs) {
  images = imgs;
}

function setShaders(shaderArry) {
  shaders = shaderArry;
}

function setVideos(videoArray) {
  console.log("videos loaded");
  this.videos = videoArray;
}
// ========================================= Async Loaders

function loadImages(cb) {
  Promise.all([
    loadImage("./assets/images/peter.jpg"),
    loadImage("./assets/images/leaves.jpg"),
    loadImage(
      "./assets/images/austrailia/adam-ferguson-australia-fires-climate-change-1.jpg"
    ),
    loadImage("./assets/images/ameen-fahmy-water.jpg"),
    loadImage("./assets/images/jason-leung-water.jpg"),
    loadImage("./assets/images/v2osk-sunset.jpg"),
    loadImage("./assets/images/colorImg1.jpg"),
    loadImage("./assets/images/brian-suh.jpg"),
    loadImage("./assets/images/melanie-magdalena.jpg"),
    loadImage("./assets/images/zoltan-tasi.jpg"),
    loadImage("./assets/images/damon-rice.jpg"),
    loadImage("./assets/images/jamie-street.jpg"),
  ])
    .then((res) => cb(res))
    .catch((res) => new Error(res));
}

function loadShaders(cb) {
  Promise.all([
    loadShader("./shaders/texture.vert", "./shaders/shader.frag"),
    loadShader("./shaders/texture.vert", "./shaders/movingLines.frag"),
    loadShader("./shaders/texture.vert", "./shaders/trippytwo.frag"),
    loadShader("./shaders/texture.vert", "./shaders/displaceImg.frag"),
    loadShader("./shaders/texture.vert", "./shaders/mirror.frag"),
    loadShader("./shaders/texture.vert", "./shaders/tares.frag"),
    loadShader("./shaders/texture.vert", "./shaders/warpGrid.frag"),
    loadShader("./shaders/texture.vert", "./shaders/jrew.frag"),
  ])
    .then((res) => cb(res))
    .catch((res) => new Error(res));
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

  videos.forEach((video) => video.hide());
}

setupSockets();

// ================================================
//               Live Coding methods
// ================================================

function bindLiveCoding() {
  window.displaceCanvas = function () {
    const scene = this.loadScene(new DisplaceImg());
    scene.opacity = 255;
  };
  window.glOpac = function (value) {
    if (value > 1) {
      value = map(value, 0, 255, 0, 1);
    }
    glBackground[3] = value;
  };
}

// TEST GROUND.
