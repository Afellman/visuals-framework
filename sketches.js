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
  sockets: [
    { address: "/1/jitter", method: this.jitter }
  ],
  init: function (index) {
    this.index = index;
    // this.setupOsc();
    this.linesPerRow = width / (this.lineLength / 2 + this.spacing);
    this.rows = height / (this.lineLength / 2 + this.spacing);
    let source = new p5.AudioIn();
    this.amplitude = new p5.Amplitude(0.9);
    this.amplitude.setInput(source);
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
      this.lines.push(row);

    }
  },
  unload: function () {
    this.lines = [];
    this.index = -1;
    this.detachSockets();
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
          this.lines[i][j].rotate(i, j, this.lines);
        }
        this.lines[i][j].display();
        if (this.waveOn) {
          this.lines[i][j].wave()
        }
      }
    }
  },
  controls: {
    jitter: (val) => {
    },
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
      // strokeWeight(10)
      // if (Math.random() * 10 > 10) {
      //   this.length = 6;
      // } else {
      //   this.length = 12
      // }
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
}


let grid = {
  index: -1,
  sockets: [
    {}
  ],
  gridPointsLength: 0,
  gridPointsX: 0,
  gridPointsY: 0,
  gridPoints: [],
  angle: 0.01,
  init: function (index) {
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
      this.gridPoints.push(row);
    }
    this.gridPointsLength = this.gridPoints.length;
  },
  unload: function () {
    this.index = -1;
    this.gridPoints = []
    this.detachSockets();
  },
  attachSockets: function () {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.on(thisSocket.name, thisSocket.method);
    }
  },
  detachSockets: function () {
    let length = this.sockets.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.sockets[i];
      socket.removeListener(thisSocket.name, thisSocket.method);
    }
  },

  draw: function () {
    this.move();
    for (let i = 1; i < this.gridPointsLength; i++) {
      for (let j = 0; j < this.gridPointsX - 1; j++) {
        if (i < this.gridPointsLength - 1) line(this.gridPoints[i][j].x, this.gridPoints[i][j].y, this.gridPoints[i + 1][j].x, this.gridPoints[i + 1][j].y)
        stroke(0)
        line(this.gridPoints[i][j].x, this.gridPoints[i][j].y, this.gridPoints[i][j + 1].x, this.gridPoints[i][j + 1].y);
      }
    }

    // for (let i = 0; i < this.gridPointsLength - 1; i++) {
    //   if (i % this.gridPointsX) {
    //     line(this.gridPoints[i].x, this.gridPoints[i].y, this.gridPoints[i + 1].x, this.gridPoints[i + 1].y);
    //   }
    // }
  },

  move: function () {
    let speed = mouseY / 1000;
    let amp = mouseX / 1000
    for (var i = 0; i < this.gridPointsLength; i++) {
      this.gridPoints[i].x += sin(this.angle + i) * 10;
      this.gridPoints[i].y += sin(this.angle + i) * 10;
    }
    for (let i = 1; i < this.gridPointsLength; i++) {
      for (let j = 0; j < this.gridPointsX - 1; j++) {
        this.gridPoints[i][j].x = this.gridPoints[i][j].x + sin(this.angle + i) * amp;
        this.gridPoints[i][j].y = this.gridPoints[i][j].y + cos(this.angle + i) * amp;
      }
    }

    this.angle += speed
  }
}