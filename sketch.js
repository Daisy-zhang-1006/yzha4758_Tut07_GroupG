const BASE_WIDTH  = 840;
const BASE_HEIGHT = 620;

let ripples = []; // Storing multiple shock waves
let bg, bg2;      // Two-layer buffer background
let cowStartTime = 0;  // The moment the bull animation begins
let running = true;    // Control animation pause/resume
let pauseTime = 0;     // Pause moment

// The highest points of each part of a bull's body
let body, leg1, leg2, leg3, leg4, horn1, horn2;

function setup() {
  createCanvas(BASE_WIDTH, BASE_HEIGHT);
  updateCanvasScale();

  // Initialise the background buffer and draw the oil painting background pattern
  bg  = createGraphics(width, height);
  bg2 = createGraphics(width, height);
  createOilPaintBG();
  bg.filter(BLUR, 1.5);

  // Record the start time of the bull animation
  cowStartTime = millis();

  // =========================
  // Vertex array initialisation
  body = [
    createVector(146,313), createVector(259,236), createVector(367,220),
    createVector(461,153), createVector(622,126), createVector(642,115),
    createVector(682,121), createVector(708,154), createVector(709,203),
    createVector(714,219), createVector(726,239), createVector(699,262),
    createVector(617,302), createVector(597,341), createVector(585,353),
    createVector(521,389), createVector(521,389), createVector(478,404),
    createVector(383,432), createVector(208,466), createVector(169,471),
    createVector(136,416),
  ];
  leg1 = [
    createVector(580,350), createVector(642,384), createVector(672,438),
    createVector(634,421), createVector(638,414), createVector(515,385),
  ];
  leg2 = [
    createVector(515,384), createVector(518,477), createVector(490,467),
    createVector(472,400),
  ];
  leg3 = [
    createVector(378,428), createVector(330,434), createVector(235,514),
    createVector(221,546), createVector(186,553), createVector(132,593),
    createVector(125,580), createVector(131,542), createVector(144,530),
    createVector(200,497), createVector(210,452),
  ];
  leg4 = [
    createVector(175,466), createVector(143,495), createVector(143,495),
    createVector(119,500), createVector(125,501), createVector(108,533),
    createVector(93,582), createVector(73,583), createVector(59,587),
    createVector(37,568), createVector(82,500), createVector(81,480),
    createVector(143,410),
  ];
  horn1 = [
    createVector(668,169), createVector(685,190), createVector(729,183),
  ];
  horn2 = [
    createVector(488,128), createVector(506,143), createVector(622,125),
  ];
}


function draw() {
  background(255);

  let now = millis();
  let elapsed = (now - cowStartTime) / 1000.0; // seconds

  // —— Background dynamic shaking + dynamic water ripples  ——
  push();
    const shakeX = sin(elapsed * 1.3) * 20;
    const shakeY = cos(elapsed * 0.9) * 20;
    translate(shakeX, shakeY);
    updateWaterRipple(now); // Dynamic water waves using real time
  pop();

  // —— Dynamic Bull —— 
  drawCow(elapsed);

  
  ripples = ripples.filter(r => (now - r.startTime) < 2000);
}

// ==== Mouse click ====
function mousePressed() {
  ripples.push({
    x: mouseX,
    y: mouseY,
    startTime: millis() // Record the time when the event occurred
  });
}

// ==== Dynamic oil painting background generation ====
function createOilPaintBG() {
  const numStrokes   = 15000;
  const strokeLength = 15;

  bg.colorMode(HSB);
  bg.background(0, 0, 95);

  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      bg.noStroke();
      bg.fill(random(360), random(50,100), random(50,100));
      bg.ellipse(x, y, 15, 15);
    }
  }

  bg2.clear();
  bg2.colorMode(HSB);
  for (let i = 0; i < numStrokes; i++) {
    let x = random(width), y = random(height);
    let n = noise(x * 0.005, y * 0.005);
    let h = map(n, 0, 1, 0, 360);
    let s = map(n, 0, 1, 50, 100);
    let b = map(n, 0, 1, 50, 100);

    bg2.stroke(h, s, b);
    bg2.strokeWeight(random(1,3));
    let a  = map(noise(x*0.01, y*0.01), 0, TWO_PI);
    let px = x + cos(a) * strokeLength;
    let py = y + sin(a) * strokeLength;
    bg2.line(x, y, px, py);
  }

  bg.blend(bg2, 0,0,width,height, 0,0,width,height, BLEND);
}

