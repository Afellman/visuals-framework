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
    jitter: (val) => {},
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
  constructor() {
    this.index = -1;
    this.sockets = [];
  }
  init() {
    this.index = -1;
    this.attachSockets();
  }
  unload() {
    this.detachSockets();
  }
  attachSockets() {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.on(thisSocket.name, thisSocket.method);
    }
  }
  detachSockets() {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.removeListener(thisSocket.name, thisSocket.method);
    }
  }
  mouseClicked() {}
  keyPressed() {}
}

class Grid {
  index = -1;
  sockets = [{}];
  gridPointsLength = 0;
  gridPointsX = 0;
  gridPointsY = 0;
  gridPoints = [];
  angle = 0.01;

  init(index) {
    this.index = index;
    this.gridPointsX = 20;
    this.gridPointsY = 20;
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
  unload() {
    this.index = -1;
    this.gridPoints = [];
    this.gridPointsLength = 0
    this.gridPointsX = 0;
    this.gridPointsY = 0;
    this.detachSockets();
  }
  attachSockets() {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.on(thisSocket.name, thisSocket.method);
    }
  }
  detachSockets() {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.removeListener(thisSocket.name, thisSocket.method);
    }
  }

  draw() {
    for (let i = 1; i < this.gridPointsLength; i++) {
      for (let j = 0; j < this.gridPointsX - 1; j++) {
        if (i < this.gridPointsLength - 1) {
          line(this.gridPoints[i][j].x, this.gridPoints[i][j].y, this.gridPoints[i + 1][j].x, this.gridPoints[i + 1][j].y)
          this.move(this.gridPoints[i][j], i)
        }
        stroke(80, 0, 0);
        line(this.gridPoints[i][j].x, this.gridPoints[i][j].y, this.gridPoints[i][j + 1].x, this.gridPoints[i][j + 1].y);
      }
    }
    this.angle += 0.01;
  }

  move(point, i) {

    let amp = mouseX / 1000;
    let mouse = createVector(mouseX, mouseY);
    let acc = p5
      .Vector
      .sub(point, mouse);
    acc.normalize();

    // acc.mult(5)
    point.x += sin(this.angle) * acc.x;
    point.y += cos(this.angle) * acc.y;
  }
}

class ImageTweak {
  iamge;
  index = -1;
  sockets = [{}];

  init() {
    loadImage("https://images.unsplash.com/photo-1487266659293-c4762f375955?ixlib=rb-1.2.1&ixid" +
      "=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
      img => {
        this.img = img;
        img.loadPixels();
      });
  }

  unload() {
    this.index = -1;
    this.gridPoints = [];
    this.gridPointsLength = 0
    this.gridPointsX = 0;
    this.gridPointsY = 0;
    this.detachSockets();
  }
  attachSockets() {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.on(thisSocket.name, thisSocket.method);
    }
  }
  detachSockets() {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.removeListener(thisSocket.name, thisSocket.method);
    }
  }

  draw() {
    if (this.img) {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          stroke(this.img.pixels[i + j])
          point(i, j)
        }
      }
    }
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
        text(thisQuake.title, x, height / 2 - (i * 30));
        ellipse(x, height / 2, thisQuake.mag * 25)
      }
    }
  }
}

class Rings extends Sketch {
  constructor() {
    super();
    this.funcs = [];
    this.funcsLength = 0;
    this.ringSize = 0;
    this.currentVol = 11;
    this.threshold = 10;
    this.angle = 0.01;
    this.circleWidth = 50;
  }
  init() {
    super.init();
    this.colors = [
      someColor(),
      someColor(),
      someColor(),
      someColor(),
      someColor(),
      someColor(),
      someColor()
    ];
  }
  draw() {
    stroke("blue");
    this.checkVol();
    this.checkDraw();
  }
  checkVol() {
    if (this.currentVol > this.threshold && !this.animationActive) {
      this.centerX = Math.floor(Math.random() * width);
      this.centerY = Math.floor(Math.random() * height);
      this.funcsLength++;
      this.animationActive = true;
    }
  }

  checkDraw() {
    if (this.animationActive) {
      this.drawRings();
    }
  }
  drawRings = () => {
    fill(this.colors[0][0], this.colors[0][1], this.colors[0][2]);
    ellipse(this.centerX, this.centerY, this.ringSize + (this.circleWidth * 6));
    fill(this.colors[1][0], this.colors[1][1], this.colors[1][2]);
    ellipse(this.centerX, this.centerY, this.ringSize + (this.circleWidth * 5));
    fill(this.colors[2][0], this.colors[2][1], this.colors[2][2]);
    ellipse(this.centerX, this.centerY, this.ringSize + (this.circleWidth * 4));
    fill(this.colors[3][0], this.colors[3][1], this.colors[3][2]);
    ellipse(this.centerX, this.centerY, this.ringSize + (this.circleWidth * 3));
    fill(this.colors[4][0], this.colors[4][1], this.colors[4][2]);
    ellipse(this.centerX, this.centerY, this.ringSize + (this.circleWidth * 2));
    fill(this.colors[5][0], this.colors[5][1], this.colors[5][2]);
    ellipse(this.centerX, this.centerY, this.ringSize + (this.circleWidth));
    fill(this.colors[6][0], this.colors[6][1], this.colors[6][2]);
    ellipse(this.centerX, this.centerY, this.ringSize);
    this.ringSize += sin(this.angle * 15) * 20
    this.colors[0][0] += sin(this.angle)
    this.colors[1][0] += sin(this.angle)
    this.colors[3][0] += sin(this.angle)
    this.colors[4][0] += sin(this.angle)
    this.colors[5][0] += sin(this.angle)
    this.colors[6][0] += sin(this.angle)
    this.angle += 0.01
    if (this.ringSize > height) {
      this.ringSize = 0;
      this.angle = 0.01;
      this.animationActive = false;
    }
  }
}

