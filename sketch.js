const BASE_WIDTH = 840;
const BASE_HEIGHT = 620;

let textureOverlay;
let body, leg1, leg2, leg3, leg4, horn1, horn2;
let startTime = 0;
let paused = false;
let pausedAt = 0;

function setup() {
  createCanvas(BASE_WIDTH, BASE_HEIGHT);
  updateCanvasScale();
  textureOverlay = createGraphics(width, height);
  createGrainTexture(textureOverlay);
  startTime = millis();

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
  leg1 = [ createVector(580,350), createVector(642,384), createVector(672,438), createVector(634,421), createVector(638,414), createVector(515,385), ];
  leg2 = [ createVector(515,384), createVector(518,477), createVector(490,467), createVector(472,400), ];
  leg3 = [ createVector(378,428), createVector(330,434), createVector(235,514), createVector(221,546), createVector(186,553), createVector(132,593), createVector(125,580), createVector(131,542), createVector(144,530), createVector(200,497), createVector(223,452), ];
  leg4 = [ createVector(175,466), createVector(143,495), createVector(143,495), createVector(119,500), createVector(125,501), createVector(108,533), createVector(93,582), createVector(73,583), createVector(59,587), createVector(37,568), createVector(82,500), createVector(81,480), createVector(143,410), ];
  horn1 = [ createVector(668,169), createVector(685,190), createVector(729,183), ];
  horn2 = [ createVector(488,128), createVector(506,143), createVector(622,125), ];
}

function draw() {
  let elapsed = paused ? (pausedAt - startTime) / 1000.0 : (millis() - startTime) / 1000.0;

  // 1. 动态背景：彩色油画刷痕 + 时间波动
  drawDynamicBackground(elapsed);

  // 2. 明显的牛动画
  drawCow(elapsed);

  // 3. 叠加噪点纹理
  push();
  blendMode(OVERLAY);
  image(textureOverlay, 0, 0);
  blendMode(BLEND);
  pop();
}

// ================= 动态油画背景 ===================
const colours = [ "#fccace", "#bcbdf5", "#f5ce20", "#f56020", "#003366", "#6699cc" ];
function drawDynamicBackground(elapsed) {
  // 直接在主canvas绘制（不缓存）
  background(230, 235, 255); // base
  let numStrokes = 11000;
  let strokeLength = 32;
  let noiseScale = 0.005 + 0.002 * sin(elapsed * 0.3);

  for (let i = 0; i < numStrokes; i++) {
    let x = random(width);
    let y = random(height);

    // 动态色彩随时间跳动
    let n = noise(x * noiseScale, y * noiseScale, elapsed * 0.07);
    let colourIndex = int((n + 0.13 * sin(elapsed + x * 0.001 + y * 0.001)) * colours.length) % colours.length;
    let dabColor = colours[(colourIndex + colours.length) % colours.length];

    stroke(dabColor + "99"); // 半透明
    strokeWeight(random(1.5, 4));
    // 动态角度，背景“呼吸感”
    let angle = map(noise(x * 0.03, y * 0.03, elapsed * 0.07), 0, 1, 0, TWO_PI * 2)
                  + sin(elapsed * 0.5 + x * 0.001) * 0.7;

    let len = strokeLength * (1.1 + 0.3 * sin(elapsed * 0.21 + x * 0.004 + y * 0.004));
    let px = x + cos(angle) * len;
    let py = y + sin(angle) * len;
    line(x, y, px, py);
  }
}

// ================ 让牛动感更强，动画更夸张 ================
function drawCow(elapsed) {
  // 动画参数：频率和幅度都提升
  const animSpeed = 2.2;           // 更快
  const animAmplitude = 0.34;      // 幅度更大

  // 让牛整体上下小幅度跳动（用作动态示范）
  let globalY = sin(elapsed * 1.1) * 12;

  // 四肢大幅度摇摆，时间变化明显
  let swingAngle = sin(elapsed * animSpeed) * animAmplitude;

  // 牛身体整体略抖动
  let bodyShakeX = sin(elapsed * 2.3) * 5;
  let bodyShakeY = cos(elapsed * 1.7) * 4;

  // 身体
  push();
  translate(bodyShakeX, globalY + bodyShakeY);
  drawRoughPolygon(body, 2, '#1a1a1a', 13);
  pop();

  // 四条腿（pivot点可以灵活微调）
  let pivots = [
    createVector(610, 370), // leg1
    createVector(500, 395), // leg2
    createVector(350, 440), // leg3
    createVector(160, 420), // leg4
  ];
  let legs = [leg1, leg2, leg3, leg4];
  let signs = [+1, -1, +1, -1];
  for (let i = 0; i < 4; i++) {
    push();
    translate(pivots[i].x + bodyShakeX, pivots[i].y + globalY + bodyShakeY);
    rotate(swingAngle * signs[i] * (0.92 + 0.06 * i)); // 每条腿相位略有不同
    translate(-pivots[i].x - bodyShakeX, -pivots[i].y - globalY - bodyShakeY);
    drawRoughPolygon(legs[i], 2, '#1a1a1a', 13);
    pop();
  }

  // 牛角 & 眼睛
  drawRoughPolygon(horn1, 0.5, '#FFFFFF', 10);
  drawRoughPolygon(horn2, 0.5, '#F5F5F5', 10);
}

function drawRoughPolygon(polygonVertices, jitter = 8, fillCol = '#dbb277', stepDiv = 14) {
  if (polygonVertices.length === 0) return;
  let jittered = [];
  for (let i = 0; i < polygonVertices.length; i++) {
    let p1 = polygonVertices[i];
    let p2 = polygonVertices[(i + 1) % polygonVertices.length];
    let steps = int(dist(p1.x, p1.y, p2.x, p2.y) / stepDiv);
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
  for (let v of jittered) vertex(v.x, v.y);
  endShape(CLOSE);
}

function createGrainTexture(graphics) {
  const grainAmount = 100000;
  graphics.noStroke();
  for (let i = 0; i < grainAmount; i++) {
    const x = random(width);
    const y = random(height);
    const alpha = random(0, 15);
    if (random() > 0.5) {
      graphics.fill(255, alpha);
    } else {
      graphics.fill(0, alpha);
    }
    graphics.rect(x, y, 1, 1);
  }
}

function updateCanvasScale() { 
    const scaleFactor = Math.min(windowWidth / BASE_WIDTH, windowHeight / BASE_HEIGHT) * 0.95; 
    const canvasEl = document.querySelector('canvas');
    canvasEl.style.transform = `scale(${scaleFactor})`;
    canvasEl.style.position = 'absolute';
    canvasEl.style.left = `calc(50% - ${BASE_WIDTH * scaleFactor / 2}px)`;
    canvasEl.style.top = `calc(50% - ${BASE_HEIGHT * scaleFactor / 2}px)`;
}

function windowResized() {
    updateCanvasScale();
}

function keyPressed() {
  if (key === ' ') {
    if (!paused) {
      paused = true;
      pausedAt = millis();
      noLoop();
    } else {
      paused = false;
      startTime += (millis() - pausedAt);
      loop();
    }
  }
}