// ==== Dynamic water waves ====
function updateWaterRipple(now) {
  let disp = createImage(width, height);
  disp.loadPixels();
  bg.loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let idx = (x + y * width) * 4;

      // Perlin noise displacement, using real time
      let t = now / 1000.0;
      let n = noise(x * 0.01, y * 0.01, t * 0.2);
      let offsetX = map(n, 0, 1, -30, 30);
      let offsetY = map(n, 0, 1, -30, 30);

      // Mouse disturbance
      let dx1 = x - mouseX;
      let dy1 = y - mouseY;
      let distSq = dx1 * dx1 + dy1 * dy1;
      let maxDist = 200 * 200;
      if (distSq < maxDist) {
        let d = sqrt(distSq);
        let strength = map(d, 0, sqrt(maxDist), 15, 0);
        offsetX += cos(t * 5 + d * 0.1) * strength;
        offsetY += sin(t * 5 + d * 0.1) * strength;
      }

      // Shock wave superposition
      for (let ripple of ripples) {
        let rippleElapsed = (now - ripple.startTime) / 1000.0;
        let dx = x - ripple.x;
        let dy = y - ripple.y;
        let d = sqrt(dx * dx + dy * dy);
        let waveRadius = rippleElapsed * 250;
        let waveWidth = 50;
        if (abs(d - waveRadius) < waveWidth) {
          let strength = map(abs(d - waveRadius), 0, waveWidth, 12, 0);
          let angle = atan2(dy, dx);
          offsetX += cos(angle) * strength;
          offsetY += sin(angle) * strength;
        }
      }

      let sx = constrain(x + offsetX, 0, width - 1);
      let sy = constrain(y + offsetY, 0, height - 1);
      let sidx = (floor(sx) + floor(sy) * width) * 4;

      disp.pixels[idx    ] = bg.pixels[sidx    ];
      disp.pixels[idx + 1] = bg.pixels[sidx + 1];
      disp.pixels[idx + 2] = bg.pixels[sidx + 2];
      disp.pixels[idx + 3] = 255;
    }
  }

  disp.updatePixels();
  image(disp, 0, 0);
}

function updateCanvasScale() {
  const s = min(windowWidth / BASE_WIDTH, windowHeight / BASE_HEIGHT) * 0.95;
  const c = document.querySelector('canvas');
  c.style.transform = `scale(${s})`;
  c.style.position  = 'absolute';
  c.style.left      = `calc(50% - ${BASE_WIDTH * s / 2}px)`;
  c.style.top       = `calc(50% - ${BASE_HEIGHT * s / 2}px)`;
}

function windowResized() {
  updateCanvasScale();
}

