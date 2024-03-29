/**
 * TODO:
 *  1. Flow osc
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
  waveVol: 0.0,
  waveAmt: 1,
  waveOn: false,
  sockets: [
    {
      address: "/1/jitter",
      method: this.jitter,
    },
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
      let row = [];
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
    socket.removeListener("/1/jitter", this.jitter);
  },
  draw: function () {
    let vol = map(this.amplitude.getLevel(), 0, 1, 50, 255);
    stroke(vol);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.linesPerRow; j++) {
        if (Math.random() * 100 > 99.99) {
          this.lines[i][j].rotate(i, j, this.lines);
        }
        this.lines[i][j].display();
        if (this.waveOn) {
          this.lines[i][j].wave();
        }
      }
    }
  },
  controls: {
    jitter: (val) => {},
    setWaveVol: (val) => (waveVol = val),
    toggleWave: () => (waveOn = !waveOn),
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
      lines[i - 1] && (lines[i - 1][j].r += HALF_PI);
      lines[i + 1] && (lines[i + 1][j].r += HALF_PI);

      lines[i - 1] && (lines[i - 1][j].r += HALF_PI);
      lines[i + 1] && (lines[i + 1][j].r += HALF_PI);

      lines[i][j - 1] && (lines[i][j - 1].r += HALF_PI);
      lines[i][j + 1] && (lines[i][j + 1].r += HALF_PI);

      lines[i][j].r += HALF_PI;
    }

    display(r) {
      push();
      translate(this.x, this.y);
      // strokeWeight(10) if (Math.random() * 10 > 10) {   this.length = 6; } else {
      // this.length = 12 }
      strokeWeight(3);
      rotate(this.r);
      line(-this.length, -this.length, this.length, this.length);
      pop();
    }

    wave(waveSpeed, waveVol) {
      this.x = this.x + Math.sin(this.y + waveSpeed) * waveAmt;
      waveSpeed += waveVol;
      // this.y += this.x + Math.sin(this.y / 100 + waveSpeed) * 10;
    }
  },
}; // Refactor using Sketch as parent.

class Sketch {
  constructor(obj) {
    if (obj && typeof obj == "object") {
      for (let i in obj) {
        this[i] = obj[i];
      }
      this.loaded = true;
    }

    this.params = { faders: [] };
    /** Bind socket or midi messages in here */
    this.listeners = [];
    this.easingValues = {};
    this.easing = 0.05;
  }

  init() {
    this.attachListeners();
  }

  unload() {
    socket.emit("updateOsc", {
      scene: this.setIndex,
      oscObj: "opacity",
      value: 0,
    });
    this.detachListeners();
  }

  setEase(value, key) {
    this.easingValues[key] = value;
  }

  easeParams() {
    for (let i in this.easingValues) {
      // const actualValue = this.params.faders[i];
      const actualValue = this.params[i];
      const target = this.easingValues[i];
      const diff = target - actualValue;
      if (Math.abs(diff) < 0.00001) {
        delete this.easingValues[i];
        // this.params.faders[i] = target;
        this.params[i] = target;
      } else {
        // this.params.faders[i] += diff * glEasing;
        this.params[i] += diff * glEasing;
      }
    }
  }

  attachListeners() {
    // Attaching sockets to all fader params
    for (let i in this.params.faders) {
      socket.on(`/${this.setIndex}/${i}`, (val) => {
        const param = val.address.split("/")[2];
        this.setEase(val.args[0], param);
      });
    }

    for (let i = 0; i < this.listeners.length; i++) {
      // Midi listeners
      const thisListener = this.listeners[i];
      // Faderfox controls
      // if (thisListener.midiNote) {
      //   let thisIndex = thisListener.midiNote + (this.setIndex * 8)
      //   if (this.setIndex < 5) {
      //     if (thisListener.isButton) {
      //       midi179[thisIndex + 48].method = thisListener.midiMethod;
      //     } else {
      //       midi179[thisIndex].method = thisListener.midiMethod;
      //       midi179[thisIndex].velocity = typeof thisListener.initialVal == "function" ? thisListener.initialVal() : 0;
      //     }
      //   } else {
      //     if (thisListener.isButton) {
      //       midi180[thisIndex + 48].method = thisListener.midiMethod;
      //     } else {
      //       midi180[thisIndex].method = thisListener.midiMethod;
      //       midi180[thisIndex].velocity = typeof thisListener.initialVal == "function" ? thisListener.initialVal() : 0;
      //     }
      //   }
      // }

      if (thisListener.socketName && thisListener.socketMethod) {
        socket.on(
          `/${this.setIndex}/${thisListener.socketName}`,
          thisListener.socketMethod
        );
      }
    }

    this.updateOsc();

    socket.emit("updateOsc", {
      scene: this.setIndex,
      oscObj: "on",
      value: 1,
    });
  }

  updateOsc() {
    // Syncs iPad with scenes starting values
    socket.emit("updateOsc", {
      scene: this.setIndex,
      params: this.params.faders,
    });
  }

  detachListeners() {
    let length = this.listeners.length;
    for (let i = 0; i < length; i++) {
      let thisSocket = this.listeners[i];
      socket.removeListener(thisSocket.socketName, thisSocket.method);
    }
    socket.emit("updateOsc", {
      scene: this.setIndex,
      oscObj: "on",
      value: 0,
    });
  }

  mouseClicked() {}
  keyPressed() {}
  save() {
    const ret = {};
    for (let key in this) {
      if (
        typeof this[key] !== "function" &&
        typeof this[key] !== "object" &&
        !Array.isArray(this[key])
      )
        ret[key] = this[key];
    }
    return ret;
  }
}

class BGShader extends Sketch {
  // Always loaded. Gives more FPS...??
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
    this.points = [[0.5, 0.5]];
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
    this.shader.setUniform("u_color", glBackground); // Get this equation correct.
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);
    this.time += 0.01;
  }

  listeners = [];
}

class Starry extends Sketch {
  // Scene 1. Maped
  constructor() {
    super();
    this.params = {
      faders: {
        starAmt: 200,
        speed: 10,
        size: 1,
        color: 1,
        r: 255,
        g: 255,
        b: 255,
      },
    };
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
    let { r, g, b, size, starAmt, speed } = this.params.faders;
    let thisPoint = {};
    noStroke();

    for (let i = 0; i < starAmt; i++) {
      thisPoint = this.points[i];
      if (thisPoint == undefined) {
        thisPoint = this.addPoint();
      }
      let pointSize =
        dist(thisPoint.pos.x, thisPoint.pos.y, width / 2, height / 2) *
        (size / 100) *
        thisPoint.size;
      let acc = p5.Vector.sub(
        thisPoint.pos,
        createVector(width / 2, height / 2)
      );
      thisPoint.pos.add(acc.div(400 - speed));
      fill(
        r * thisPoint.color,
        g * thisPoint.color,
        b * thisPoint.color,
        this.opacity
      );
      ellipse(thisPoint.pos.x, thisPoint.pos.y, pointSize);
      if (
        thisPoint.pos.x > width ||
        thisPoint.pos.x < 0 ||
        thisPoint.pos.y > height ||
        thisPoint.pos.y < 0
      ) {
        this.points.splice(i, 1);
        starAmt--;
        this.addPoint();
      }
    }
  }
  addPoint() {
    let { starAmt } = this.params.faders;
    let pointSize = 1;
    let x = map(Math.random(), 0, 1, width / 2 - 50, width / 2 + 50);
    let y = map(Math.random(), 0, 1, height / 2 - 50, height / 2 + 50);
    let vec = createVector(x, y);
    if (frameCount % 5 == 0) {
      pointSize *= Math.random() * 2.5;
    }
    let newPoint = {
      pos: vec,
      color: 200 + Math.floor(Math.random() * 55) + 1,
      size: pointSize,
    };
    this.points.push(newPoint);
    starAmt++;
    return newPoint;
  }
}

class Sun extends Sketch {
  // Scene 2. Maped
  constructor() {
    super();
    this.sceneNum = 2;
    this.params = {
      faders: {
        amp: 20,
        ringAmt: 25,
        speed: 0,
        r: 100,
        g: 53,
        b: 0,
      },
    };
    this.waves = [
      (time) => Math.sin(PI * 2 * time * 838),
      (time) => Math.sin(PI * 2 * time * 522),
      (time) => Math.sin(PI * 2 * time * 1184),
      (time) => Math.sin(PI * 2 * time * 246),
      (time) => Math.sin(PI * 2 * time * 504),
      (time) => Math.sin(PI * 2 * time * 574),
      (time) => Math.sin(PI * 2 * time * 129),
      (time) => Math.sin(PI * 2 * time * 592),
      (time) => Math.sin(PI * 2 * time * 188),
      (time) => Math.sin(PI * 2 * time * 732),
    ];
    this.colors = [];

    for (let i = 0; i < 10; i++) {
      this.listeners.push({
        socketName: "addSun" + (i + 1),
        socketMethod: (val) => {
          if (val.args[0]) {
            this.addSun(val.args[0]);
          }
        },
      });
      this.colors.push(someColor(1));
      socket.emit("updateOsc", {
        oscObj: "addSun" + (i + 1),
        value: 0,
        scene: 1,
      });
    }
  }

