/**
 * TODO:
 *  1. Build saving and loading from data.
 *  2. Record.
 */
let maze = {

  index: -1,
  t: 0,
  lines: [],
  lineLength: 12,
  spacing: 19,
  linesPerRow: 0,
  rows: 0,
  amplitude: 0,
  waveSpeed: 0.01,
  waveVol: 0.00,
  waveAmt: 1,
  waveOn: false,
  sockets: [{
    address: "/1/jitter",
    method: this.jitter
  }],
  init: function (index) {
    this.index = index;
    // this.setupOsc();
    this.linesPerRow = width / (this.lineLength / 2 + this.spacing);
    this.rows = height / (this.lineLength / 2 + this.spacing);
    let source = new p5.AudioIn();
    this.amplitude = new p5.Amplitude(0.9);
    this
      .amplitude
      .setInput(source);
    source.start();

    fft = new p5.FFT(0.8, 512);
    fft.setInput(source);

    for (let i = 0; i < this.rows; i++) {
      let row = []
      for (let j = 0; j < this.linesPerRow; j++) {
        let x = map(j, 0, this.linesPerRow, 0, width);
        let y = map(i, 0, this.rows, 0, height);
        row.push(new this.Line(x, y, this.lineLength));
      }
      this
        .lines
        .push(row);

    }
  },
  unload: function () {
    this.lines = [];
    this.index = -1;
    this.detachSockets();
    this.linesPerRow = 0;
  },
  attachSockets: function () {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.on(thisSocket.name, thisSocket.method);
    }
  },
  detachSockets: function () {
    socket.removeListener('/1/jitter', this.jitter);
  },
  draw: function () {
    let vol = map(this.amplitude.getLevel(), 0, 1, 50, 255)
    stroke(vol)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.linesPerRow; j++) {
        if (Math.random() * 100 > 99.99) {
          this
            .lines[i][j]
            .rotate(i, j, this.lines);
        }
        this
          .lines[i][j]
          .display();
        if (this.waveOn) {
          this
            .lines[i][j]
            .wave()
        }
      }
    }
  },
  controls: {
    jitter: (val) => { },
    setWaveVol: (val) => waveVol = val,
    toggleWave: () => waveOn = !waveOn
  },
  Line: class {
    constructor(x, y, lineLength) {
      this.x = x;
      this.y = y;
      this.r = HALF_PI;
      this.length = lineLength;
    }

    checkProx(x, y) {
      if (dist(x, y, this.x, this.y) < lineLength + 25) {
        this.r += HALF_PI;
      }
    }

    rotate(i, j, lines) {
      (lines[i - 1]) && (lines[i - 1][j].r += HALF_PI);
      (lines[i + 1]) && (lines[i + 1][j].r += HALF_PI);

      (lines[i - 1]) && (lines[i - 1][j].r += HALF_PI);
      (lines[i + 1]) && (lines[i + 1][j].r += HALF_PI);

      (lines[i][j - 1]) && (lines[i][j - 1].r += HALF_PI);
      (lines[i][j + 1]) && (lines[i][j + 1].r += HALF_PI);

      lines[i][j].r += HALF_PI;
    }

    display(r) {
      push()
      translate(this.x, this.y);
      // strokeWeight(10) if (Math.random() * 10 > 10) {   this.length = 6; } else {
      // this.length = 12 }
      strokeWeight(3)
      rotate(this.r);
      line(-this.length, -this.length, this.length, this.length);
      pop()
    }

    wave(waveSpeed, waveVol) {
      this.x = this.x + sin(this.y + waveSpeed) * waveAmt;
      waveSpeed += waveVol;
      // this.y += this.x + sin(this.y / 100 + waveSpeed) * 10;
    }
  }
} // Refactor using Sketch as parent.

class Sketch {
  constructor(obj) {
    if (obj && typeof obj == "object") {
      for (let i in obj) {
        this[i] = obj[i];
      }
      this.loaded = true;
    }
    this.listeners = [];
    this.params = { faders: {}, buttons: {} }
  }

  init() {
    this.attachListeners();

  }

  unload() {
    this.detachListeners();
  }

  attachListeners() {
    // let length = this.listeners.length;
    // for (let i = 0; i < length; i++) {
    //   let thisListener = this.listeners[i];

    // const nodes = document.querySelectorAll("#" + thisListener.nodeID);
    // const node = nodes[0];
    // if (node) {
    //   if (node.tagName == "BUTTON") {

    //     node.addEventListener("click", (e) => {
    //       thisListener.method({
    //         args: [e.target.value / 100]
    //       });
    //     })
    //   } else {
    //     node.addEventListener("change", (e) => {
    //       thisListener.method({
    //         args: [e.target.value / 100]
    //       });
    //     })
    //   }
    // }

    // if (thisListener.midi) {
    //   if (midiSubscribers[thisListener.midi]) {
    //     midiSubscribers[thisListener.midi].push(thisListener.midiMethod)
    //   } else {
    //     midiSubscribers[thisListener.midi] = [thisListener.midiMethod]
    //   }
    // }
    // }

    for (let i = 0; i < this.listeners.length; i++) {
      const thisSocket = this.listeners[i];
      if (thisSocket.socketName && thisSocket.socketMethod) {
        socket.on(`/${this.sceneNum}/${thisSocket.socketName}`, thisSocket.socketMethod);
      }
    }
    // Attaching sockets to all fader params
    for (let i in this.params.faders) {
      socket.on(`/${this.sceneNum}/${i}`, (val) => {
        const param = val.address.split("/")[2];
        this.params.faders[param] = val.args[0];
      });
    }
    this.updateOsc();
  }