// ==== Dynamic Drawing of Bull） ====
function drawCow(elapsed) {
  const animSpeed = 0.15;
  const animAmplitude = 0.06;
  let swingAngle = sin(elapsed * 60 * animSpeed) * animAmplitude;

  const pivot1 = createVector(610, 370),
        pivot2 = createVector(500, 395),
        pivot3 = createVector(350, 440),
        pivot4 = createVector(160, 420);

  // Body
  drawRoughPolygon(body, 1, '#000000', 14);

  // Alternate swinging of four legs
  push();
    translate(pivot1.x, pivot1.y);
    rotate(swingAngle);
    translate(-pivot1.x, -pivot1.y);
    drawPatternedLeg(leg1, elapsed + 1.0);
  pop();

  push();
    translate(pivot2.x, pivot2.y);
    rotate(-swingAngle);
    translate(-pivot2.x, -pivot2.y);
    drawPatternedLeg(leg2, elapsed + 2.0);
  pop();

  push();
    translate(pivot3.x, pivot3.y);
    rotate(swingAngle);
    translate(-pivot3.x, -pivot3.y);
    drawPatternedLeg(leg3, elapsed + 3.0);
  pop();

  push();
    translate(pivot4.x, pivot4.y);
    rotate(-swingAngle);
    translate(-pivot4.x, -pivot4.y);
    drawPatternedLeg(leg4, elapsed + 4.0);
  pop();

  // Bull Horn
  drawRoughPolygon(horn1, 0, '#FFFFFF', 10);
  drawRoughPolygon(horn2, 0, '#FFFFFF', 10);
}

function drawPatternedLeg(pts, t) {
  let g = createGraphics(width, height);
  g.colorMode(HSB, 360, 100, 100, 100);  // Alpha Support
  g.noFill();
  g.noStroke();

  const numStripes = 60;
  for (let i = 0; i < numStripes; i++) {
    let seedX = random(width);
    let seedY = random(height);
    if (!insidePolygon(seedX, seedY, pts)) continue;

    let path = [];
    let px = seedX;
    let py = seedY;

    for (let j = 0; j < 40; j++) {
      if (!insidePolygon(px, py, pts)) break;
      path.push({ x: px, y: py });

      let angle = noise(px * 0.01, py * 0.01, t) * TWO_PI * 2;
      px += cos(angle) * 3.5;
      py += sin(angle) * 3.5;
    }

    let baseHue = map(noise(seedX * 0.01, seedY * 0.01, t), 0, 1, 220, 275);
    g.stroke(baseHue, 60, 100, 50); // 使用 alpha
    g.strokeWeight(random(1, 2.5));
    g.noFill();
    g.beginShape();
    for (let p of path) g.curveVertex(p.x, p.y);
    g.endShape();
  }

  for (let i = 0; i < 35; i++) {
    const idx = floor(random(pts.length));
    const p = pts[idx];
    const offset = p5.Vector.random2D().mult(random(5, 25));
    const cx = p.x + offset.x;
    const cy = p.y + offset.y;
    if (insidePolygon(cx, cy, pts)) {
      let hue = map(noise(cx * 0.02, cy * 0.02), 0, 1, 210, 280);
      g.noStroke();
      g.fill(hue, 50, 100, 70);
      g.ellipse(cx, cy, random(4, 10));
    }
  }

  drawRoughPolygon(pts, 1, '#a4c6f3', 14);
  image(g, 0, 0);
}

function drawRoughPolygon(pts, jitter = 8, fillCol = '#dbb277', stepDiv = 14) {
  if (!pts || pts.length < 2) return;
  let jittered = [];
  for (let i = 0; i < pts.length; i++) {
    let p1 = pts[i];
    let p2 = pts[(i + 1) % pts.length];
    let steps = int(p5.Vector.dist(p1, p2) / stepDiv);
    for (let t = 0; t < steps; t++) {
      let x = lerp(p1.x, p2.x, t / steps);
      let y = lerp(p1.y, p2.y, t / steps);
      let angle = atan2(p2.y - p1.y, p2.x - p1.x) + HALF_PI;
      let d = random(-jitter, jitter);
      x += cos(angle) * d;
      y += sin(angle) * d;
      jittered.push(createVector(x, y));
    }
  }
  noStroke();
  fill(fillCol);
  beginShape();
  for (let v of jittered) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
}

function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Pausing/resuming animations (space bar)
function keyPressed() {
  if (key === ' ') {
    running = !running;
    if (running) {
      cowStartTime += (millis() - pauseTime); // Seamless animation transitions
      loop();
    } else {
      pauseTime = millis();
      noLoop();
    }
  }
}