  init() {
    super.init();
    this.freq = 21;
    this.opacity = 0;
    this.time = this.params.faders.speed;
    this.bigSun = null;
    this.suns = new Array(10);
  }

  draw() {
    let { ringAmt } = this.params.faders;
    let size;
    // noStroke();
    stroke(0, 0);
    for (let j = 0; j < 10; j++) {
      const sun = this.suns[j];
      if (sun) {
        const y = sun.y;
        const x = sun.x;
        const sine = sun.sine(this.time);
        const amp = sun.amp;
        for (let i = 0; i < ringAmt; i++) {
          let opacVariance = i;
          size = sun.life / 5 + i * 10 + sine * amp;
          if (i == 0) {
            opacVariance = 0.9;
          }
          fill(
            sun.color[0] - 50,
            sun.color[1] - 50,
            sun.color[2] - 50,
            (sun.opacity * this.opacity) / opacVariance
          );
          ellipse(x, y, size);
        }
        sun.life -= 0.7;
        if (sun.life < 200) {
          sun.opacity -= 0.005;
        }
        if (sun.life <= 0) {
          this.removeSun(sun.num);
        }
      }
    }

    if (this.bigSun) {
      for (let i = 0; i < ringAmt; i++) {
        let opacVariance = i;
        size =
          200 + i * 10 + this.bigSun.sine(this.time) * this.params.faders.amp;
        if (i == 0) {
          opacVariance = 0.9;
        }
        fill(
          this.bigSun.color[0],
          this.bigSun.color[1],
          this.bigSun.color[2],
          (this.bigSun.opacity * this.opacity) / opacVariance
        );
        ellipse(width / 2, height / 2, size);
      }
    }
    this.time = frameCount / 100000;
  }

  addSun(num) {
    let position = { x: 0, y: 0 };
    position.x = random(0 + 225, width - 225);
    position.y = random(0 + 200, height - 200);

    const sun = {
      amp: this.params.faders.amp,
      sine: this.waves[num - 1],
      life: 800,
      x: position.x,
      y: position.y,
      num: num,
      color: this.colors[num - 1],
      opacity: 1,
    };

    this.suns[num - 1] = sun;
  }

  removeSun(index) {
    this.suns[index - 1] = null;
    socket.emit("updateOsc", { oscObj: "addSun" + index, value: 0, scene: 1 });
  }

  listeners = [
    {
      socketName: "bigSun",
      socketMethod: (val) => {
        if (val.args[0]) {
          let position = { x: 0, y: 0 };
          position.x = width / 2;
          position.y = height / 2;
          const sun = {
            amp: this.params.faders.amp,
            sine: (time) => Math.sin(PI * 2 * time * 164),
            life: 1500,
            x: position.x,
            y: position.y,
            num: 11,
            color: [100, 53, 0],
            opacity: 1,
          };

          this.bigSun = sun;
        } else {
          this.bigSun = null;
        }
      },
    },
    {
      socketName: "bigSunOpacity",
      socketMethod: (val) => {
        this.bigSun.opacity = val.args[0];
      },
    },
  ];
}

class RopeSwing extends Sketch {
  // Scene 3. Maped
  constructor(obj) {
    super(obj);
    this.params = {};
    this.sceneNum = 3;
    if (!this.loaded) {
      this.lines = [];
      this.params = {
        faders: {
          // Initializing with one line.
          line1R: 255,
          line1G: 255,
          line1B: 255,
          line1Speed: 0.06,
          line2R: 255,
          line2G: 255,
          line2B: 255,
          line2Speed: 0.06,
          line3R: 255,
          line3G: 255,
          line3B: 255,
          line3Speed: 0.06,
          line4R: 255,
          line4G: 255,
          line4B: 255,
          line4Speed: 0.06,
          weight: 3,
        },
        buttons: {
          lineAmt: 1,
        },
      };
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
      const speed = this.params.faders[`line${j + 1}Speed`];

      stroke(red, green, blue, this.opacity);
      strokeWeight(weight);
      for (let i = 0; i < this.res; i++) {
        let x = (width / 100) * i;
        let y =
          height / 2 +
          -Math.abs(Math.sin((2 * PI * x * thisLine.freq) / (width * 2))) *
            (Math.sin(thisLine.time) * thisLine.maxAmpY);
        line(prevX, prevY, x, y);
        prevX = x;
        prevY = y;
        if (i == this.res - 1) {
          prevX = 0;
          prevY = height / 2;
        }
      }
      thisLine.time += speed / 6;
    }
  }

  addLine() {
    const line = {
      freq: 1,
      maxAmpY: height / 2,
      speed: 0.01,
      time: 0.01,
      color: [255, 255, 255],
    };
    this.lines.push(line);
    return line;
  }

  listeners = [
    {
      socketName: "lineAmt",
      socketMethod: (val) => {
        if (val.args[0] == 1) {
          this.addLine();
          this.params.buttons.lineAmt++;
        } else if (val.args[0] == -1) {
          this.lines.splice(this.lineAmt, 1);
          this.params.buttons.lineAmt--;
        }
      },
    },
  ];
}

class Proximity extends Sketch {
  // Maped
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.centerPoints = [];
    if (!this.loaded) {
      this.params = {
        faders: {
          pointAmt: 100,
          circleDiameter: 0,
          curl: 220,
          proximity: 0,
          speed: 0.0,
          circleSize: 3,
          multiSpeed: 0,
        },
      };
      this.multiSin = false;
      this.pointMax = 200;
      this.multiplier = 10;
      this.opacity = 0;
      this.freq = 0.01;
    }
  }

  init() {
    super.init();
    for (let i = 0; i < this.pointMax; i++) {
      let orbit =
        Math.sin(this.freq + i * 10) * this.params.faders.circleDiameter;
      let circle = Math.sin(i) * this.params.faders.curl;
      let orbitY = cos(this.freq + i * this.multiplier);
      let circleY = cos(i) * this.params.faders.curl;
      this.centerPoints.push({
        pos: {
          x: width / 2 + orbit + circle,
          y: height / 2 + orbitY * this.params.faders.circleDiameter + circleY,
        },
        size: 5,
        color: [255, 255, 255],
      });
    }
  }

  draw() {
    strokeWeight(1);
    let centerPoint = {};
    let orbit;
    let circle;
    let orbitY;
    let circleY;
    let x;
    let y;
    const { speed, curl, circleDiameter, circleSize, pointAmt, proximity } =
      this.params.faders;
    const { opacity, centerPoints, freq, multiplier } = this;
    for (let i = 0; i < pointAmt; i++) {
      fill(255, 255, 255, opacity);
      stroke(255, 255, 255, opacity);
      centerPoint = centerPoints[i];
      orbit = Math.sin(freq + i * 10) * curl;
      circle = Math.sin(i) * circleDiameter;
      orbitY = cos(freq + i * multiplier);
      circleY = cos(i) * circleDiameter;
      x = width / 2 + orbit + circle;
      y = height / 2 + orbitY * curl + circleY;
      centerPoint.pos.x = x;
      centerPoint.pos.y = y;
      centerPoint.size = circleSize;
      ellipse(Math.round(x), Math.round(y), circleSize);
      stroke(255, 255, 255, opacity * 0.2);
      for (let j = 0; j < pointAmt; j++) {
        if (
          dist(x, y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y) <
          proximity
        ) {
          // Connects all dots together
          line(x, y, this.centerPoints[j].pos.x, this.centerPoints[j].pos.y);
        }
      }
    }

    this.multiplier +=
      Math.sin((frameCount * this.params.faders.multiSpeed) / 1000) / 100;
    this.freq += speed / 20;
  }

  listeners = [
    {
      socketName: "resetMulti",
      socketMethod: (val) => {
        this.multiplier = 10;
      },
    },
    {
      socketName: "stopMulti",
      socketMethod: (val) => {
        this.params.faders.multiSpeed = 0;
        this.updateOsc();
      },
    },
  ];
  mouseClicked() {}
}

class Geometry extends Sketch {
  // Scene 5. Maped.
  constructor() {
    super();
    if (!this.loaded) {
      this.params = {
        faders: {
          angle: 1.2666,
          divider: 0.65,
          length: 220,
          movement: 0,
        },
      };
    }
    this.movement = 0.001;
    this.sceneNum = 5;
    this.startingAngle = this.angle;
    // this.opacity = 0;
    this.opacity = 255;
  }
  init() {
    super.init();
  }
  draw() {
    let r = 150 + Math.sin(frameCount / 200) * 50;
    let b = 200 + Math.sin(frameCount / 100) * 50;
    let g = 100 + Math.sin(frameCount / 300) * 50;
    stroke(r, g, b, this.opacity);
    translate(width / 1.5, height);
    this.branch(this.params.faders.length, 0);
    // this.angle = this.startingAngle * frameCount / 500;
    this.movement += this.params.faders.movement / 1000;
  }
  branch(len, i) {
    i++;
    line(0, 0, 0, -len);
    translate(0, -len);
    if (len > 4) {
      push();
      rotate(this.params.faders.angle);
      this.branch(len * this.params.faders.divider, i);
      pop();
      push();
      rotate(
        noise(
          (frameCount * this.movement * i) / 10,
          (frameCount * this.movement * i) / 10
        ) - this.params.faders.angle
      );
      this.branch(len * this.params.faders.divider, i);
      pop();
    }
  }
  listeners = [
    {
      socketName: "stopMove",
      socketMethod: (val) => {
        console.log("stop");
        this.params.faders.movement = 0;
        this.updateOsc();
      },
    },
  ];
}