  updateOsc() {
    // Syncs iPad with scenes starting values
    socket.emit("updateOsc", {
      scene: this.sceneNum,
      params: this.params.faders
    });
  }

  detachListeners() {
    let length = this.listeners.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.listeners[i];
      socket.removeListener(thisSocket.socketName, thisSocket.method);
    }
  }

  mouseClicked() { }
  keyPressed() { }
  save() {
    const ret = {};
    for (let key in this) {
      if (typeof this[key] !== "function" && (typeof this[key] !== "object" && !Array.isArray(this[key])))
        ret[key] = this[key];
    }
    return ret;
  }
}

class Starry extends Sketch { // Scene 1. Maped
  constructor() {
    super();
    this.params = {
      faders: {
        starAmt: 200,
        speed: 10,
        size: 1,
        color: 1
      },
    }
    this.sceneNum = 1;
  }
  init() {
    super.init();
    this.opacity = 0;
    this.points = [];
    for (let i = 0; i < this.params.faders.starAmt; i++) {
      this.points.push({
        pos: createVector(random() * width, random() * height),
        color: 200 + Math.floor(Math.random() * 55) + 1,
      });
    }
  }
  draw() {
    let { color, size, starAmt, speed } = this.params.faders;
    let thisPoint = {};
    noStroke();

    for (let i = 0; i < starAmt; i++) {
      thisPoint = this.points[i];
      if (thisPoint == undefined) {
        thisPoint = this.addPoint();
      }
      let pointSize = dist(thisPoint.pos.x, thisPoint.pos.y, width / 2, height / 2) * (size / 100);
      let acc = p5.Vector.sub(thisPoint.pos, createVector(width / 2, height / 2));
      thisPoint.pos.add(acc.div(400 - speed))
      fill(color * thisPoint.color, color * thisPoint.color, color * thisPoint.color, this.opacity);
      ellipse(thisPoint.pos.x, thisPoint.pos.y, pointSize);
      if (thisPoint.pos.x > width || thisPoint.pos.x < 0 || thisPoint.pos.y > height || thisPoint.pos.y < 0) {
        this.points.splice(i, 1);
        starAmt--;
        this.addPoint();
      }
    }
  }
  addPoint() {
    let { starAmt } = this.params.faders;
    let x = map(Math.random(), 0, 1, (width / 2) - 100, (width / 2 + 100));
    let y = map(Math.random(), 0, 1, (height / 2) - 100, (height / 2 + 100));
    let vec = createVector(x, y);
    let newPoint = {
      pos: vec,
      color: 200 + Math.floor(Math.random() * 55) + 1,
    };
    this.points.push(newPoint)
    starAmt++;
    return newPoint;
  }
}

class Sun extends Sketch { // Scene 2. Maped
  constructor() {
    super();
    this.sceneNum = 2;
    this.params = {
      faders: {
        amp: 20,
        ringAmt: 1,
        speed: 0,
        r: 100,
        g: 53,
        b: 0
      }
    }
  }

  init() {
    super.init();
    this.freq = 21;
    this.opacity = 0;
    this.time = this.params.faders.speed;
  }

  draw() {
    let { ringAmt, amp, speed, r, g, b } = this.params.faders;
    let size;
    // noStroke();
    stroke(0, 0);
    for (let i = 0; i < ringAmt; i++) {
      let opacVariance = i;
      size = 200 + (i * 10) + sin(i + this.time * this.freq) * amp;
      if (i == 0) {
        opacVariance = 0.9;
      }
      fill(r, g, b, (this.opacity / opacVariance));
      ellipse(width / 2, height / 2, size);
    }
    this.time += speed / 1000;
  }
  keyPressed(e) {

  }
}

class SineWaves extends Sketch { // Scene 3. Maped 
  constructor(obj) {
    super(obj);
    this.params = {};
    this.sceneNum = 3;
    if (!this.loaded) {
      this.lines = [];
      this.params = {
        faders: { // Initializing with one line.
          line1R: 255,
          line1G: 255,
          line1B: 255,
          line1Speed: 0.01,
          line2R: 255,
          line2G: 255,
          line2B: 255,
          line2Speed: 0.01,
          line3R: 255,
          line3G: 255,
          line3B: 255,
          line3Speed: 0.01,
          line4R: 255,
          line4G: 255,
          line4B: 255,
          line4Speed: 0.01,
          weight: 3
        },
        buttons: {
          lineAmt: 1,
        }
      }
      this.res = 512;
      this.opacity = 0;
    }
  }
  init() {
    super.init();
    for (let i = 0; i < this.params.buttons.lineAmt; i++) {
      this.addLine();
    }
  }
  draw() {
    let prevX = 0;
    let prevY = height / 2;
    for (let j = 0; j < this.params.buttons.lineAmt; j++) {
      let thisLine = this.lines[j];
      const red = this.params.faders[`line${j + 1}R`];
      const green = this.params.faders[`line${j + 1}G`];
      const blue = this.params.faders[`line${j + 1}B`];
      const weight = this.params.faders.weight;
      const speed = this.params.faders[`line${j + 1}Speed`]

      stroke(red, green, blue, this.opacity);
      strokeWeight(weight);
      for (let i = 0; i < this.res; i++) {
        let x = width / 100 * i;
        let y = height / 2 + -Math.abs(sin((2 * PI * x * thisLine.freq) / (width * 2))) * (sin(thisLine.time) * thisLine.maxAmpY);
        line(prevX, prevY, x, y);
        prevX = x;
        prevY = y;
        if (i == this.res - 1) {
          prevX = 0;
          prevY = height / 2;
        }
      }
      thisLine.time += speed;
    }
  }

