let glBackground = [50, 76, 100, 255]
let scenes = [];
var socket = io('http://localhost:3001');
socket.on('connect', function () { console.log("Socket Connected") });
socket.on('disconnected', function () { console.log("Socket Disconnected") });
attachSceneListeners();

function attachSceneListeners() {
  socket.on('/0/scene1', (data) => {
    if (data.args[0] == 1) {
      loadScene(maze);
    } else {
      unloadScene(maze);
    }
  });
  socket.on('/0/scene2', (data) => {
    if (data.args[0] == 1) {
      loadScene(maze);
    } else {
      unloadScene(maze);
    }
  });
  socket.on('/0/scene3', (data) => {
    if (data.args[0] == 1) {
      loadScene(maze);
    } else {
      unloadScene(maze);
    }
  });
  socket.on('/0/scene4', (data) => {
    if (data.args[0] == 1) {
      loadScene(maze);
    } else {
      unloadScene(maze);
    }
  });
  socket.on('/0/scene5', (data) => {
    if (data.args[0] == 1) {
      loadScene(maze);
    } else {
      unloadScene(maze);
    }
  });
}
/*************************************************
 * P5 Functions
 *************************************************/
// For any preloading of sounds or images.
function preload() {

};


// Starting with a canvas the full window size.
function setup() {
  createCanvas(windowWidth, windowHeight)
};

function draw() {
  // background(glBackground);
  background(250, 25);
  for (let i = 0; i < scenes.length; i++) {
    scenes[i].draw();
  }
};

/*************************************************
 * Other Functions
 *************************************************/

// Sending the mouseClicked event to the sketches[currentSketch].
function mouseClicked() {

};


function loadScene(scene) {
  scene.init(scenes.length);
  scene.attachSockets();
  scenes.push(scene);
}

function unloadScene(scene) {
  scene.unload();
  scenes.splice(scene.index, 1);
}
/*************************************************
 * Dom Listeners
 *************************************************/

document.addEventListener('keydown', function (event) {
  if (event.key == " ") {
    loadScene(maze);
  } else if (event.key == "Shift") {
    unloadScene(maze)
  }

  if (event.key == "a") {
    loadScene(grid);
  } else if (event.key == "s") {
    unloadScene(grid)
  }
});