class GoldenSpiral extends Sketch {
  // Scene 6. Maped
  constructor(color = 255) {
    super();
    if (!this.loaded) {
      this.params = {
        faders: {
          speed: 0.0,
          size: 10,
          stepSize: 6.98,
          angle: 3.147,
          number: 159,
        },
      };
    }
    this.color = [255, 255, 255];
    this.sceneNum = 6;
    this.time = 0;
    this.opacity = 0;
  }
  listeners = [{}];
  init() {
    super.init();
  }

  draw() {
    // background(0);
    fill(255, 10);
    stroke(this.color[0], this.color[1], this.color[2], this.opacity);
    translate(width / 2, height / 2);
    // this.number = frameCount;
    for (var i = 0; i < this.params.faders.number; i++) {
      rotate(this.time);
      translate(0, i * this.params.faders.stepSize);
      rotate(this.params.faders.angle);
      line(0, 0, -this.params.faders.size, this.params.faders.size);
      // triangle(-this.size, 0, 0, this.size, this.size, 0)
      // ellipse(0, 0, this.size);						// draw an ellipse (circle)
      // rect(0, 0, this.size, this.size); 					// draw a rectangle
    }
    this.time += this.params.faders.speed / 1000;
  }

  listeners = [
    {
      socketName: "colorToggle",
      socketMethod: (val) => {
        if (val.args[0]) {
          this.color = [58, 19, 6];
        } else {
          this.color = [255, 255, 255];
        }
      },
    },
  ];
}

class SineWaves extends Sketch {
  // Scene 7. Maped
  constructor(obj) {
    super(obj);
    if (!this.loaded) {
      this.time = 0;
      this.params = {
        faders: {
          freq1: 0.004,
          amplitude1: 50,
          freq2: 0.01,
          amplitude2: 75,
          freq3: 0.01,
          amplitude3: 15,
          colorSpeed: 0.01,
        },
      };
    }
    this.color1;
    this.sceneNum = 7;
    this.opacity = 0;
    this.color = someColor(2);
  }

  init() {
    super.init();
  }

  draw() {
    noStroke();
    beginShape();
    const r =
      this.color[0] +
      Math.sin((frameCount * this.params.faders.colorSpeed) / 2) * 50;
    const g =
      this.color[1] +
      Math.sin((frameCount * this.params.faders.colorSpeed) / 3) * 50;
    const b =
      this.color[2] +
      Math.sin((frameCount * this.params.faders.colorSpeed) / 4) * 50;
    fill(r, g, b, this.opacity);
    for (let i = 0; i < 360; i++) {
      let x = map(i, 0, 360, 0, width);
      let y = height / 2;
      let n = i * 0.005;
      for (let j = 1; j < 4; j++) {
        const thisFreq = this.params.faders["freq" + j];
        const thisAmp = this.params.faders["amplitude" + j];
        y +=
          Math.sin(2 * PI * thisFreq * (i + this.time) + 1) *
          thisAmp *
          (1 + noise(n, n));
      }
      vertex(x, y);
    }
    endShape();
    this.time += 0.1;
  }

  listeners = [
    {
      socketName: "/1/multifader1/1",
      method: (val) => {
        this.amplitude = val.args[0] * 200;
      },
    },
    {
      socketName: "/1/multifader1/2",
      method: (val) => {
        this.frequency = val.args[0] / 100;
      },
    },
    {
      socketName: "/1/multifader1/3",
      method: (val) => {
        this.speed = val.args[0];
      },
    },
  ];
}

class Orbitals extends Sketch {
  // Scene 8. Maped. Needs word
  constructor() {
    super();
    this.params = {
      faders: {
        spinnerAmount: 1000,
        ampX: width / 4,
        ampY: height / 2,
        wobbleX: 0,
        wobbleY: 1,
        freqX: 1,
        freqY: 1,
        speed: 0.1,
      },
    };
    this.spinners = [];
    this.sceneNum = 8;
    this.opacity = 0;
  }

  init() {
    super.init();
    for (let i = 0; i < this.params.faders.spinnerAmount; i++) {
      let x = width / 2 + Math.sin(Math.random()) * (width / 4);
      const y = height / 2 + cos(Math.random()) * (i * 3);
      const newOrbital = { color: someColor(2), pos: createVector(x, y) };
      // const newOrbital = new Objects.Point(x, y, someColor(2));
      newOrbital.speed = Math.random() / 3;
      newOrbital.weight = Math.random() * 10;
      newOrbital.index = i;
      this.spinners.push(newOrbital);
    }
  }

  draw() {
    stroke("grey");
    for (let i = 0; i < this.params.faders.spinnerAmount; i++) {
      let thisSpinner = this.spinners[i];
      const changeX =
        frameCount * this.params.faders.speed * this.params.faders.freqX;
      const changeY =
        frameCount * this.params.faders.speed * this.params.faders.freqY;
      const startX = width / 2;
      const startY = height / 2;
      const sinX = Math.sin(changeX * thisSpinner.speed);
      const cosY = cos(changeY * thisSpinner.speed);
      thisSpinner.pos.x =
        startX +
        sinX * this.params.faders.ampX -
        i * this.params.faders.wobbleX;
      thisSpinner.pos.y =
        startY +
        cosY * (this.params.faders.ampY - i * this.params.faders.wobbleY);
      strokeWeight(thisSpinner.weight);
      stroke(
        thisSpinner.color[0],
        thisSpinner.color[1],
        thisSpinner.color[2],
        this.opacity
      );
      point(thisSpinner.pos.x, thisSpinner.pos.y);
    }
  }
}

class LinesShader extends Sketch {
  // Scene 9. Maped. Needs work.

  constructor(img) {
    super();
    this.params = {
      faders: {
        xOff: 0,
        yOff: 0,
        amp: 0,
        noise: 0,
        freq: 0,
        speed: 0,
      },
    };
    this.freq = 0;
    this.linesShader;
    this.img = images[6];
    this.direction = 1;
    this.opacity = 0;
    this.sceneNum = 9;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(width, height, WEBGL);
    this.time = 0;
    this.loops = 4;
    this.cray = 0.0;
    this.shader = this.shaderBox.createShader(
      shaders[1]._vertSrc,
      shaders[1]._fragSrc
    );
    this.shaderPath = "./shaders/movingLines.frag";
    this.graph = createGraphics(width, height);
  }

  draw() {
    // linesShader.setUniform("u_color", [0.0, 1.0, 0.0, 1.0]) // Get this equation correct.
    noStroke();
    this.graph.image(glCanvas, 0, 0);
    this.shader.setUniform("u_opacity", this.opacity);
    this.shader.setUniform("tex0", this.graph);
    // this.shader.setUniform('u_time', frameCount / 1000)
    this.shader.setUniform("u_xOff", this.params.faders.xOff);
    this.shader.setUniform("u_yOff", this.params.faders.yOff);
    this.shader.setUniform("u_amp", this.params.faders.amp);
    this.shader.setUniform("u_noise", this.params.faders.noise);
    this.shader.setUniform("u_freq", this.freq);
    this.shader.setUniform("u_time", this.time);

    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);
    this.time += this.params.faders.speed;
    this.freq += this.params.faders.freq;
  }

  unload() {
    super.unload();
    document.body.removeChild(this.graph.canvas);
    document.body.removeChild(this.shaderBox.canvas);
    // shaders[1] = loadShader("./shaders/texture.vert", this.shaderPath);
  }

  listeners = [
    {
      socketName: "centerX",
      socketMethod: (val) => {
        this.params.faders.xOff = 0;
        this.updateOsc();
      },
    },
    {
      socketName: "centerY",
      socketMethod: (val) => {
        this.params.faders.yOff = 0;
        this.updateOsc();
      },
    },
    {
      socketName: "opacity",
      socketMethod: (val) => {
        this.opacity = val.args[0];
      },
    },
  ];
}

class FlowShader extends Sketch {
  // Scene 10. Maped
  constructor(img) {
    super();
    // this.img = images[2];
    this.img = images[5];
    this.params = {
      faders: {
        waterSpeed: 0.001,
        backSpeed: 0.001,
        offset: 0,
        colorAmount: 0,
        multiplier: 0,
      },
    };
    this.offsetSin = 0.7619147651413981;
    this.waterTime = 0.1;
    this.backTime = 0.1;
    this.sceneNum = 10;
    this.opacity = 0;
    this.fbmAmp = 0.5;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    this.time = 0;
    this.loops = 4;
    this.cray = 0.0;
    this.shader = shaders[2];
    this.shader = this.shaderBox.createShader(
      shaders[2]._vertSrc,
      shaders[2]._fragSrc
    );
    this.shaderPath = "./shaders/trippytwo.frag";
    this.canvasImage = createGraphics(width, height);
  }