  addLine() {
    const line = { freq: 1, maxAmpY: height / 2, speed: 0.01, time: 0.01, color: [255, 255, 255] }
    this.lines.push(line);
    return line;
  }


  listeners = [
    {
      socketName: 'lineAmt',
      socketMethod: (val) => {
        if (val.args[0] == 1) {
          this.addLine();
          this.params.buttons.lineAmt++;
        } else if (val.args[0] == -1) {
          this.lines.splice(this.lineAmt, 1);
          this.params.buttons.lineAmt--;
        }
      }
    }
  ]
}


class SpinningCircles extends Sketch {
  constructor() {
    super();
    this.topPoints = [];
    this.bottomPoints = [];
    this.leftPoints = [];
    this.rightPoints = [];
    this.centerPoints = [];
    this.sceneNum = 4;
    if (!this.loaded) {
      this.params = {
        faders: {
          pointAmt: 200,
          circleDiameter: 50,
          curl: 300,
          proximityOut: 250,
          proximityIn: 1000,
          speed: 0.01,
          circleSize: 3
        },
        buttons: {
          top: true,
          right: false,
          bottom: true
        }
      }

      this.multiplier = 10;
      this.opacity = 0;
      this.freq = 0.01;
    }
  }

  init() {
    super.init();
    for (let i = 0; i < this.params.faders.pointAmt; i++) {
      let x = width / this.params.faders.pointAmt * i;
      let y = 0;
      let orbit = sin(this.freq + i * 10) * this.params.faders.curl;
      let circle = sin(i) * this.params.faders.circleDiameter;
      let orbitY = cos(this.freq + i * this.multiplier);
      let circleY = cos(i) * this.params.faders.circleDiameter;
      this.centerPoints.push({
        pos: {
          x: width / 2 + orbit + circle,
          y: (height / 2 + orbitY * this.params.faders.curl) + circleY,
        },
        size: 5,
        color: [255, 255, 255],
      })
    }
  }

  draw() {
    strokeWeight(1);
    let centerPoint = {}
    let orbit;
    let circle;
    let orbitY;
    let circleY;
    let x;
    let y;
    const { speed, curl, circleDiameter, circleSize, pointAmt } = this.params.faders;
    stroke(255, 255, 255, 50);
    fill(255, 255, 255, 255 * this.opacity);
    for (let i = 0; i < pointAmt; i++) {
      bottomPoint = this.bottomPoints[i];
      topPoint = this.topPoints[i];
      rightPoint = this.rightPoints[i];
      leftPoint = this.leftPoints[i];
      centerPoint = this.centerPoints[i];
      orbit = sin(this.freq + i * 10) * curl;
      circle = sin(i) * circleDiameter;
      orbitY = cos(this.freq + i * this.multiplier);
      circleY = cos(i) * circleDiameter;
      x = width / 2 + orbit + circle;
      y = (height / 2 + orbitY * curl) + circleY;
      centerPoint.pos.x = x;
      centerPoint.pos.y = y;
      centerPoint.size = circleSize;


      ellipse(Math.round(x), Math.round(y), circleSize);
      for (let j = 0; j < pointAmt; j++) {
        if (dist(x, y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y) < proximityIn) { // Connects all dots together
          line(x, y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y);
        }
      }
    }
    this.freq += speed;


    let orbit;
    let circle;
    let orbitY;
    let circleY;
    for (let i = 0; i < this.pointAmt; i++) {
      let thisPoint = this.centerPoints[i];
      orbit = sin(this.freq + i * 10) * this.curl;
      circle = sin(i) * this.circleDiameter;
      orbitY = cos(this.freq + i * this.multiplier);
      circleY = cos(i) * this.circleDiameter;
      thisPoint.pos.x = width / 2 + orbit + circle
      thisPoint.pos.y = (height / 2 + orbitY * this.curl) + circleY;
      stroke(thisPoint.stroke[0], thisPoint.stroke[1], thisPoint.stroke[2], this.opacity);
      for (let j = 0; j < this.pointAmt; j++) {
        if (dist(thisPoint.pos.x, thisPoint.pos.y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y) < this.proximity) {
          line(thisPoint.pos.x, thisPoint.pos.y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y)
        }
      }
    }
    this.freq += this.speed;
  }

  listeners = [{
    socketName: "multiplier",
    socketMethod: (val) => this.multiplier += val.args[0]
  }]
  mouseClicked() { }
}


class Connecter extends Sketch {// Scene 4.
  constructor(color) {
    super();
    this.params = {
      faders: {
        // pointAmt: 50,
        // this.circleDiameter = 410;
        // this.curl = 280;
        // this.strokeWeight = 1;
        // this.multiplier = 10;


      }
    }
    this.centerPoints = [];
    this.color = 255;
    this.proximity = 500;
    this.speed = 0.01;
    this.color = color || false;
    this.imgIndex = 2;
    this.opacity = 0;
  }


