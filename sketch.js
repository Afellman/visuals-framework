let glBackground = [0, 0, 0, 100]
let scenes = [];
let goodColor = [];
let maxPal = 512;
let numPal = 0;
let theShader;
let glCanvas;
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
  glCanvas = createCanvas(windowWidth, windowHeight);
  loadImage("./colorImg1.jpg", (img) => {
    takeColor(img);
    loadScene(new Connecter());
  });
};

function draw() {
  background(glBackground);
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i])
      scenes[i].draw();
  }
};

/*************************************************
 * Other Functions
 *************************************************/

// Sending the mouseClicked event to the sketches[currentSketch].
function mouseClicked() {
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) {
      scenes[i].mouseClicked();
    }
  };
};

function keyPressed(e) {
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) {
      scenes[i].keyPressed(e);
    }
  };
};

function loadScene(scene) {
  let sceneLength = scenes.length;
  scene.init(sceneLength);
  scenes.push(scene);
}

function unloadScene(index) {
  let scene = scenes[0];
  scene.unload();
  scenes.splice(index, 1);
}

function someColor() {
  // pick some random good color
  return goodColor[int(random(numPal))];
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
  for (let x = 0; x < img.width; x += 10) {
    for (let y = 0; y < img.height; y += 10) {
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

document.addEventListener('keydown', function (event) {
  if (event.key == " ") {
    loadScene(new Connecter());
  } else if (event.key == "Shift") {
    unloadScene(0) 
  }

  if (event.key == "a") {
    loadScene(new Shader101());
  } else if (event.key == "s") {
    unloadScene(0);
  }

  if(event.key == "q"){
    if(document.getElementById("controls").style.display == "none"){
      document.getElementById("controls").style.display = "block"
    }else {
      document.getElementById("controls").style.display = "none"
    }
  }
});