  draw() {
    noStroke();
    this.canvasImage.image(glCanvas, 0, 0);
    this.shader.setUniform("u_opacity", this.opacity / 255);
    this.shader.setUniform("tex0", this.img);
    this.shader.setUniform("u_time", frameCount / 1000);
    this.shader.setUniform("u_waterTime", this.waterTime);
    this.shader.setUniform("u_multiplier", this.params.faders.multiplier);
    this.shader.setUniform("u_backTime", this.backTime / 10);
    this.shader.setUniform("u_offset", this.offsetSin);
    this.shader.setUniform("u_colorAmount", this.params.faders.colorAmount);
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);

    this.backTime += this.params.faders.backSpeed / 2;
    this.waterTime += this.params.faders.waterSpeed / 100;
    this.offsetSin += this.params.faders.offset / 10;
  }

  unload() {
    super.unload();
    document.body.removeChild(this.shaderBox.canvas);
    document.body.removeChild(this.canvasImage.canvas);
  }

  listeners = [
    {
      socketName: "stopOffset",
      socketMethod: (val) => {
        this.params.faders.offset = 0;
        this.updateOsc();
      },
    },
    {
      socketName: "image1",
      socketMethod: (val) => {
        this.img = images[5];
      },
    },
    {
      socketName: "image2",
      socketMethod: (val) => {
        this.img = this.canvasImage;
      },
    },
    {
      socketName: "image3",
      socketMethod: (val) => {
        this.img = images[8];
      },
    },
  ];
}

class DisplaceImg extends Sketch {
  constructor(img) {
    super();
    this.img = {};
    this.params = {
      faders: {
        displaceX: 0,
        displaceY: 0,
        freq: 0.001,
        amp: 1,
        red: 0,
        green: 0,
        blue: 0,
      },
    };
    this.displaceX = 0;
    this.displaceY = 0;
    this.sceneNum = 11;
    this.opacity = 0;
    this.isBandW = false;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(innerWidth, innerHeight, WEBGL);
    this.time = 0;
    this.loops = 4;
    this.cray = 0.0;
    this.shader = shaders[3];
    this.shader = this.shaderBox.createShader(
      shaders[3]._vertSrc,
      shaders[3]._fragSrc
    );
    this.canvasImage = createGraphics(width, height);
    this.img = this.canvasImage;
  }

  removeLayer() {
    this.layers.pop();
    this.params.faders.numLayers++;
  }

  draw() {
    noStroke();
    // draw the camera on the current layer
    this.canvasImage.image(glCanvas, 0, 0);
    this.shaderBox.shader(this.shader);
    // send the camera and the two other past frames into the camera feed
    this.shader.setUniform("tex0", this.img);
    this.shader.setUniform("u_opacity", this.opacity / 255);
    this.shader.setUniform(
      "u_displaceX",
      noise(frameCount * this.params.faders.freq) *
        this.params.faders.amp *
        this.displaceX
    );
    this.shader.setUniform(
      "u_displaceY",
      noise(frameCount * this.params.faders.freq) *
        this.params.faders.amp *
        this.displaceY
    );
    this.shader.setUniform("u_time", frameCount / 500);
    this.shader.setUniform("u_red", this.params.faders.red);
    this.shader.setUniform("u_green", this.params.faders.green);
    this.shader.setUniform("u_blue", this.params.faders.blue);
    this.shader.setUniform("u_blackAndWhite", this.isBandW);

    image(this.shaderBox, 0, 0, width, height);
    this.shaderBox.rect(0, 0, width, height);

    this.displaceX += this.params.faders.displaceX / 1000;
    this.displaceY += this.params.faders.displaceY / 1000;
  }

  unload() {
    super.unload();
    document.body.removeChild(this.canvasImage.canvas);
    document.body.removeChild(this.shaderBox.canvas);
  }

  listeners = [
    {
      socketName: "stopX",
      socketMethod: (val) => {
        this.params.faders.displaceX = 0;
        this.updateOsc();
      },
    },
    {
      socketName: "stopY",
      socketMethod: (val) => {
        this.params.faders.displaceY = 0;
        this.updateOsc();
      },
    },
    {
      socketName: "reset",
      socketMethod: (val) => {
        this.displaceY = 0;
        this.displaceX = 0;
      },
    },
    {
      socketName: "image1",
      socketMethod: (val) => {
        this.img = images[9];
      },
    },
    {
      socketName: "image2",
      socketMethod: (val) => {
        this.img = images[10];
      },
    },
    {
      socketName: "canvas",
      socketMethod: (val) => {
        this.img = this.canvasImage;
      },
    },
  ];
}

// class Feedback extends Sketch { // Scene 13. Maped. Needs work.

//   constructor(img) {
//     super();
//     this.params = {
//       faders: {
//         xOff: 0,
//         yOff: 0,
//       }
//     }
//     this.opacity = 1;
//     this.sceneNum = 13;
//   }

//   init(index) {
//     super.init();
//     this.shaderBox = createGraphics(width, height, WEBGL);
//     this.time = 0;
//     this.loops = 4;
//     this.cray = 0.0;
//     this.shader = this.shaderBox.createShader(shaders[4]._vertSrc, shaders[4]._fragSrc);
//     this.graph = createGraphics(width, height);
//   }

//   draw() {
//     // linesShader.setUniform("u_color", [0.0, 1.0, 0.0, 1.0]) // Get this equation correct.
//     noStroke();
//     this.graph.image(glCanvas, 0, 0)
//     this.shader.setUniform("u_opacity", this.opacity)
//     this.shader.setUniform("tex0", this.graph);
//     this.shader.setUniform('u_xOff', this.params.faders.xOff);
//     this.shader.setUniform('u_yOff', this.params.faders.yOff);
//     this.shaderBox.shader(this.shader);
//     image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
//     this.shaderBox.rect(0, 0, width, height);
//   }

//   unload() {
//     super.unload();
//     // shaders[1] = loadShader("./shaders/texture.vert", this.shaderPath);
//   }

//   updateOsc() {
//     super.updateOsc();
//     // Syncs iPad with scenes starting values
//     socket.emit("updateOsc", {
//       scene: this.sceneNum,
//       isXY: true,
//       xy: [this.params.faders.yOff, this.params.faders.yOff]
//     });
//   }

//   // listeners = [
//   //   {
//   //     socketName: "xy",
//   //     socketMethod: (val) => {
//   //       this.params.faders.xOff = val.args[1] / 10
//   //       this.params.faders.yOff = val.args[0] / 10
//   //     }
//   //   },
//   // ]
// }

class Mirror extends Sketch {
  // Scene 14. Maped. Needs work.

  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.params = {
      faders: {
        xOff: 0,
        yOff: 0,
      },
    };
    this.opacity = 0;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(width, height, WEBGL);
    this.shader = this.shaderBox.createShader(
      shaders[4]._vertSrc,
      shaders[4]._fragSrc
    );
    this.graph = createGraphics(width, height);
  }

  draw() {
    noStroke();
    this.graph.image(glCanvas, 0, 0);
    this.shader.setUniform("u_opacity", this.opacity / 255);
    this.shader.setUniform("tex0", this.graph);
    this.shader.setUniform("u_xOff", this.params.faders.xOff);
    this.shader.setUniform("u_yOff", this.params.faders.yOff);
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);
  }

  unload() {
    super.unload();
    document.body.removeChild(this.graph.canvas);
    document.body.removeChild(this.shaderBox.canvas);
  }

  listeners = [
    {
      midiNote: 0,
      midiMethod: (val) => {
        // this.params.fader s.xOff = val / 100
        this.opacity = val / 100;
      },
    },
    {
      midiNote: 1,
      midiMethod: (val) => {
        this.params.faders.yOff = val / 100;
      },
    },
  ];
}