  init() {
    super.init();
    for (let i = 0; i < this.pointAmt; i++) {
      const orbit = sin(this.freq + i * 10) * this.curl;
      const circle = sin(i) * this.circleDiameter;
      const orbitY = cos(this.freq + i * this.multiplier);
      const circleY = cos(i) * this.circleDiameter;
      const newPoint = new Objects.Circle(
        width / 2 + orbit + circle,
        (height / 2 + orbitY * this.curl) + circleY,
        5,
        this.color || someColor(this.imgIndex),
      );
      this.centerPoints.push(newPoint);
    }
    this.freq = this.speed;
  }

  draw() {
    strokeWeight(this.strokeWeight);
    let orbit;
    let circle;
    let orbitY;
    let circleY;
    for (let i = 0; i < this.pointAmt; i++) {
      let thisPoint = this.centerPoints[i];
      orbit = sin(this.freq + i * 10) * this.curl;
      circle = sin(i) * this.circleDiameter;
      orbitY = cos(this.freq + i * this.multiplier);
      circleY = cos(i) * this.circleDiameter;
      thisPoint.pos.x = width / 2 + orbit + circle
      thisPoint.pos.y = (height / 2 + orbitY * this.curl) + circleY;
      stroke(thisPoint.stroke[0], thisPoint.stroke[1], thisPoint.stroke[2], this.opacity);
      for (let j = 0; j < this.pointAmt; j++) {
        if (dist(thisPoint.pos.x, thisPoint.pos.y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y) < this.proximity) {
          line(thisPoint.pos.x, thisPoint.pos.y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y)
        }
      }
    }
    this.freq += this.speed;
  }
  listeners = []
  mouseClicked() { }
}

class Sin extends Sketch {
  constructor(obj) {
    super(obj);
    this.waves = [];
    if (!this.loaded) {
      this.time = 0;
    }
  }

  init() {
    super.init();
    this.waves.push(new Objects.SineWave(50, 0.004))
    this.waves.push(new Objects.SineWave(75, 0.01))
    this.waves.push(new Objects.SineWave(15, 0.01))
  }

  draw() {
    let howManyWaves = this.waves.length;
    stroke("white")
    beginShape()
    for (let i = 0; i < 360; i++) {
      let x = map(i, 0, 360, 0, width);
      let y = height / 2;
      let n = i * 0.005
      for (let j = 0; j < howManyWaves; j++) {
        y += this.waves[j].getVoltage(i + this.time) * (1 + noise(n, n));
      }
      vertex(x, y);
    }
    endShape();
    this.time += 0.1
  }

  listeners = [{
    socketName: '/1/multifader1/1',
    method: (val) => {
      this.amplitude = val.args[0] * 200;
    }
  },
  {
    socketName: '/1/multifader1/2',
    method: (val) => {
      this.frequency = val.args[0] / 100
    }
  },
  {
    socketName: '/1/multifader1/3',
    method: (val) => {
      this.speed = val.args[0]
    }
  },
  ]

}

class Rain extends Sketch {
  constructor(obj) {
    super(obj);
    this.dots = [];
    if (!this.loaded) {
      this.rowsAmount = 50;
      this.dotsAmount = 20;
      this.globalChange = 14
      this.period = 0.04;
      this.xspacing = 0.003;
      this.speed = 0.01;
      this.rateChange = (TWO_PI / this.period) * this.xspacing;
      this.amplitude = 2.5;
      this.opacity = 0;
    }
  }

  init() {
    super.init();
    for (let i = 0; i < this.rowsAmount; i++) {
      let x = Math.round(map(i, 0, this.rowsAmount, 0, width));
      this.dots[i] = []
      for (let j = 0; j < this.dotsAmount; j++) {
        let y = Math.round(map(j, 0, this.dotsAmount, 0, height + 100));
        this
          .dots[i]
          .push({
            pos: {
              x: x,
              y: y,
            },
            size: 2,
          })
      }
    }
  }

  draw() {
    this.rateChange = (PI / this.period) * this.xspacing;
    this.globalChange += this.speed;
    let change = this.globalChange;
    for (let i = 0; i < this.rowsAmount; i++) {
      for (let j = 0; j < this.dotsAmount; j++) {
        let thisDot = this.dots[i][j];
        thisDot.size = Math.round(sin(change * i) * this.amplitude) * 5;
        stroke(230, 230, 230, this.opacity);
        fill(230, 230, 230, this.opacity);
        ellipse(thisDot.pos.x, thisDot.pos.y, thisDot.size)
        change += this.rateChange;
      }
    }
  }

  controls = {
    changeSpeed: (val) => this.speed = sin(val),
    changePeriod: (val) => this.period = val,
    changeSpacing: (val) => this.xspacing = val,
    changeAmp: (val) => this.amplitude = val
  }

}

class BGShader extends Sketch {
  constructor() {
    super();
    this.lightSpeed = 0.01;
    this.pointsAmt = 1;
    this.diameter = 200;
    this.time = 0;
    this.shader = shaders[0];
  }


  init() {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    this.points = [
      [0.5, 0.5]
    ]

  }