class Sin extends Sketch {
  constructor() {
    super();
    this.angle = 0.01
  }
  init() {
    super.init();
  }

  draw() {
    stroke("black")
    beginShape();
    for (let i = 0; i < 360; i++) {
      let x = map(i, 0, 360, 0, width);
      let y = height / 2 + sin(i * (mouseY / 100)) * (mouseX / 10)
      vertex(x, y)
      this.angle += 0.01
    }
    endShape()
  }
}

class Rain extends Sketch {
  constructor() {
    super();
    this.dots = [];
    this.rowsAmount = 25;
    this.dotsAmount = 10;
    this.globalChange = 1;
    this.period = 1000;
    this.xspacing = 10;
    this.speed = 0.01;
    this.rateChange = (TWO_PI / this.period) * this.xspacing;
    this.amplitude = 8;
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
          .push(new Objects.Dot({
            x: x,
            y: y,
            size: 2,
            fill: "#abcdef",
            // fill: someColor(),
            stroke: [0, 0, 0, 0],
            stroke: [0, 0, 0, 0],
            variant: 1
          }))
      }
    }
  }

  controls() {
    return {
      changeSpeed: (val) => this.speed = sin(val),
      changePeriod: (val) => this.period = val,
      changeSpacing: (val) => this.xspacing = val,
      changeAmp: (val) => this.amplitude = val
    }
  }

  draw() {
    <<
    <<
    <<
    < HEAD
    this.controls().changeSpacing(mouseX / 100000)
    this.controls().changePeriod(mouseY / 100000) ===
      ===
      =
      this.controls().changeSpacing(mouseX / 1000)
    this.controls().changePeriod(mouseY / 1000) >>>
      >>>
      >
      a3c3fa0b66fc606068e88abf9367975da2fae2ed
    this.rateChange = (PI / this.period) * this.xspacing;
    this.globalChange += this.speed;
    let change = this.globalChange;
    for (let i = 0; i < this.rowsAmount; i++) {
      for (let j = 0; j < this.dotsAmount; j++) {
        let thisDot = this.dots[i][j];
        // thisDot.variant = Math.random(10);
        thisDot.size = Math.round(sin(change * i) * this.amplitude * thisDot.variant) * 5;
        thisDot.draw();
        change += this.rateChange;
      }
    }
  }
  mouseClicked() {
    this
      .controls()
      .changeAmp(this.amplitude + 1)
  }
  keyPressed(e) {
    if (e.key == "g") {
      this
        .controls()
        .changeAmp(this.amplitude - 1)
    }
  }
}

class Shader101 extends Sketch {
  constructor() {
    super();
    this.lightSpeed = 0.01;
    this.pointsAmt = 1;
    this.diameter = 200;
  }

  sockets = [{
      name: '/1/xy1',
      method: (val) => {
        this.points[0] = [val.args[1], val.args[0]]
      }
    },
    {
      name: '/1/multixy1/1',
      method: (val) => {
        this.points[0] = [val.args[1], val.args[0]]
      }
    },
    {
      name: '/1/multixy1/2',
      method: (val) => {
        this.points[1] = [val.args[1], val.args[0]]
      }
    },
    {
      name: '/1/multixy1/3',
      method: (val) => {
        this.points[2] = [val.args[1], val.args[0]]
      }
    },
  ]

  init() {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    noStroke();
    this.points = [
      [0.5, 0.5]
    ]
  }

  draw() {
    background("black");
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      point[0] += sin(this.lightSpeed) * 5;
      point[1] += cos(this.lightSpeed) * 2;
      // theShader.setUniform("u_point" + i, this.plot(point));
      pointArray.push(this.plot(point));
      // Can't manage to set the whole array at once using the p5 setUniform method, so setting them directely and individually.
      // I made adjustments to p5.js to put gl and glShaderProgram on the window object.
      var someVec2Element0Loc = window.gl.getUniformLocation(window.glShaderProgram, "u_points[" + i + "]");
      window.gl.uniform2fv(someVec2Element0Loc, point); // set element 0
    }


    theShader.setUniform("u_spread", (1000 / this.pointsAmt) * (this.diameter)); // Get this equation correct.

    theShader.setUniform("u_resolution", [width, height]);
    theShader.setUniform("u_mouse", [
      map(mouseX, width, 0, 1.0, 0.0),
      map(mouseY, 0, height, 1.0, 0.0)
    ]);
    this.shaderBox.shader(theShader);
    fill("#abcdef");
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);

    this.lightSpeed += 0.01;

  }

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

const Objects = {
  Dot: class {
    constructor(params) {
      this.stroke = typeof params.stroke == "object" ? [params.stroke[0], params.stroke[1], params.stroke[2]] :
        params.stroke || 0;
      this.fill = typeof params.fill == "object" ? [params.fill[0], params.fill[1], params.fill[2]] :
        params.fill || 0;
      this.x = params.x || 0;
      this.y = params.y || 0;
      this.size = params.size || 10;
      this.variant = params.variant || 1;
    }
    draw() {
      stroke(this.stroke);
      fill(this.fill);
      ellipse(this.x, this.y, this.size);
    }
  },
  Plane: class {
    constructor() {}
  }
}

function ease(val, low, high) {
  return easeInOutQuad(normalize(val))
}

function normalize(val) {
  return (val - 0) / (1 - 0);
}

let easeInOutQuad = function (t) {
  return t < .5 ?
    2 * t * t :
    -1 + (4 - 2 * t) * t
}