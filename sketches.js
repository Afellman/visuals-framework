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
    this.waves = [];
    this.time = 0;
  }

  init() {
    super.init();
    this.waves.push(new Objects.SineWave(50, 0.004))
    this.waves.push(new Objects.SineWave(100, 0.01))
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
    endShape()
    translate(width, 0)
    scale(-1, 1)
    image(glCanvas, 0, 0, width / 2, height)
    this.time += 0.1
  }

  sockets = [{
      name: '/1/multifader1/1',
      method: (val) => {
        this.amplitude = val.args[0] * 200;
      }
    },
    {
      name: '/1/multifader1/2',
      method: (val) => {
        this.frequency = val.args[0] / 100
      }
    },
    {
      name: '/1/multifader1/3',
      method: (val) => {
        this.speed = val.args[0]
      }
    },
  ]

}

class Rain extends Sketch {
  constructor() {
    super();
    this.dots = [];
    this.rowsAmount = 50;
    this.dotsAmount = 20;
    this.globalChange = 14
    this.period = 0.04;
    this.xspacing = 0.003;
    this.speed = 0.01;
    this.rateChange = (TWO_PI / this.period) * this.xspacing;
    this.amplitude = 2.5;
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
          .push(new Objects.Circle({
            x: x,
            y: y,
            size: 2,
            fill: "#abcdef",
            // fill: someColor(),
            stroke: [
              0, 0, 0, 0
            ],
            stroke: [
              0, 0, 0, 0
            ],
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
    // this.controls().changeSpacing(mouseX / 1000)
    // this.controls().changePeriod(mouseY / 1000)
    this.rateChange = (PI / this.period) * this.xspacing;
    this.globalChange += this.speed;
    let change = this.globalChange;
    for (let i = 0; i < this.rowsAmount; i++) {
      for (let j = 0; j < this.dotsAmount; j++) {
        let thisDot = this.dots[i][j];
        // thisDot.variant = Math.random(10);
        thisDot.size = Math.round(sin(change * i) * this.amplitude) * 5;
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
    this.time = 0;
  }

  sockets = [{
    name: '/1/xy1',
    method: (val) => {
      this.points[0] = [val.args[1], val.args[0]]
    }
  }, {
    name: '/1/multixy1/1',
    method: (val) => {
      this.points[0] = [val.args[1], val.args[0]]
    }
  }, {
    name: '/1/multixy1/2',
    method: (val) => {
      this.points[1] = [val.args[1], val.args[0]]
    }
  }, {
    name: '/1/multixy1/3',
    method: (val) => {
      this.points[2] = [val.args[1], val.args[0]]
    }
  }]
  init() {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    this.points = [
      [0.5, 0.5]
    ]

  }

  draw() {
    // background("black");
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      // theShader.setUniform("u_point" + i, this.plot(point)); Can't manage to set
      // the whole array at once using the p5 setUniform method, so setting them
      // directely and individually. I made adjustments to p5.js to put gl and
      // glShaderProgram on the window object.
      var someVec2Element0Loc = window.gl.getUniformLocation(window.glShaderProgram, "u_points[" + i + "]");
      window.gl.uniform2fv(someVec2Element0Loc, point); // set element 0
    }

    noStroke();
    theShader.setUniform("u_spread", (1000 / this.pointsAmt) * (this.diameter)); // Get this equation correct.
    theShader.setUniform("u_resolution", [width, height]);
    theShader.setUniform("u_time", this.time);
    theShader.setUniform("u_mouse", [
      map(mouseX, width, 0, 1.0, 0.0),
      map(mouseY, 0, height, 1.0, 0.0)
    ]);
    this.shaderBox.shader(theShader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);
    this.time += 0.01
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

class Ripples extends Sketch {
  constructor() {
    super();
    this.circles = [];
  }

  init() {
    super.init();
    this.angle = 0.01
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

class Connecter extends Sketch {
  constructor() {
    super();
    this.pointAmt = 500;
    this.topPoints = [];
    this.bottomPoints = [];
    this.diameter = 50;
    this.curl = 300;
    this.proximity = 500;
    this.strokeWeight = 1;
    this.multiplier = 10;
  }

  sockets = [{
    name: '/1/multifader1/1',
    method: (val) => {
      this.circleDiameter = val.args[0] * 500;
    }
  }, {
    name: '/1/multifader1/2',
    method: (val) => {
      this.curl = val.args[0] * 500;
    }
  }, {
    name: '/1/multifader1/3',
    method: (val) => {
      this.freq = val.args[0]
    }
  }, {
    name: '/1/multifader1/4',
    method: (val) => {
      this.points[2] = [val.args[1], val.args[0]]
    }
  }, {
    name: '/1/multifader1/5',
    method: (val) => {
      this.points[2] = [val.args[1], val.args[0]]
    }
  }]
  init() {
    super.init();
    let color1 = someColor();
    let color2 = someColor();
    for (let i = 0; i < this.pointAmt; i++) {
      let x = width / this.pointAmt * i;
      let y = 0;
      this.topPoints.push({
        x: x,
        y: y,
        color: color1
      });
      this.bottomPoints.push({
        x: width - x,
        y: height,
        color: color2
      });
    }
    this.freq = 0.01;
  }

  draw() {
    strokeWeight(this.strokeWeight);
    for (let i = 0; i < this.pointAmt; i++) {
      let bottomPoint = this.bottomPoints[i];
      let topPoint = this.topPoints[i];
      let orbit = sin(this.freq) + sin(i * 10) * this.curl;
      let circle = sin(i) * this.circleDiameter;
      let x = width / 2 + orbit + circle
      let y = (height / 2 + cos(this.freq) + cos(i * this.multiplier) * this.curl) + cos(i) * this.circleDiameter;
      if (dist(x, y, topPoint.x, topPoint.y) < this.proximity) {
        stroke(topPoint.color[0], topPoint.color[1], topPoint.color[2], 80)
        line(Math.round(topPoint.x), Math.round(topPoint.y), Math.round(x), Math.round(y))
      }
      if (dist(x, y, bottomPoint.x, bottomPoint.y) < this.proximity) {
        stroke(bottomPoint.color[0], bottomPoint.color[1], bottomPoint.color[2], 80)
        line(Math.round(bottomPoint.x), Math.round(bottomPoint.y), Math.round(x), Math.round(y))
      }
      ellipse(x, y, 10)
    }
  }

  mouseClicked() {}
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
      this.x = x;
      this.y = y;
      this.color = color
    }

    draw() {
      stroke(this.color);
      point(this.x, this.y)
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
    }
    draw() {
      stroke(this.stroke);
      fill(this.fill);
      ellipse(this.x, this.y, this.size);
    }
  },
  Plane: class {
    constructor() {}
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