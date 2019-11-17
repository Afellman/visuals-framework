let glBackground = [240, 240, 250, 100]
let scenes = [];
let goodColor = [];
let maxPal = 512;
let numPal = 0;
// var socket = io('http://localhost:3001');
// socket.on('connect', function () { console.log("Socket Connected") });
// socket.on('disconnected', function () { console.log("Socket Disconnected") });
// attachSceneListeners();

function attachSceneListeners() {
  socket.on('/0/scene1', (data) => {
    loadUnload(new Grid(), data.args[0], 0);
  });
  socket.on('/0/scene2', (data) => {
    loadUnload(new Grid(), data.args[0], 1);
  });
  socket.on('/0/scene3', (data) => {
    loadUnload(new Grid(), data.args[0], 2);
  });
  socket.on('/0/scene4', (data) => {
    loadUnload(new Grid(), data.args[0], 3);
  });
  socket.on('/0/scene5', (data) => {
    loadUnload(new Grid(), data.args[0], 4);
  });
}

const loadUnload = (load, scene, index) => {
  if (load) {
    loadScene(scene);
  } else {
    unloadScene(scenes[index]);
  }
}
/*************************************************
 * P5 Functions
 *************************************************/
// For any preloading of sounds or images.
function preload() {

};


// Starting with a canvas the full window size.
function setup() {
  createCanvas(windowWidth, windowHeight);
  loadImage("./colorImg1.jpg", (img) => takeColor(img));
};

function draw() {
  background(glBackground);
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i]) scenes[i].draw();
  }
};

/*************************************************
 * Other Functions
 *************************************************/

// Sending the mouseClicked event to the sketches[currentSketch].
function mouseClicked() {

};


function loadScene(scene) {
  let sceneLength = scenes.length;
  scene.init(sceneLength);
  scenes.push(scene);
}

function unloadScene(scene) {
  scene.unload();
  scenes.splice(scene.index, 1);
}

function someColor() {
  // pick some random good color
  return goodColor[int(random(numPal))];
}

function getPixel(context, x, y) {
  return context.getImageData(x, y, 1, 1).data;
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

/*************************************************
 * Dom Listeners
 *************************************************/

document.addEventListener('keydown', function (event) {
  if (event.key == " ") {
    loadScene(new Rain());
  } else if (event.key == "Shift") {
    unloadScene(scenes[0])
  }

  if (event.key == "a") {
    loadScene(new Grid());
  } else if (event.key == "s") {
    unloadScene(scenes[0]);
  }
});