// Add own background for opacity here?
class FlowField extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.particles = [];
    this.inc = 0.2;
    this.zinc = 0.0003;
    this.scale = 20;
    this.cols;
    this.rows;
    this.zoff = 0;
    this.flowField = [];
    this.particleAmt = 500;
    this.opacity = 0;
    this.mag = 0.5;
    this.freq1 = 1;
    this.freq2 = 1;
    this.opacity = 255;

    this.params = {
      faders: {
        angle: 3.709,
        speed: 2,
        opacity: 2,
      },
    };

    this.x = width / 2;
    this.y = height / 2;
  }

  init() {
    super.init();
    this.cols = ceil(width / this.scale);
    this.rows = ceil(height / this.scale);

    for (let i = 0; i < this.particleAmt; i++) {
      this.particles[i] = new this.Particle(this.scale, this.cols, this, i);
    }

    this.flowField = new Array(this.cols * this.rows);
  }

  draw() {
    let yoff = 0;
    for (let y = 0; y < this.rows; y++) {
      let xoff = 0;
      for (let x = 0; x < this.cols; x++) {
        let index = x + y * this.cols;
        let angle1 = noise(xoff, yoff, this.zoff) * -PI;
        let angle2 =
          -this.params.faders.angle + noise(xoff, yoff, this.zoff) * PI;

        let dis = dist(
          width / 2,
          height - 50,
          map(x, 0, this.cols, 0, width),
          map(y, 0, this.cols, 0, height)
        );

        let angle = angle2;
        this.mag = 1;
        if (dis < 600) {
          angle = angle1;
          this.mag = 1;
        }

        let v = p5.Vector.fromAngle(angle);

        v.setMag(this.mag);
        this.flowField[index] = v;
        xoff += this.inc;

        // // // To show vector grid
        // push();
        // translate(x * this.scale, y * this.scale);
        // rotate(v.heading());
        // strokeWeight(1);
        // stroke(255)
        // line(0, 0, this.scale, 0);
        // pop();
      }
      yoff += this.inc;
      this.zoff += this.zinc;
    }

    for (let i = 0; i < this.particleAmt; i++) {
      this.particles[i].follow(this.flowField);
      this.particles[i].update();
      this.particles[i].edges();
      this.particles[i].show();
    }
  }

  Particle = class Particle {
    constructor(scale, cols, parent, index) {
      this.pos = createVector(width / 2 + random(-1, 1) * 150, height);
      this.vel = createVector(0, 0);
      this.acc = createVector(0, 0);
      this.scale = scale;
      this.hue = 0;
      this.parent = parent;
      this.index = index;
      this.cols = cols;
      this.prevPos = this.pos.copy();
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.parent.params.faders.speed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }

    follow(vectors) {
      let x = floor(this.pos.x / this.scale);
      let y = floor(this.pos.y / this.scale);
      let index = x + y * this.cols;

      let force = vectors[index];
      this.applyForce(force);
    }

    applyForce(force) {
      this.acc.add(force);
    }

    die() {
      this.parent.particles[this.index] = new this.parent.Particle(
        this.parent.scale,
        this.parent.cols,
        this.parent,
        this.index
      );
    }

    show() {
      stroke(
        255,
        this.parent.params.faders.opacity * (this.parent.opacity / 255)
      );
      strokeWeight(1);
      line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
      this.updatePrev();
    }

    updatePrev() {
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
    }

    edges() {
      if (this.pos.x > width) {
        this.pos.x = width / 2 + random(-1, 1) * 150;
        this.pos.y = height;
        this.updatePrev();
      }
      if (this.pos.x < 0) {
        this.pos.x = width / 2 + random(-1, 1) * 150;
        this.pos.y = height;
        this.updatePrev();
      }
      if (this.pos.y > height) {
        this.pos.x = width / 2 + random(-1, 1) * 150;
        this.pos.y = height;
        // this.die();
        this.updatePrev();
      }
      if (this.pos.y < 0) {
        this.pos.x = width / 2 + random(-1, 1) * 150;
        this.pos.y = height;
        this.updatePrev();
      }
    }
  };

  listeners = [];
}

class Gridz extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.params = {
      faders: {
        lengthSpeed: 0.000055,
        colorSpeed: 0.01,
        lengthScale: 1,
        rotate: 0,
        spinSpeed: 0,
      },
    };
    this.scale = 100;
    this.rows = Math.ceil(width / 100);
    this.cols = Math.ceil(height / 100);
    this.lengthTime = 0;
    this.colorTime = 0;
    this.opacity = 0;
    this.fullRotate = 0;
    this.spin = 0;
    this.spinSpeed = 0;
  }

  init() {
    super.init();
    userStartAudio();

    socket.emit("updateOsc", {
      scene: this.setIndex,
      oscObj: "rotateClock",
      value: 0,
    });

    socket.emit("updateOsc", {
      scene: this.setIndex,
      oscObj: "rotateCounter",
      value: 0,
    });
  }

  draw() {
    fft.analyze(1024);
    const avgFFT = fft.linAverages(this.rows * this.cols);
    const { lengthSpeed, colorSpeed } = this.params.faders;
    const scale = this.scale;
    translate(width / 2, height / 2);
    rotate(this.params.faders.rotate);
    translate(-width / 2, -height / 2);
    for (let x = 0; x < this.rows; x++) {
      let xPos = x * scale;
      translate(width / 2, height / 2);
      rotate(this.spin);
      translate(-width / 2, -height / 2);
      for (let y = 0; y < this.cols; y++) {
        let yPos = y * scale;
        let hue = noise(x, y, this.colorTime) * this.opacity; // made this audio reactive.
        // stroke(hue, hue, hue, hue);
        push();
        translate(xPos, yPos);
        stroke(
          avgFFT[x + y] * abs(sin(frameCount / 1000)),
          avgFFT[x + y] * abs(cos(frameCount / 500)),
          avgFFT[x + y],
          this.opacity
        );
        let lengthNoiseX =
          sin(x * this.lengthTime) * this.params.faders.lengthScale;
        let lengthNoiseY =
          sin(y * this.lengthTime) * this.params.faders.lengthScale;
        line(
          0 - scale * lengthNoiseX,
          0 - scale * lengthNoiseX,
          0 + scale,
          0 + scale
        );
        line(
          0 - scale * lengthNoiseY,
          0 + scale * lengthNoiseY,
          0 + scale,
          0 - scale
        );
        pop();
      }
    }
    this.lengthTime += lengthSpeed;
    this.colorTime += colorSpeed;
    this.spin += this.spinSpeed * this.params.faders.spinSpeed;
  }

  listeners = [
    {
      midiNote: 0,
      midiMethod: (val) => {
        console.log("midinote");
        this.speed = val / 1000;
      },
    },
    {
      socketName: "size",
      socketMethod: (val) => {
        if (val.args[0] == 1) {
          this.scale = 435;
        } else if (val.args[0] == 2) {
          this.scale = 235;
        } else if (val.args[0] == 3) {
          this.scale = 100;
        }
      },
    },
    {
      socketName: "rotateClock",
      socketMethod: (val) => {
        this.spinSpeed = val.args[0];
        socket.emit("updateOsc", {
          scene: this.setIndex,
          oscObj: "rotateCounter",
          value: 0,
        });
      },
    },
    {
      socketName: "rotateCounter",
      socketMethod: (val) => {
        this.spinSpeed = val.args[0];
        socket.emit("updateOsc", {
          scene: this.setIndex,
          oscObj: "rotateClock",
          value: 0,
        });
      },
    },
  ];
}

class WindShield extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.lines = [];
    this.params = {
      faders: {
        arc: 565,
        lineLength: -1,
        lineAmt: 1,
        speed: 0.12,
        lineDupes: 1,
        dupeSpace: 0,
        bottom: height / 1.5,
      },
    };
    this.opacity = 255;
    this.time = 0;
  }

  init() {
    super.init();
  }

  draw() {
    const { lineAmt, lineDupes } = this.params.faders;
    for (let i = 0; i < lineAmt; i++) {
      const thisLine = this.lines[i];
      if (thisLine) {
        thisLine.update();
        for (let j = 0; j < lineDupes; j++) {
          const vectors = this.move(thisLine.time / (j / 25 + 1));
          stroke(
            thisLine.color[0] / (j + 1),
            thisLine.color[1] / (j + 1),
            thisLine.color[2] / (j + 1),
            this.opacity
          );
          line(vectors.start.x, vectors.start.y, vectors.end.x, vectors.end.y);
        }
      }
    }
  }

  move(time) {
    const { arc, lineLength, bottom } = this.params.faders;
    const start = createVector(0, 0);
    const end = createVector(0, 0);

    let rad = radians(time);
    start.x = width / 2 + Math.sin(-HALF_PI + rad) * arc;
    start.y = bottom + -Math.abs(Math.sin(rad) * arc);

    end.x = width / 2 + (Math.sin(-HALF_PI + rad) * arc) / lineLength;
    end.y = bottom + -Math.abs((Math.sin(rad) * arc) / lineLength);

    return { start, end };
  }

  cut(index) {
    this.lines.splice(index, 1);
  }

  Line = class Line {
    constructor(parent, i) {
      this.parent = parent;
      this.posStart = createVector(width / 2, height / 2);
      this.posEnd = createVector(width / 3, height / 2);
      this.color = someColor(11);
      this.time = 0;
      this.i = i;
    }

    startBounce() {
      this.moving = true;
      this.orig = this.posStart.x;
    }

    draw() {
      for (let i = 0; i < this.parent.params.faders.lineDupes; i++) {}
    }

    update() {
      const { speed } = this.parent.params.faders;
      this.time += speed;
      // this.time = this.time % 360;
      // if (this.time % 1080 == 0) {
      //   this.parent.cut(this.i);
      // }
    }

    display() {
      stroke(this.color[0], this.color[1], this.color[2], this.parent.opacity);
      line(this.posStart.x, this.posStart.y, this.posEnd.x, this.posEnd.y);
    }
  };

  listeners = [
    {
      socketName: "bounce",
      socketMethod: () => {
        for (let i = 0; i < this.lines.length; i++) {
          this.lines[i].startBounce();
        }
      },
    },
    {
      socketName: "lineLength",
      socketMethod: (val) => {
        this.lineLength = val.args[0];
      },
    },
    {
      socketName: "lineAmt",
      socketMethod: (val) => {
        this.lineAmt = val.args[0];
      },
    },
    {
      socketName: "sunset",
      socketMethod: (val) => {
        this.params.faders.lineLength = -1;
        this.updateOsc();
      },
    },
    {
      socketName: "addLine",
      socketMethod: (val) => {
        if (val.args[0] > 0) {
          this.params.faders.lineAmt++;
          this.lines.push(new this.Line(this, this.lines.length));
        }
      },
    },
    {
      socketName: "removeLine",
      socketMethod: (val) => {
        if (val.args[0] > 0) {
          this.params.faders.lineAmt--;
          this.lines.splice(this.lines.length - 1, 1);
        }
      },
    },
  ];
}

