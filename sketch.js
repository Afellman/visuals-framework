let glBackground = [0, 0, 0, 0.5]
let scenes = [];
let goodColor = [];
let maxPal = 512;
let numPal = 0;
let theShader;
let glCanvas;
let showFPS = true;
var socket = io('http://localhost:3000');

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

attachSceneListeners();

/*************************************************
 * P5 Functions
 *************************************************/
// For any preloading of sounds or images.
function preload() {
  theShader = loadShader("./shader.vert", "./shader.frag");
};

// Starting with a canvas the full window size.
function setup() {
  disableFriendlyErrors = true;
  glCanvas = createCanvas(windowWidth, windowHeight);
  //createCanvas(innerWidth, innerHeight, WEBGL);
  loadImage("https://images.unsplash.com/photo-1459478309853-2c33a60058e7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80", (img) => {
    takeColor(img);
    // loadScene(new Sun());
    loadScene(new Shader101())
    loadScene(new SineWave(someColor()));
  });
};

function draw() {
  const length = scenes.length;
  // background(glBackground); // Moved to shader.
  for (let i = 0; i < length; i++) {
    if (scenes[i])
      push()
      scenes[i].draw();
      pop();
  }
  if(showFPS){
    push()
    stroke("black")
    fill('white')
    text("FPS:" + frameRate().toFixed(2), 10, 10)
    pop()
  }
};

/*************************************************
 * Other Functions
 *************************************************/

function loadScene(scene) {
  let sceneLength = scenes.length;
  scene.init(sceneLength);
  scenes.push(scene);
}

function unloadScene(index) {
  // let scene = scenes[0];
  // scene.unload();
  scenes.splice(index, 1);
}

function someColor() {
  // pick some random good color
  const color = goodColor[int(random(numPal))];
  return [color[0], color[1], color[2]];
}

function getPixel(context, x, y) {
  return context
    .getImageData(x, y, 1, 1)
    .data;
}

function takeColor(img) {
  let canvas = document.getElementById('defaultCanvas0');
  let context = canvas.getContext('2d');
  image(img, 0, 0);
  for (let x = 0; x < img.width; x += 100) {
    for (let y = 0; y < img.height; y += 100) {
      let c = getPixel(context, x, y);
      let exists = false;
      for (let n = 0; n < numPal; n++) {
        if (c == goodColor[n]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        // add color to pal
        if (numPal < maxPal) {
          goodColor[numPal] = c;
          numPal++;
        } else {
          break;
        }
      }
    }
  }
}

function attachSceneListeners() {

}
/*************************************************
 * Dom Listeners
 *************************************************/
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
};