let glBackground = [0, 0, 0, 1.0]
let scenes = [];
let goodColor = [];
let maxPal = 512;
let bgShader;
let glCanvas;
let showFPS = false;
var socket = io('http://localhost:3000');
let fft;
let mic;
let textureShader;
let images = [];
let shaders = [];
let mirror = false;
let ctrlPressed = false;
let save;
const midiSubscribers = {
}

setupSockets();

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
}

function loadScene(scene) {
  const id = Math.random() * 100000;
  scene.id = id
  scene.init();
  scenes.push(scene);
}

function unloadScene(id) {
  // let scene = scenes[0];
  // scene.unload();
  let index = -1;
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].id === id) {
      index = i;
      break;
    }
  }
  scenes.splice(index, 1);
}

const controlScene = {
  "1": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new Starry();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "2": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new Sun();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "3": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new SineWaves();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "4": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new Connecter();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "5": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new SpinningCircles();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToNormal(vel);
      }
    }
  },
  "6": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new TreeFractal();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "7": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new GoldenSpiral();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "8": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new Rain();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  },
  "9": {
    isActive: false,
    scene: {},
    method: function (vel, cmd) {
      if (cmd == 148) {  // 148 == Pad
        if (this.isActive) {
          unloadScene(this.scene.id);
          this.isActive = false;
        } else {
          this.scene = new LinesShader();
          loadScene(this.scene);
          this.isActive = true;
        }
      } else {
        this.scene.opacity = midiToColor(vel);
      }
    }
  }
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
  console.log(note, velocity, command)
  if (command !== 132) {

    if (note < 17) {

      controlScene[note].method(velocity, command);
    } else {
      genericMidi[note].method(velocity, command);
    }
    // if (midiSubscribers[note]) {
    //   midiSubscribers[note].forEach(sub => sub(velocity, command));
    // }
    // if (note == 40 && command == 148) {
    //   toggleMirror(true);
    // }
    // if (note == 41 && command == 148) {
    //   toggleMirror();
    // }
  }
}

const genericMidi = {
  "17": {
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
      } else {
        this.scene.opacity = midiToNormal(vel);
      }
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
    loadImage("./assets/images/waterfall.jpg")
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