  draw() {
    // background("black");

    // THIS NEEDS p5.js not p5.min.js. Used to set array of uniforms with dynamic length
    // for (let i = 0; i < this.points.length; i++) {
    //   const point = this.points[i];
    //   // theShader.setUniform("u_point" + i, this.plot(point)); Can't manage to set
    //   // the whole array at once using the p5 setUniform method, so setting them
    //   // directely and individually. I made adjustments to p5.js to put gl and
    //   // glShaderProgram on the window object.
    //   var someVec2Element0Loc = window.gl.getUniformLocation(window.glShaderProgram, "u_points[" + i + "]");
    //   window.gl.uniform2fv(someVec2Element0Loc, point); // set element 0
    // }

    noStroke();
    this.shader.setUniform("u_color", glBackground) // Get this equation correct.
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);
    this.time += 0.01
  }

  listeners = [{
    socketName: '/1/xy1',
    method: (val) => {
      this.points[0] = [val.args[1], val.args[0]]
    }
  }, {
    socketName: '/1/multixy1/1',
    method: (val) => {
      this.points[0] = [val.args[1], val.args[0]]
    }
  }, {
    socketName: '/1/multixy1/2',
    method: (val) => {
      this.points[1] = [val.args[1], val.args[0]]
    }
  }, {
    socketName: '/1/multixy1/3',
    method: (val) => {
      this.points[2] = [val.args[1], val.args[0]]
    }
  }]

  makePoints() {
    let pointsArray = [];
    for (let i = 0; i < this.pointsAmt; i++) {
      let x = width / 2 + sin(i * HALF_PI) * 100;
      let y = height / 2 + cos(i * HALF_PI) * 50;
      pointsArray.push([x, y])
    }
    return pointsArray;
  }

  plot(arr) {
    return new Array(arr[0] / width, arr[1] / height);
  }
}

class Ripples extends Sketch {
  constructor(obj) {
    super(obj);
    this.circles = [];
    if (!this.loaded) {
      this.angle = 0.01
    }
  }

  init() {
    super.init();
  }

  draw() {
    for (let i = 0; i < this.circles.length; i++) {
      let thisCircle = this.circles[i];
      thisCircle.draw();
      if (thisCircle.size > 400) {
        this.circles.splice(i, 1);
      }
    }
  }

  addCircle(x, y) {
    this
      .circles
      .push(new Objects.ExplodingCircle({
        x: x,
        y: y,
        size: 25,
        stroke: someColor()
      }))
  }
  mouseClicked() {
    if (this.clicked) {
      let x = mouseX;
      let y = mouseY;
      this.addCircle(x, y);
      setTimeout(() => this.addCircle(x, y), 200)
      setTimeout(() => this.addCircle(x, y), 400)
      this.clicked = false;
    } else {
      this.clicked = true;
      setTimeout(() => {
        this.clicked = false
      }, 500)
    }
  }
}

class GoldenSpiral extends Sketch {
  constructor(color = 255) {
    super();
    this.goldenAngle = PI * (3.0 - sqrt(5));
    this.time = 0;
    this.number = 500;
    this.size = 200;
    this.stepSize = 2;
    this.opacity = 20;
    this.animate = true;
    this.time = 0;
    this.opacity = 0;
  }
  listeners = [{

  }]
  init() {
    super.init();
  }

  draw() {
    // background(0);
    fill(255, 10);
    stroke(255, 255, 255, this.opacity)
    translate(width / 2, height / 2)
    // this.number = frameCount;
    for (var i = 0; i < this.number; i++) {
      rotate(this.time);
      translate(0, i * this.stepSize);
      rotate(this.goldenAngle);
      line(0, 0, -this.size, this.size);
      // triangle(-this.size, 0, 0, this.size, this.size, 0)
      // ellipse(0, 0, this.size);						// draw an ellipse (circle)
      // rect(0, 0, this.size, this.size); 					// draw a rectangle
    }
    this.time += 0.00001;
  }
}

class Orbitals extends Sketch {
  constructor() {
    super();
    this.spinnerAmt = 1000;
    this.spinners = [];
    this.ampX = width / 4;
    this.ampY = height / 2;
    this.wobble = 0;
    this.speed = 1
  }

  init() {
    super.init();
    for (let i = 0; i < this.spinnerAmt; i++) {
      let x = (width / 2) + sin(Math.random()) * (width / 4);
      const y = height / 2 + cos(Math.random()) * (i * 3);
      const newOrbital = new Objects.Point(x, y, someColor());
      newOrbital.speed = Math.random() / 3;
      newOrbital.weight = Math.random() * 10;
      newOrbital.index = i;
      this.spinners.push(newOrbital);

    }
  }

  draw() {
    stroke("grey")
    for (let i = 0; i < this.spinnerAmt; i++) {
      let thisSpinner = this.spinners[i];
      const changeX = frameCount / 10 * this.speed;
      const changeY = (frameCount / 10);
      const startX = width / 2;
      const startY = height / 2;
      const sinX = sin(changeX * thisSpinner.speed);
      const cosY = cos(changeY * thisSpinner.speed)
      thisSpinner.pos.x = startX + sinX * this.ampX - (i * this.wobble);
      thisSpinner.pos.y = startY + cosY * (this.ampY - i)
      strokeWeight(thisSpinner.weight);
      thisSpinner.draw();
      this.explode(thisSpinner, 0.1);
    }
  }

  explode(spinner, rate) {
    if (spinner.explode) {
      spinner.weight += rate;
      if (spinner.weight > 20) {
        this.spinners.splice(spinner.index, 1);
        this.spinnerAmt--;
      }
    }

  }

}

class Mirror extends Sketch {
  constructor(isVertical, isHorizonal) {
    super();
    this.isVertical = isVertical || false;
    this.isHorizonal = isHorizonal || true;
  }
  init() {
    super.init();
  }
  draw() {
    if (this.isHorizonal) {
      push()
      translate(width, 0)
      scale(-1, 1);
      image(glCanvas, width / 2, 0, width / 2, height, width / 2, 0, width / 2, height);
      pop()
    }
    if (this.isVertical) {
      push()
      translate(0, height)
      scale(1, -1);
      image(glCanvas, 0, height / 2, width, height / 2, 0, height / 2, width, height / 2);
      pop()
    }
  }
  listeners = [{}]
}