class Tares extends Sketch {
  // Maped
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.opacity = 0;
    this.pointAmt = 10;
    this.params = {
      faders: {
        x: 0.001,
        y: 0.6612,
        speed: 0,
        amp: 0,
        thickness: 1,
      },
    };
    this.speed = 0.001;
    this.amp = 10;
    this.num1Start = 10;
    this.num2Start = 10;
    this.num1 = this.num1Start;
    this.num2 = this.num2Start;
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(width, height, WEBGL);
    this.shader = this.shaderBox.createShader(
      shaders[5]._vertSrc,
      shaders[5]._fragSrc
    );
    // this.graph = createGraphics(width, height);
  }

  unload() {
    super.unload();
    document.body.removeChild(this.shaderBox.canvas);
  }

  draw() {
    noStroke();
    // this.graph.image(glCanvas, 0, 0)
    this.shader.setUniform("u_opacity", this.opacity / 255);
    this.shader.setUniform("u_point1", this.num1);
    this.shader.setUniform("u_point2", this.num2);
    this.shader.setUniform("u_thickness", this.params.faders.thickness);
    this.shader.setUniform("u_x", this.params.faders.x);
    this.shader.setUniform("u_y", this.params.faders.y);
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);

    this.speed += this.params.faders.speed / 100;

    this.amp += this.params.faders.amp;
    // this.num1 = this.num1Start + sin(frameCount * this.speed) * this.amp;
    this.num2 = Math.abs(this.num2Start + sin(this.speed) * this.amp);
  }
  listeners = [
    {
      socketName: "stopSpeed",
      socketMethod: (val) => {
        this.params.faders.speed = 0;
        this.updateOsc();
      },
    },
  ];
}

class WarpGrid extends Sketch {
  constructor(setIndex) {
    super();
    this.img = images[4];
    this.setIndex = setIndex;
    this.opacity = 0;
    this.amt = 0.3;
    this.params = {
      faders: {
        yOff: 1,
      },
    };
  }

  init(index) {
    super.init();
    this.shaderBox = createGraphics(width, height, WEBGL);
    this.shader = this.shaderBox.createShader(
      shaders[6]._vertSrc,
      shaders[6]._fragSrc
    );
  }

  draw() {
    noStroke();
    this.shader.setUniform("tex0", this.img);
    this.shader.setUniform("u_opacity", this.opacity / 255);
    this.shader.setUniform("u_time", frameCount / 100);
    this.shader.setUniform("u_amt", this.amt);
    this.shader.setUniform("u_yOff", this.params.faders.yOff);
    this.shaderBox.shader(this.shader);
    image(this.shaderBox, 0, 0); // Creating an image from the shader graphics onto the main canvas.
    this.shaderBox.rect(0, 0, width, height);

    this.speed += this.params.faders.speed / 10;

    this.amp += this.params.faders.amp;
    // this.num1 = this.num1Start + sin(frameCount * this.speed) * this.amp;
    this.num2 = Math.abs(this.num2Start + sin(this.speed) * this.amp);
  }

  unload() {
    super.unload();
    document.body.removeChild(this.shaderBox.canvas);
  }
  listeners = [
    {
      socketName: "stopSpeed",
      socketMethod: (val) => {
        this.params.faders.speed = 0;
        this.updateOsc();
      },
    },
  ];
}

class Fractal extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.params = {
      faders: {
        size: 200,
        tiltY: 0,
      },
    };
  }

  init() {
    super.init();
  }

  draw() {
    noFill();
    stroke(255);
    translate(width / 2, height / 2);
    this.circle(this.params.faders.size);
  }

  circle(size) {
    ellipse(0, 0, size);
    if (size > 10) {
      push();
      translate(-size, this.params.faders.tiltY);
      this.circle(size / 2);
      pop();
      push();
      translate(size, this.params.faders.tiltY);
      this.circle(size / 2);
      pop();
    }
  }

  unload() {
    super.init();
  }

  listeners = [{}];
}
class AudioReactive extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.opacity = 0;
    this.spectrums = [];
    this.avg0 = [];
  }

  init() {
    super.init();
    // For Audio input
    userStartAudio();
  }

  draw() {
    const spectrum = fft.analyze();
    const bass = fft.getEnergy("bass");
    const mid = fft.getEnergy("mid");
    const high = fft.getEnergy("highMid");
    // background(bass, mid, high)
    let x = 0;
    let y = 0;
    let prevX = 0;
    let prevY = height / 2;

    stroke(255);
    for (let i = 0; i < spectrum.length / 2; i++) {
      x = map(i, 0, spectrum.length / 2, 0, width);
      y = height - 20 - map(spectrum[i], 0, 255, 0, height / 2);
      line(prevX, prevY, x, y);
      prevX = x;
      prevY = y;
    }
  }
  listeners = [{}];
}

class Rain extends Sketch {
  constructor(obj) {
    super(obj);
    this.dots = [];
    if (!this.loaded) {
      this.params = {
        faders: {
          amplitude: 2.5,
          speed: 0.1,
          freq: 0.01,
          freq2: 2,
        },
      };
      this.sceneNum = 7;
      this.rowsAmount = 50;
      this.dotsAmount = 20;
      this.globalChange = 14;
      this.rateChange =
        (TWO_PI / this.params.faders.freq) * this.params.faders.freq2;
      this.opacity = 0;
    }
  }

  init() {
    super.init();
    for (let i = 0; i < this.rowsAmount; i++) {
      let x = Math.round(map(i, 0, this.rowsAmount, 0, width));
      this.dots[i] = [];
      for (let j = 0; j < this.dotsAmount; j++) {
        let y = Math.round(map(j, 0, this.dotsAmount, 0, height + 100));
        this.dots[i].push({
          pos: {
            x: x,
            y: y,
          },
          size: 2,
        });
      }
    }
  }

  draw() {
    stroke(230, 230, 230, this.opacity);
    fill(230, 230, 230, this.opacity);
    for (let i = 0; i < this.rowsAmount; i++) {
      for (let j = 0; j < this.dotsAmount; j++) {
        let thisDot = this.dots[i][j];
        thisDot.size =
          Math.round(
            Math.sin(frameCount * this.params.faders.freq * i) +
              Math.sin(frameCount * this.params.faders.freq2 * 2 * i) *
                this.params.faders.amplitude
          ) * 5;
        ellipse(thisDot.pos.x, thisDot.pos.y, thisDot.size);
      }
    }
  }
}

class Ripples extends Sketch {
  constructor(obj) {
    super(obj);
    this.circles = [];
    if (!this.loaded) {
      this.angle = 0.01;
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
    this.circles.push(
      new Objects.ExplodingCircle({
        x: x,
        y: y,
        size: 25,
        stroke: someColor(),
      })
    );
  }
  mouseClicked() {
    if (this.clicked) {
      let x = mouseX;
      let y = mouseY;
      this.addCircle(x, y);
      setTimeout(() => this.addCircle(x, y), 200);
      setTimeout(() => this.addCircle(x, y), 400);
      this.clicked = false;
    } else {
      this.clicked = true;
      setTimeout(() => {
        this.clicked = false;
      }, 500);
    }
  }
}

class Mirror2 extends Sketch {
  constructor(isVertical, isHorizonal) {
    super();
    this.isVertical = isVertical || false;
    this.isHorizonal = isHorizonal || true;
    this.opacity = 0;
  }
  init() {
    super.init();
  }
  draw() {
    if (this.isHorizonal) {
      push();
      translate(width, 0);
      scale(-1, 1);
      image(
        glCanvas,
        width / 2,
        0,
        width / 2,
        height,
        width / 2,
        0,
        width / 2,
        height
      );
      pop();
    }
    if (this.isVertical) {
      push();
      translate(0, height);
      scale(1, -1);
      image(
        glCanvas,
        0,
        height / 2,
        width,
        height / 2,
        0,
        height / 2,
        width,
        height / 2
      );
      pop();
    }
  }
  listeners = [{}];
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
    stroke("white");
    for (let i = 0; i < 1024; i++) {
      let x = map(i, 0, 1024, 0, width);
      let y = height / 2 - map(mic.getLevel(0.5), 0, 1, 0, height);
      line(this.prevX, this.prevY, x, y);
      this.prevX = x;
      this.prevY = y;
    }
  }
  listeners = [{}];
}

class Walker extends Sketch {
  constructor(color = 255) {
    super();
    if (!this.loaded) {
      this.params = {
        faders: {
          speed: 0.01,
          size: 200,
          stepSize: 2,
          angle: PI * (3.0 - sqrt(5)),
          number: 500,
        },
      };
    }
    this.walkers = {};
    this.walkerAmt = 500;
    this.scale = 2;
    this.pixelOccupiedX = {};
    this.pixelOccupiedY = {};
    this.reproductionRate = 0.6;
  }

