// 存放物件的陣列
let monsters = [];
let particles = []; 

// 遊戲機制變數
let score = 0;          
let gameTime = 30;      
let startFrame;         
let gameOver = false;   

function setup() {
  createCanvas(windowWidth, windowHeight);
  startFrame = frameCount;
  
  // 初始產生 10 隻小怪獸
  for (let i = 0; i < 10; i++) {
    spawnMonster(random(width), random(height));
  }
}

function draw() {
  background(30, 30, 45); 
  
  // 繪製與更新所有的爆炸粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.draw();
    if (p.isDead()) {
      particles.splice(i, 1); 
    }
  }

  // --- 遊戲進行中 ---
  if (!gameOver) {
    let elapsedFrames = frameCount - startFrame;
    let timeLeft = gameTime - floor(elapsedFrames / 60);
    
    if (timeLeft <= 0) {
      timeLeft = 0;
      gameOver = true; 
    }
    
    // 只有這裡保留自動生成 (每 90 幀 / 約 1.5 秒生一隻)
    if (elapsedFrames % 90 === 0) {
      spawnMonster(random(width), random(height));
    }
    
    for (let m of monsters) {
      m.update();     
      m.draw();       
      m.checkMouse(); 
    }
    
    drawUI(timeLeft);
    
  } else {
    drawGameOverScreen();
  }
}

// 產生怪獸
function spawnMonster(x, y) {
  let m = new Monster({
    p: createVector(x, y),
    r: random(35, 65)
  });
  monsters.push(m);
}

// --- 修改過後的滑鼠點擊事件 ---
function mousePressed() {
  if (gameOver) {
    restartGame();
    return;
  }
  
  for (let i = monsters.length - 1; i >= 0; i--) {
    let m = monsters[i];
    let d = dist(mouseX, mouseY, m.p.x, m.p.y);
    
    if (d < m.r) {
      // 產生爆炸粒子
      for (let j = 0; j < 20; j++) { 
        particles.push(new Particle(m.p.x, m.p.y, m.color));
      }

      monsters.splice(i, 1); // 移除怪獸
      score++;               // 加分
      
      // ⬇️ 我們把原本在這裡立刻重生怪獸的那行程式碼刪除了！
      
      break; 
    }
  }
}

function drawUI(timeLeft) {
  push();
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("⏱️ 時間: " + timeLeft + " 秒", 20, 20);
    
    textAlign(RIGHT, TOP);
    fill("#39FF14"); 
    text("⭐ 分數: " + score, width - 20, 20);
  pop();
}

function drawGameOverScreen() {
  push();
    textAlign(CENTER);
    fill(15, 15, 25, 200);
    rect(0, 0, width, height);
    
    fill("#FF007F"); 
    textSize(64);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 50);
    
    fill(255);
    textSize(32);
    text("你的最終得分: " + score + " 分", width / 2, height / 2 + 20);
    
    textSize(18);
    fill(200);
    text("( 點擊滑鼠畫面的任意地方重新開始 )", width / 2, height / 2 + 80);
  pop();
}

function restartGame() {
  monsters = [];
  particles = []; 
  score = 0;
  startFrame = frameCount;
  gameOver = false;
  
  for (let i = 0; i < 10; i++) {
    spawnMonster(random(width), random(height));
  }
}

// ==========================================
// --- 爆炸粒子特效的類別 ---
// ==========================================
class Particle {
  constructor(x, y, monsterColor) {
    this.p = createVector(x, y); 
    this.v = p5.Vector.random2D().mult(random(2, 8)); 
    this.color = monsterColor; 
    this.alpha = 255; 
    this.size = random(5, 12); 
  }

  update() {
    this.p.add(this.v); 
    this.v.mult(0.9);   
    this.alpha -= 10;   
    this.size *= 0.95;  
  }