class SoundTest extends Sketch {
  constructor() {
    super();
  }

  init() {
    super.init();
    this.prevX = 0;
    this.prevY = 0;
  }

  draw() {
    stroke("white")
    for (let i = 0; i < 1024; i++) {
      let x = map(i, 0, 1024, 0, width);
      let y = height / 2 - map(mic.getLevel(0.5), 0, 1, 0, height);
      line(this.prevX, this.prevY, x, y);
      this.prevX = x;
      this.prevY = y;
    }
  }
  listeners = [{}]
}

class LinesShader extends Sketch {
  constructor(img) {
    super();
    this.linesShader;
    this.img = images[0];
    this.speed = 1;
    this.direction = 1;
    this.opacity = 0;
    this.xOff = 0;
    this.yOff = 0;
    this.amp = 0;
    this.noise = 0;
    this.freq = 0;
    this.speed = 0;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    this.cam = createCapture(VIDEO);
    this.cam.size(innerWidth, innerHeight);
    this.cam.hide();
    this.time = 0;
    this.params = [1.0, 0.0, 1.7, 0.0, 0.0, 0.0]
    this.loops = 4;
    this.cray = 0.0;
    this.shader = shaders[1];
    this.shaderPath = "./shaders/movingLines.frag";
  }

  draw() {
    // linesShader.setUniform("u_color", [0.0, 1.0, 0.0, 1.0]) // Get this equation correct.
    noStroke();
    this.shader.setUniform("u_opacity", this.opacity)
    this.shader.setUniform("tex0", this.img);
    this.shader.setUniform('u_time', frameCount / 1000)
    this.shader.setUniform('u_xOff', this.xOff);
    this.shader.setUniform('u_yOff', this.yOff);
    this.shader.setUniform('u_amp', this.amp);
    this.shader.setUniform('u_noise', this.noise);
    this.shader.setUniform('u_freq', this.freq);
    this.shader.setUniform('u_speed', this.speed);


    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);

  }

  unload() {
    super.unload();
    shaders[1] = loadShader("./shaders/texture.vert", this.shaderPath);
  }

  listeners = [
    {
      socketName: '/1/multifader1/1',
      nodeID: "slider1",
      midi: "1",
      midiMethod: val => this.params[0] = val / 100,
      method: (val) => {
        this.yOff = val.args[0];
      }
    },
    {
      socketName: '/1/multifader1/2',
      nodeID: "slider1",
      midi: "2",
      midiMethod: val => this.params[1] = val / 100,
      method: (val) => {
        this.xOff = val.args[0];
      }
    },
    {
      socketName: '/1/multifader1/3',
      nodeID: "slider1",
      midi: "3",
      midiMethod: val => {
        val = map(val, 0, 127, 0, 10);
        this.params[2] = val;
      },
      method: (val) => {
        this.amp = val.args[0] / 10;
      }
    },
    {
      socketName: '/1/multifader1/4',
      nodeID: "slider1",
      midi: "4",
      midiMethod: val => {
        val = map(val, 0, 127, 0, 0.5)
        this.params[3] = val
      },
      method: (val) => {
        this.freq = val.args[0];
      }
    },
    {
      socketName: '/1/multifader1/5',
      nodeID: "slider1",
      midi: "5",
      midiMethod: val => {
        val = map(val, 0, 127, 0, 1)
        this.params[4] = val
      },
      method: (val) => {
        this.speed = val.args[0] * 2;
      }
    },
    {
      socketName: '/1/multifader1/6',
      nodeID: "slider1",
      midi: "6",
      midiMethod: val => {
        this.params[5] = val / 100
      },
      method: (val) => {
        this.noise = val.args[0];
      }
    },
  ]
}

class FlowShader extends Sketch {
  constructor(img) {
    super();
    this.linesShader;
    this.img = images[2];
    this.speed = 1;
    this.direction = 1;
    this.opacity = 0;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    this.cam = createCapture(VIDEO);
    this.cam.size(innerWidth, innerHeight);
    this.cam.hide();
    this.time = 0;
    this.params = [1.0, 0.0, 1.7, 0.0, 0.0, 0.0]
    this.loops = 4;
    this.cray = 0.0;
    this.shader = shaders[5];
    this.shaderPath = "./shaders/trippytwo.frag"
  }

  draw() {
    // linesShader.setUniform("u_color", [0.0, 1.0, 0.0, 1.0]) // Get this equation correct.
    noStroke();
    this.shader.setUniform("u_opacity", this.opacity)
    this.shader.setUniform("u_loops", this.loops);
    this.shader.setUniform("u_params", this.params);
    this.shader.setUniform("tex0", this.img);
    this.shader.setUniform('u_cray', this.cray)
    this.shader.setUniform('u_time', frameCount / 1000)
    this.shader.setUniform('u_speed', this.speed);
    this.shader.setUniform('u_direction', this.direction);
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);

  }

  unload() {
    super.unload();
    shaders[5] = loadShader("./shaders/texture.vert", this.shaderPath);
  }

  listeners = [{
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "1",
    midiMethod: val => this.params[0] = val / 100,
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "2",
    midiMethod: val => this.params[1] = val / 100,
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "3",
    midiMethod: val => {
      val = map(val, 0, 127, 0, 10);
      this.params[2] = val;
    },
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "4",
    midiMethod: val => {
      val = map(val, 0, 127, 0, 0.5)
      this.params[3] = val
    },
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "5",
    midiMethod: val => {
      val = map(val, 0, 127, 0, 1)
      this.params[4] = val
    },
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "6",
    midiMethod: val => {
      this.params[5] = val / 100
    },
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  ]
}