  init() {
    super.init();
    for (let i = 1; i < this.walkerAmt + 1; i++) {
      var rand = Math.round(Math.random() * 999999999);
      this.walkers[rand] = new this.Walker(rand, 0, 0, 0, this);
    }
  }

  draw() {
    for (let i in this.walkers) {
      this.walkers[i].display();
      this.walkers[i].step();
      if (this.walkers[i]) {
        this.walkers[i].preventOffScreen();
      }
    }
  }

  Walker = class {
    constructor(name, x, y, color, parent) {
      this.name = name;
      this.parent = parent;
      this.x = x || width / 2;
      this.y = y || height / 2;
      this.color = color || someColor(6);
    }
    display() {
      noStroke();
      fill(this.color[0], this.color[1], this.color[2], 10);
      // fill(255, 10);

      // fill(255);
      ellipse(this.x, this.y, this.parent.scale);
    }
    step() {
      let stepX = int(random(3)) - 1;
      let stepY = int(random(3)) - 1;

      this.parent.pixelOccupiedX[this.x] = null;
      this.parent.pixelOccupiedY[this.y] = null;

      this.x += stepX * this.parent.scale;
      this.y += stepY * this.parent.scale;
      // this.checkCollison(); // For reproduction and death

      this.parent.pixelOccupiedX[this.x] = this.name;
      this.parent.pixelOccupiedY[this.y] = this.name;
    }
    preventOffScreen() {
      if (this.x < 1) {
        this.x += this.parent.scale;
      } else if (this.x > width - 1) {
        this.x -= this.parent.scale;
      } else if (this.y < 1) {
        this.y += this.parent.scale;
      } else if (this.y > height - 1) {
        this.y -= this.parent.scale;
      }
    }
    checkCollison() {
      var walkerAtX = this.parent.pixelOccupiedX[this.x];
      var walkerAtY = this.parent.pixelOccupiedY[this.y];
      if (
        walkerAtX !== null &&
        walkerAtX !== undefined &&
        walkerAtX == walkerAtY
      ) {
        // var gaus = randomGaussian(30, 2);
        // if(gaus )
        var ran = Math.random();
        if (ran < reproductionRate) {
          this.reproduce();
        } else {
          this.removeWalker();
        }
        // console.log(gaus);
        // this.reproduce();
      }
    }
    reproduce() {
      var rand = Math.round(Math.random() * 999999999);
      walkers[rand] = new Walker(rand, this.x, this.y, this.color);
      updateCount(1);
    }
    removeWalker() {
      delete walkers[this.name];
      pixelOccupiedX[this.x] = null;
      pixelOccupiedY[this.y] = null;
      updateCount(-1);
    }
  };

  listeners = [
    {
      socketName: "colorToggle",
      socketMethod: (val) => {
        if (val.args[0]) {
          this.color = [58, 19, 6];
        } else {
          this.color = [255, 255, 255];
        }
      },
    },
  ];
}

class Drops extends Sketch {
  // Scene 12.
  constructor(obj) {
    super(obj);
    if (!this.loaded) {
      this.resolution = 4;
    }
    this.grid = [];
    this.center = createVector(width / 2, height / 2);
    this.speed = 0.01;
    this.sets = [];
    this.params = {
      faders: {
        size: 1,
        speed: 10,
      },
    };
    this.opacity = 0;
    this.rotate = 0;
  }

  init() {
    super.init();
  }

  draw() {
    let thisPoint = {};
    noFill();
    translate(width / 2, height / 2);
    rotate(this.rotate);
    this.rotate += 0.01;
    translate(-width / 2, -height / 2);
    for (let i = 0; i < this.sets.length; i++) {
      let isOff = 0;
      for (let j = 0; j < this.sets[i].arr.length; j++) {
        for (let k = 0; k < this.sets[i].arr[j].length; k++) {
          thisPoint = this.sets[i].arr[j][k];

          // let size = dist(thisPoint.x, thisPoint.y, width / 2, height / 2) * this.params.faders.size;
          let acc = p5.Vector.sub(thisPoint, this.center);
          thisPoint.add(acc.div(this.params.faders.speed * 100));
          stroke(
            this.sets[i].color[0],
            this.sets[i].color[1],
            this.sets[i].color[2],
            this.opacity
          );
          triangle(
            thisPoint.x,
            thisPoint.y,
            thisPoint.x + 100 * this.params.faders.size,
            thisPoint.y + 100 * this.params.faders.size,
            thisPoint.x - 100 * this.params.faders.size,
            thisPoint.y + 100 * this.params.faders.size
          );
          if (thisPoint.x > width && !this.sets[i].isDuped) {
            this.sets[i].isDuped = true;
          }
        }
      }
      if (this.sets[i].isDuped) {
        this.sets[i].isFaded = true;
        this.sets.splice(i, 1);
      }
    }
  }

  createSet(size = 25) {
    const newSet = { opacity: 1, arr: [], rotate: 0, color: someColor(6) };
    for (let i = 0; i < this.resolution; i++) {
      let y = map(i, 0, this.resolution, height / 2 - size, height / 2 + size);
      newSet.arr[i] = [];
      for (let j = 0; j < this.resolution; j++) {
        if (
          j == 0 ||
          j == this.resolution - 1 ||
          i == 0 ||
          i == this.resolution - 1
        ) {
          let x = map(
            j,
            0,
            this.resolution - 1,
            width / 2 - size,
            width / 2 + size
          );
          newSet.arr[i].push(createVector(x, y));
        }
      }
      this.sets.push(newSet);
    }
  }

  listeners = [
    {
      socketName: "addSet",
      socketMethod: (val) => {
        if (val.args[0]) {
          this.createSet(50);
        }
      },
    },
  ];
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
        row.push(createVector(x, y));
      }
      this.gridPoints.push(row);
    }
    this.gridPointsLength = this.gridPoints.length;
  }

  draw() {
    strokeWeight(3);
    stroke(80, 0, 0);
    for (let i = 1; i < this.gridPointsLength; i++) {
      for (let j = 0; j < this.gridPointsX - 1; j++) {
        if (i < this.gridPointsLength - 1) {
          line(
            this.gridPoints[i][j].x,
            this.gridPoints[i][j].y,
            this.gridPoints[i + 1][j].x,
            this.gridPoints[i + 1][j].y
          );
          this.move(this.gridPoints[i][j], i);
        }
        line(
          this.gridPoints[i][j].x,
          this.gridPoints[i][j].y,
          this.gridPoints[i][j + 1].x,
          this.gridPoints[i][j + 1].y
        );
      }
    }
    // this.angle += 0.01;
  }

  move(point, i) {
    let amp = mouseX / 1000;
    let mouse = createVector(mouseX, mouseY);
    let acc = p5.Vector.sub(point, mouse);
    acc.normalize();

    // acc.mult(5)
    // point.x += Math.sin(this.angle) * acc.x;
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
    this.gridPointsLength = 0;
    this.gridPointsX = 0;
    this.gridPointsY = 0;
  }

  init() {
    super.init();
    this.time = new Date().getTime();
    fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
    )
      .then((res) => res.json())
      .then((data) => {
        this.quakeData = data.features;
        this.firstQuake = this.quakeData.reduce(
          (min, obj) => (obj.properties.time < min ? obj.properties.time : min),
          this.quakeData[0].properties.time
        );
      })
      .catch((err) => console.log(err));
  }

  draw() {
    if (this.quakeData) {
      for (let i = 0; i < this.quakeData.length; i++) {
        let thisQuake = this.quakeData[i].properties;
        let x = map(thisQuake.time, this.firstQuake, this.time, 200, width);
        stroke("white");
        text(thisQuake.title, x, height / 2 - i * 30);
        ellipse(x, height / 2, thisQuake.mag * 25);
      }
    }
  }
}

class Connecter extends Sketch {
  // replaced by spinning circles
  constructor(color) {
    super();
    this.params = {
      faders: {},
    };
    (this.pointAmt = 200), (this.circleDiameter = 410);
    this.curl = 280;
    this.strokeWeight = 1;
    this.multiplier = 10;
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
      const orbit = Math.sin(this.freq + i * 10) * this.curl;
      const circle = Math.sin(i) * this.circleDiameter;
      const orbitY = cos(this.freq + i * this.multiplier);
      const circleY = cos(i) * this.circleDiameter;
      const newPoint = new Objects.Circle(
        width / 2 + orbit + circle,
        height / 2 + orbitY * this.curl + circleY,
        5,
        this.color || someColor(this.imgIndex)
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
      orbit = Math.sin(this.freq + i * 10) * this.curl;
      circle = Math.sin(i) * this.circleDiameter;
      orbitY = cos(this.freq + i * this.multiplier);
      circleY = cos(i) * this.circleDiameter;
      thisPoint.pos.x = width / 2 + orbit + circle;
      thisPoint.pos.y = height / 2 + orbitY * this.curl + circleY;
      stroke(
        thisPoint.stroke[0],
        thisPoint.stroke[1],
        thisPoint.stroke[2],
        this.opacity
      );
      for (let j = 0; j < this.pointAmt; j++) {
        if (
          dist(
            thisPoint.pos.x,
            thisPoint.pos.y,
            this.centerPoints[j].pos.x,
            this.centerPoints[j].pos.y
          ) < this.proximity
        ) {
          line(
            thisPoint.pos.x,
            thisPoint.pos.y,
            this.centerPoints[j].pos.x,
            this.centerPoints[j].pos.y
          );
        }
      }
    }
    this.freq += this.speed;
  }
  listeners = [];
  mouseClicked() {}
}

