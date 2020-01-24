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
let mirror = false;
let ctrlPressed = false;
let save;
let debug = false;
const midiSubscribers = {
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

// ======================================== P5 Functions
// For any preloading of sounds or images.
function preload() {
  loadImages(setImages);
  loadShaders(setShaders);
}

// Starting with a canvas the full window size.
function setup() {
  console.log("setup")
  // disableFriendlyErrors = true;
  glCanvas = createCanvas(windowWidth, windowHeight);
  images.forEach((img, i) => takeColor(img, i))
  loadScene(new BGShader()) // For background.
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
    if (scenes[i])
      push()
    scenes[i].draw();
    pop();
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
  const id = Math.random() * 100000;
  scene.id = id
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
  socket.emit("sceneOff", scenes[index].sceneNum);
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

// ======================================== Midi
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = getMIDIMessage;
  }
}

function getMIDIMessage(midiMessage) {
  let command = midiMessage.data[0];
  let note = midiMessage.data[1];
  let velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;
  if (debug) console.log(note, velocity, command)
  if (command !== 132) {
    genericMidi[note].method(velocity, command);
  }
}

const genericMidi = {
  "1": {
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new Mirror();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else if (cmd == 132) {
        this.scene.opacity = midiToNormal(vel);
      } else if (cmd == 180) {
        glBackground[3] = map(vel, 0, 127, 0, 1);
      }
    }
  },
  "2": {
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new Mirror(true);
          loadScene(this.scene);
          this.isActive = true;
        }
      }
      // } else if (cmd == 132) {
      //   this.scene.opacity = midiToNormal(vel);
      // } else if (cmd == 180) {
      //   glBackground[3] = map(vel, 0, 127, 0, 1);
      // }
    }
  }
}

function onMIDIFailure() {
  console.log('Could not access your MIDI devices.');
}

function midiToColor(vel) {
  return Math.round(map(vel, 0, 127, 0, 255));
}

function midiToNormal(vel) {
  return map(vel, 0, 127, 0, 1);
}
// ========================================= Async Loaders

function loadImages(resolve, reject) {
  Promise.all([
    loadImage("./assets/images/peter.jpg"),
    loadImage("./assets/images/peter2.jpg"),
    loadImage("./assets/images/leaves.jpg"),
    loadImage("./assets/images/waterfall.jpg"),
    loadImage("./assets/images/alec/img014.jpg"),
    loadImage("./assets/images/austrailia/adam-ferguson-australia-fires-climate-change-1.jpg"),
    loadImage("./assets/images/colorImg1.jpg"),
    loadImage("./assets/images/universe.jpg"),

  ])
    .then(res => resolve(res))
    .catch(res => new Error(res));
}

function loadShaders(resolve, reject) {
  Promise.all([
    loadShader(
      "./shaders/texture.vert",
      "./shaders/shader.frag"),
    loadShader(
      "./shaders/texture.vert",
      "./shaders/movingLines.frag"),

    loadShader("./shaders/texture.vert", "./shaders/shader.frag"),
    loadShader("./shaders/texture.vert", "./shaders/meltingWaterfalls.frag"),
    loadShader("./shaders/texture.vert", "./shaders/trippy.frag"),
    loadShader("./shaders/texture.vert", "./shaders/trippytwo.frag"),
  ])
    .then(res => resolve(res))
    .catch(res => new Error(res));
}



setupSockets();