class TreeFractal extends Sketch {
  constructor() {
    super();
  }
  init() {
    super.init();
    this.angle = 1.2666;
    this.startingAngle = this.angle;
    this.divider = 0.65;
    this.length = 220;
    this.movement = 0.0022;
    this.opacity = 0;
  }
  draw() {
    let len = 100;
    let r = 150 + sin(frameCount / 200) * 50;
    let b = 200 + sin(frameCount / 100) * 50;
    let g = 100 + sin(frameCount / 300) * 50;
    stroke(r, g, b, this.opacity);
    translate(width / 1.5, height);
    this.branch(this.length);
    // this.angle = this.startingAngle * frameCount / 500;
  }
  branch(len) {
    line(0, 0, 0, -len);
    translate(0, -len);
    if (len > 4) {
      push();
      rotate(this.angle);
      this.branch(len * this.divider);
      pop();
      push();
      rotate(noise(frameCount * this.movement, -len) - this.angle);
      this.branch(len * this.divider);
      pop();
    }
  }
  listeners = [{
    socketName: '/1/multifader1/1',
    nodeID: "slider1",
    midi: "2",
    midiMethod: val => this.angle = val / 30,
    method: (val) => {
      this.angle = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider2",
    midi: "3",
    midiMethod: val => this.divider = val / 100,
    method: (val) => {
      this.divider = val.args[0];
    }
  },
  {
    socketName: '/1/multifader1/1',
    nodeID: "slider3",
    midi: "4",
    midiMethod: val => this.length = val * 10,
    method: (val) => {
      this.length = val.args[0] * 300;
    }
  },
  {
    nodeID: "slider4",
    midi: "1",
    midiMethod: val => this.movement = val / 10000,
    method: (val) => {
      this.movement = val.args[0] / 100;
    }
  },
  ]
}

class Drops extends Sketch {
  constructor(obj) {
    super(obj);
    if (!this.loaded) {
      this.resolution = 25;
    }
    this.grid = [];
    this.center = createVector(width / 2, height / 2);
    this.center.normalize();
    this.speed = 0.01;
  }

  init() {
    super.init();
    for (let i = 0; i < this.resolution; i++) {
      let y = map(i, 0, this.resolution, 0, height);
      this.grid[i] = new Array(2);
      for (let j = 0; j < this.resolution; j++) {
        let x = map(j, 0, this.resolution, 0, width);
        this.grid[i][j] = createVector(x, y);
      }
    }
  }

  draw() {
    let thisPoint = {};
    stroke("white")
    fill("white")
    for (let i = 0; i < this.resolution; i++) {
      // ellipse(thisPoint.x, thisPoint.y, 5);
      for (let j = 0; j < this.resolution; j++) {
        thisPoint = this.grid[i][j];
        let acc = p5.Vector.sub(thisPoint, createVector(width / 2, height / 2));
        thisPoint.add(acc.normalize().mult(sin(frameCount / 100)));
        ellipse(thisPoint.x, thisPoint.y, 2);
      }
    }
  }

  listeners = [{}]
}

class Grid extends Sketch {
  constructor(obj) {
    super(obj);
    this.gridPoints = [];
    if (!this.loaded) {
      this.gridPointsLength = 0;
      this.angle = 0.01;
      this.gridPointsX = 20;
      this.gridPointsY = 20;
    }
  }

  init(index) {
    super.init();
    for (let i = 0; i < this.gridPointsY; i++) {
      let row = [];
      let y = map(i, 0, this.gridPointsY, 0, height);
      for (let j = 0; j < this.gridPointsX; j++) {
        let x = map(j, 0, this.gridPointsX, 0, width);
        row.push(createVector(x, y))
      }
      this
        .gridPoints
        .push(row);
    }
    this.gridPointsLength = this.gridPoints.length;
  }

  draw() {
    strokeWeight(3);
    stroke(80, 0, 0);
    for (let i = 1; i < this.gridPointsLength; i++) {
      for (let j = 0; j < this.gridPointsX - 1; j++) {
        if (i < this.gridPointsLength - 1) {
          line(this.gridPoints[i][j].x, this.gridPoints[i][j].y, this.gridPoints[i + 1][j].x, this.gridPoints[i + 1][j].y)
          this.move(this.gridPoints[i][j], i)
        }
        line(this.gridPoints[i][j].x, this.gridPoints[i][j].y, this.gridPoints[i][j + 1].x, this.gridPoints[i][j + 1].y);
      }
    }
    // this.angle += 0.01;
  }

  move(point, i) {

    let amp = mouseX / 1000;
    let mouse = createVector(mouseX, mouseY);
    let acc = p5
      .Vector
      .sub(point, mouse);
    acc.normalize();

    // acc.mult(5)
    // point.x += sin(this.angle) * acc.x;
    // point.y += cos(this.angle) * acc.y;
  }
}

class EarthQuake extends Sketch {
  constructor() {
    super();
  }