class Back extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.opacity = 100;
  }

  init() {
    super.init();
  }

  draw() {
    const length = this.circles.length;
    let obj;
    for (let i = 0; i < length; i++) {
      obj = this.circles[i];
      ellipse(obj.pos.x, obj.pos.y, obj.radius);
    }
  }

  listeners = [{}];
}

// Spinning Rects
class GetRect extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.opacity = 100;
    this.rects = [];
    this.rectAmount = 0;
  }

  init() {
    super.init();
    this.rectAmount = 100;
    let size = 10;
    let newRect = { size: 0, speed: 0 };
    for (let i = 0; i < this.rectAmount; i++) {
      size += i * 2;
      newRect = { size: size, speed: 0 };
      this.rects.push(newRect);
    }
  }

  draw() {
    rectMode(CENTER);

    for (let i = 0; i < this.rectAmount; i++) {
      const thisRect = this.rects[i];
      stroke(255, 0, 0);
      fill(0, 0, 0, 0);
      push();
      translate(width / 2, height / 2);
      rotate(i * ((frameCount / 1000) % 360));
      rect(0, 0, thisRect.size, thisRect.size);
      pop();
    }
  }

  listeners = [{}];
}

class Attractor extends Sketch {
  constructor(setIndex) {
    super();
    this.setIndex = setIndex;
    this.opacity = 100;
    this.pointRows = 15;
    this.pointsPerRow = 15;
    this.pointSize = 5;
    this.spin = 0;
    this.stretch = 0;
    this.spinSpeed = 0;
    this.distance = 1;
    this.connectDisc = 0;

    /** @type {Array<[Point]>} */
    this.points = [];
    this.params = [];
    this.sizeX = 5;
    this.sizeY = 5;
    this.wildAmount = 0;
    this.wildOffset = 0;
    this.wildOffsetInc = 0;
    this.setupParams();
  }

  init() {
    super.init();
    let vec = {};
    let x, y;
    for (let i = 0; i < this.pointRows; i++) {
      for (let k = 0; k < this.pointsPerRow; k++) {
        x = width / 2 + sin(k) * 300;
        y = width / 2 + cos(k) * 300;
        vec = new Objects.Circle(
          x,
          y,
          this.pointSize,
          [255, 255, 255, 100],
          [255, 255, 255, 100]
        );
        if (!this.points[i]) {
          this.points[i] = [];
        }
        this.points[i].push(vec);
      }
    }
  }

  draw() {
    let row = {};
    let point = {};
    let size;
    let spin;
    let pointDisc;

    this.removePoints();

    for (let rowNum = 0; rowNum < this.pointRows; rowNum++) {
      for (let pointNum = 0; pointNum < this.pointsPerRow; pointNum++) {
        row = this.points[rowNum];
        pointDisc = rowNum * this.distance + this.stretch;
        point = this.addPoints(row, rowNum, pointNum);
        point = this.setPointAttributes(point, rowNum, pointNum, pointDisc);
        point.draw();
        this.spin += this.spinSpeed;
        this.drawConnections(point, pointDisc, rowNum);
      }
    }
  }

  drawConnections(point, pointDisc, rowNum) {
    // Checking connections
    for (let pointNum = 0; pointNum < this.pointsPerRow; pointNum++) {
      const compareRow = rowNum - 1;

      if (compareRow === -1) {
        break;
      }

      const comparePoint = this.points[compareRow][pointNum];

      if (
        dist(comparePoint.pos.x, comparePoint.pos.y, point.pos.x, point.pos.y) <
        this.connectDisc
      ) {
        stroke(255, 255, 255, pointDisc);
        line(comparePoint.pos.x, comparePoint.pos.y, point.pos.x, point.pos.y);
      }
    }
  }

  setPointAttributes(point, rowNum, pointNum, pointDisc) {
    point.pos.x =
      width / 2 + sin(pointNum + this.spin * (rowNum / PI)) * pointDisc;

    point.pos.y =
      height / 2 + cos(pointNum + this.spin * (rowNum / PI)) * pointDisc;

    point.size = (pointDisc - rowNum) * this.pointSize;
    point.fill[3] = pointDisc;
    point.stroke[3] = pointDisc;
    return point;
  }

  addPoints(row, rowNum, pointNum) {
    let point;
    if (!row) {
      // If doesn't exist, create
      this.points.push([]);
      row = this.points[rowNum];
    }
    point = row[pointNum];
    if (!point) {
      // If doesn't exist, create
      // Starting at base position for now. Need to map based on param, but relative to last point.
      row.push(
        new Objects.Circle(
          width / 2,
          height / 2,
          this.pointSize,
          [255, 255, 255, 100],
          [255, 255, 255, 100]
        )
      );
      point = row[pointNum];
    }
    return point;
  }

  removePoints() {
    if (this.pointRows < this.points.length) {
      this.points.slice(0, this.pointRows);
    }

    if (this.pointsPerRow < this.points[0].length) {
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].slice(0, this.pointsPerRow);
      }
    }
  }

  setOpacity = ({ args }) => {
    this.opacity = midiToColor(args[0]);
  };

  setupParams() {
    this.params[8] = ({ args }) => {
      this.pointSize = args[0] * 0.001;
    };
    this.params[9] = ({ args }) => {
      this.spinSpeed = args[0] * 0.0000005;
    };
    this.params[10] = ({ args }) => {
      this.distance = args[0];
    };
    this.params[11] = ({ args }) => {
      this.connectDisc = args[0] * 2;
    };
    this.params[12] = ({ args }) => {
      this.stretch = args[0] * 2;
    };
  }
}

const Objects = {
  /**
   * @typedef Point
   * @property {{x, y}} pos
   * @property {color} color Color of the point
   * @property {function} draw sets stroke to the point color and draws the point
   */
  Point: class {
    /**
     * @param {number} x
     * @param {number} y
     * @param {string || object} color
     */
    constructor(x, y, color) {
      this.pos = createVector(x, y);
      this.color = color;
      this.color =
        typeof color == "object"
          ? [color[0], color[1], color[2], color[3] || 255]
          : color || 0;
    }

    draw() {
      stroke(this.color);
      point(this.pos.x, this.pos.y);
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
    constructor({ stroke, fill, x, y, size }) {
      this.stroke =
        typeof stroke == "object"
          ? [stroke[0], stroke[1], stroke[2]]
          : stroke || 0;
      this.fill =
        typeof fill == "object" ? [fill[0], fill[1], fill[2]] : fill || 0;
      this.x = x || 0;
      this.y = y || 0;
      this.size = size || 10;
      this.speed = HALF_PI;
      this.angle = this.speed;
    }
    draw() {
      this.size += Math.sin(radians(this.angle)) * 10;
      this.color;
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
    constructor(x, y, size, stroke, fill) {
      this.stroke = stroke || 0;
      this.fill =
        typeof fill == "object" ? [fill[0], fill[1], fill[2]] : fill || 0;
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
    constructor(amp, frequency, phase, startY) {
      this.time = 1;
      this.amplitude = amp || 100;
      this.frequency = frequency || 0.01;
      this.phase = phase || 1;
      this.startY = startY || height / 2;
    }
    getVoltage(time) {
      return (
        this.amplitude * Math.sin(2 * PI * this.frequency * time + this.phase)
      );
    }
  },
};

const Methods = {
  connect: (point, arrayOfObjects, distance, str) => {
    const length = arrayOfObjects.length;
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
    return amp * Math.sin(2 * PI * freq * time + phase);
  },
};

const helpers = {
  ease: function (val, low, high) {
    return this.easeInOutQuad(normalize(val));
  },

  normalize: function (val) {
    return (val - 0) / (1 - 0);
  },

  easeInOutQuad: function (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  writeColor(image, x, y, red, green, blue, alpha) {
    let index = (x + y * width) * 4;
    image.pixels[index] = red;
    image.pixels[index + 1] = green;
    image.pixels[index + 2] = blue;
    image.pixels[index + 3] = alpha;
  },
  random: function (min, max) {
    const rand = Math.random();
    return rand * (max - min) + min;
  },
};

const sceneMap = {
  Sketch,
  BGShader,
  Starry,
  Sun,
  RopeSwing,
  Proximity,
  Geometry,
  GoldenSpiral,
  SineWaves,
  Orbitals,
  LinesShader,
  FlowShader,
  DisplaceImg,
  Mirror,
  FlowField,
  Gridz,
  WindShield,
  Tares,
  WarpGrid,
  Fractal,
  AudioReactive,
  Rain,
  Ripples,
  Mirror2,
  SoundTest,
  Walker,
  Drops,
  Grid,
  EarthQuake,
  Connecter,
  Back,
  GetRect,
  Attractor,
};

const sceneMapArray = Object.values(sceneMap);