  draw() {
    push();
      noStroke();
      let c = color(this.color);
      c.setAlpha(this.alpha); 
      fill(c);
      circle(this.p.x, this.p.y, this.size);
    pop();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

// ==========================================
// --- 怪獸的類別定義 ---
// ==========================================
class Monster {
  constructor(args) {
    this.r = args.r || 50;
    this.p = args.p || createVector(width / 2, height / 2);
    this.v = createVector(random(-1.5, 1.5), random(-1.5, 1.5)); 
    this.a = createVector(0, 0);
    this.color = random(["#FF007F", "#00F0FF", "#39FF14", "#B026FF"]); 
    this.mode = "happy"; 
    this.rId = random(1000); 
  }

  draw() {
    push();
      translate(this.p.x, this.p.y);
      
      stroke(255, 150);
      strokeWeight(3);
      line(-this.r/2, -this.r/2, -this.r, -this.r); 
      line(this.r/2, -this.r/2, this.r, -this.r);   
      noStroke();
      fill(this.color);
      circle(-this.r, -this.r, 15); 
      circle(this.r, -this.r, 15);  

      if (this.mode === "scared") {
        fill(40, 0, 0); 
        stroke(255, 50, 50); 
        strokeWeight(4);
      } else {
        fill(this.color);
        noStroke();
      }

      beginShape();
      for (let angle = 0; angle < TWO_PI; angle += 0.1) {
        let offset = map(sin(angle * 8 + frameCount * 0.2 + this.rId), -1, 1, -15, 5);
        let r_wave = this.r + offset;
        let x = r_wave * cos(angle);
        let y = r_wave * sin(angle);
        vertex(x, y);
      }
      endShape(CLOSE);

      if (this.mode === "scared") {
        stroke(255);
        strokeWeight(3);
        noFill();
        
        line(-this.r/3, -this.r/4, -this.r/6, -this.r/8);
        line(-this.r/6, -this.r/8, -this.r/3, 0);
        line(this.r/3, -this.r/4, this.r/6, -this.r/8);
        line(this.r/6, -this.r/8, this.r/3, 0);

        beginShape();
        vertex(-this.r/3, this.r/3);
        vertex(-this.r/6, this.r/4);
        vertex(0, this.r/3);
        vertex(this.r/6, this.r/4);
        vertex(this.r/3, this.r/3);
        endShape();

      } else {
        fill(255);
        noStroke();
        
        ellipse(-this.r/3, -this.r/6, this.r/2.5, this.r/2.5);
        ellipse(this.r/3, -this.r/6, this.r/2.5, this.r/2.5);

        fill(20);
        let pupilOffset = sin(frameCount * 0.05 + this.rId) * 3; 
        ellipse(-this.r/3 + pupilOffset, -this.r/6, this.r/4, this.r/4);
        ellipse(this.r/3 + pupilOffset, -this.r/6, this.r/4, this.r/4);

        fill(255);
        ellipse(-this.r/3 + pupilOffset - 3, -this.r/6 - 3, this.r/10, this.r/10);
        ellipse(this.r/3 + pupilOffset - 3, -this.r/6 - 3, this.r/10, this.r/10);

        fill(255, 100, 150, 150); 
        ellipse(-this.r/2, this.r/6, this.r/3, this.r/4);
        ellipse(this.r/2, this.r/6, this.r/3, this.r/4);

        noFill();
        stroke(20);
        strokeWeight(2);
        arc(-this.r/8, this.r/4, this.r/4, this.r/4, 0, PI);
        arc(this.r/8, this.r/4, this.r/4, this.r/4, 0, PI);
      }
    pop();
  }

  update() {
    this.p.add(this.v); 
    this.v.add(this.a); 
    this.v.mult(0.99); 
    
    if (this.p.x < 0 || this.p.x > width) this.v.x *= -1;
    if (this.p.y < 0 || this.p.y > height) this.v.y *= -1;
    
    this.a.mult(0);
  }

  checkMouse() {
    let d = dist(mouseX, mouseY, this.p.x, this.p.y);
    if (d < this.r + 50) { 
      this.mode = "scared"; 
      let mouseV = createVector(mouseX, mouseY);
      let fleeForce = p5.Vector.sub(this.p, mouseV); 
      fleeForce.setMag(0.5); 
      this.a.add(fleeForce); 
    } else {
      this.mode = "happy"; 
    }
  }
}