  unload() {
    super.unload();
    this.gridPoints = [];
    this.gridPointsLength = 0
    this.gridPointsX = 0;
    this.gridPointsY = 0;
  }

  init() {
    super.init();
    this.time = new Date().getTime();
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson").then((res) => res.json()).then(data => {
      this.quakeData = data.features;
      this.firstQuake = this
        .quakeData
        .reduce((min, obj) => obj.properties.time < min ?
          obj.properties.time :
          min, this.quakeData[0].properties.time)
    }).catch(err => console.log(err));
  }

  draw() {
    if (this.quakeData) {
      for (let i = 0; i < this.quakeData.length; i++) {
        let thisQuake = this.quakeData[i].properties;
        let x = map(thisQuake.time, this.firstQuake, this.time, 200, width);
        stroke("white")
        text(thisQuake.title, x, height / 2 - (i * 30));
        ellipse(x, height / 2, thisQuake.mag * 25)
      }
    }
  }
}

const Objects = {
  /**
   * @class Point
   * @classdesc Draws an Point
   * @prop {int} x X coordinate
   * @prop {int} y y coordinate
   * @prop {color} color Color of the point
   */
  Point: class {
    constructor(x, y, color) {
      this.pos = createVector(x, y);
      this.color = color;
      this.color = typeof color == "object" ? [color[0], color[1], color[2]] :
        color || 0;
    }

    draw() {
      stroke(this.color);
      point(this.pos.x, this.pos.y)
    }


  },
  /**
   * @class ExplodingCircle
   * @classdesc Draws an ellipse that expands over time.
   * @prop {color} stroke Color for the stroke of the circle. Defaulted to black
   * @prop {color} fill Color for the fill of the circle. Defaulted to black
   * @prop {int} x X coordinate of the center of the circle
   * @prop {int} y y  coordinate of the center of the circle
   * @prop {int} size diameter of the circle
   */
  ExplodingCircle: class {
    constructor({
      stroke,
      fill,
      x,
      y,
      size,
    }) {
      this.stroke = typeof stroke == "object" ? [stroke[0], stroke[1], stroke[2]] :
        stroke || 0;
      this.fill = typeof fill == "object" ? [fill[0], fill[1], fill[2]] :
        fill || 0;
      this.x = x || 0;
      this.y = y || 0;
      this.size = size || 10;
      this.speed = HALF_PI;
      this.angle = this.speed;
    }
    draw() {
      this.size += sin(radians(this.angle)) * 10;
      this.color
      stroke(this.stroke);
      strokeWeight(10);
      noFill();
      ellipse(Math.round(this.x), Math.round(this.y), Math.round(this.size));
      this.angle += this.speed;
    }
  },
  /**
   * @class Circle
   * @classdesc Draws an ellipse
   * @prop {color} stroke Color for the stroke of the circle. Defaulted to black
   * @prop {color} fill Color for the fill of the circle. Defaulted to black
   * @prop {int} x X coordinate of the center of the circle
   * @prop {int} y y  coordinate of the center of the circle
   * @prop {int} size diameter of the circle
   */
  Circle: class {
    constructor(
      x,
      y,
      size,
      stroke,
      fill,
    ) {
      this.stroke = stroke || 0;
      this.fill = typeof fill == "object" ? [fill[0], fill[1], fill[2]] :
        fill || 0;
      this.pos = createVector(x, y);
      this.size = size || 10;
    }
    draw() {
      stroke(this.stroke);
      fill(this.fill);
      ellipse(this.pos.x, this.pos.y, this.size);
    }
  },
  Plane: class {
    constructor() { }
  },

  /**
   * @class SineWave
   * @classdesc Stores properties of a sine wave and exposes a getVoltage function which returns the voltage at a given time
   * @param {int} amp amplitude in pixels
   * @param {float} freq frequency of the wave
   * @param {float} phase Offsets the starting point in the cycle
   * @param {int} startY starting y coord of the wave
   */
  SineWave: class {
    constructor(
      amp,
      frequency,
      phase,
      startY
    ) {
      this.time = 1;
      this.amplitude = amp || 100;
      this.frequency = frequency || 0.01;
      this.phase = phase || 1;
      this.startY = startY || height / 2;
    }
    getVoltage(time) {
      return this.amplitude * sin(2 * PI * this.frequency * time + this.phase);
    }
  },


}

const Methods = {
  connect: (point, arrayOfObjects, distance, str) => {
    const length = arrayOfObjects.length
    let thisPoint;
    if (str) {
      stroke(str);
    }
    for (let i = 0; i < length; i++) {
      thisPoint = arrayOfObjects[i];
      if (dist(point.x, point.y, thisPoint.x, thisPoint.y) < distance) {
        line(point.x, point.y, thisPoint.x, thisPoint.y);
      }
    }
  },
  sin: (amp, freq, time, phase) => {
    return amp * sin(2 * PI * freq * time + phase);
  },

}

const Helpers = {
  ease: function (val, low, high) {
    return this.easeInOutQuad(normalize(val))
  },

  normalize: function (val) {
    return (val - 0) / (1 - 0);
  },

  easeInOutQuad: function (t) {
    return t < .5 ?
      2 * t * t :
      -1 + (4 - 2 * t) * t
  },
  writeColor(image, x, y, red, green, blue, alpha) {
    let index = (x + y * width) * 4;
    image.pixels[index] = red;
    image.pixels[index + 1] = green;
    image.pixels[index + 2] = blue;
    image.pixels[index + 3] = alpha;
  },
}