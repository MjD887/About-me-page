// Kaleidoscope
const canvas = document.getElementById('kaleidoscope');
const ctx = canvas.getContext('2d');
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let points = [];
let clickCount = 0;
let gameActive = false;

// Draw octagon helper
function drawOctagon(ctx, x, y, size, fillColor, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 8;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

canvas.addEventListener('click', () => {
  if (countdownActive) return;
  clickCount++;
  if (clickCount === 2) {
    gameActive = true;
    clickCount = 0;
    initSnakeGame();
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (gameActive || countdownActive) return;
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  // Add new points in pentagon pattern around mouse
  if (Math.random() > 0.5) {
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i;
      const offsetX = Math.cos(angle) * 15;
      const offsetY = Math.sin(angle) * 15;
      
      const colorChoice = Math.random();
      let hue;
      if (colorChoice < 0.33) {
        hue = 180; // Teal/Cyan
      } else if (colorChoice < 0.66) {
        hue = 200; // Baby Blue
      } else {
        hue = 160; // Dark Teal/Green
      }
      
      points.push({
        x: mouseX + offsetX,
        y: mouseY + offsetY,
        hue: hue,
        life: 80
      });
    }
  }
});

function drawKaleidoscope() {
  if (gameActive || countdownActive) {
    requestAnimationFrame(drawKaleidoscope);
    return;
  }

  ctx.fillStyle = 'rgba(0, 31, 63, 0.12)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Update and draw points
  points = points.filter(p => p.life > 0);
  points.forEach(p => {
    p.life -= 1;
    const opacity = p.life / 80;

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i;
      const x = centerX + (p.x - centerX) * Math.cos(angle) - (p.y - centerY) * Math.sin(angle);
      const y = centerY + (p.x - centerX) * Math.sin(angle) + (p.y - centerY) * Math.cos(angle);

      // Draw single octagon layer for cleaner effect
      const baseColor = `hsl(${p.hue}, 100%, 50%)`;
      drawOctagon(ctx, x, y, 4 * opacity, baseColor, opacity * 0.5);
    }
  });

  requestAnimationFrame(drawKaleidoscope);
}

// Snake Game
let snake, food, direction, nextDirection, score;
let countdown = 3;
let countdownActive = false;
let gameLoopActive = false;

function initSnakeGame() {
  countdown = 3;
  countdownActive = true;
  
  const countdownInterval = setInterval(() => {
    ctx.fillStyle = 'rgb(0, 31, 63)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 153, 153)';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    
    countdown--;
    
    if (countdown < 0) {
      clearInterval(countdownInterval);
      countdownActive = false;
      startSnakeGame();
    }
  }, 1000);
}

function startSnakeGame() {
  snake = [{x: 10, y: 10}];
  food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
  direction = {x: 1, y: 0};
  nextDirection = {x: 1, y: 0};
  score = 0;
  gameLoopActive = true;

  document.addEventListener('keydown', handleSnakeInput);
  gameLoopSnake();
}

function handleSnakeInput(e) {
  const key = e.key.toLowerCase();
  const arrowKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  
  if (arrowKeys.includes(key)) {
    e.preventDefault();
  }
  
  let newDirection = null;
  if (key === 'arrowup' || key === 'w') newDirection = {x: 0, y: -1};
  if (key === 'arrowdown' || key === 's') newDirection = {x: 0, y: 1};
  if (key === 'arrowleft' || key === 'a') newDirection = {x: -1, y: 0};
  if (key === 'arrowright' || key === 'd') newDirection = {x: 1, y: 0};
  
  // Prevent reversing into the snake's body
  if (newDirection && !(newDirection.x === -direction.x && newDirection.y === -direction.y)) {
    nextDirection = newDirection;
  }
}

function gameLoopSnake() {
  if (!gameLoopActive) return;

  direction = nextDirection;
  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameLoopActive = false;
    gameActive = false;
    document.removeEventListener('keydown', handleSnakeInput);
    playExplosionEffect();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
  } else {
    snake.pop();
  }

  drawSnakeGameOnCanvas();
  setTimeout(gameLoopSnake, 100);
}

function drawSnakeGameOnCanvas() {
  ctx.fillStyle = 'rgb(0, 31, 63)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cellSize = 20;

  ctx.fillStyle = 'rgb(0, 153, 153)';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 2, cellSize - 2);
  });

  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 2, cellSize - 2);

  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, 10, 10);
  ctx.fillText('Double-click to exit', 10, 30);
}

function playExplosionEffect() {
  let explosionRadius = 0;
  const maxRadius = 150;
  const cellSize = 20;
  let explosionAlpha = 1;

  function drawExplosion() {
    // Draw base game
    ctx.fillStyle = 'rgb(0, 31, 63)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw pixelized explosion ripple
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const distance = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 10, 2)) * cellSize;
        
        // Explosion ripple effect with red and orange colors
        if (distance < explosionRadius && distance > explosionRadius - 30) {
          const colors = ['rgb(255, 100, 0)', 'rgb(255, 50, 50)'];
          const hue = colors[Math.floor(Math.random() * colors.length)];
          const fadeAmount = 1 - (distance - (explosionRadius - 30)) / 30;
          const rgbMatch = hue.match(/\d+/g);
          ctx.fillStyle = `rgba(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]}, ${explosionAlpha * fadeAmount})`;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    explosionRadius += 6;
    explosionAlpha -= 0.015;

    if (explosionRadius < maxRadius && explosionAlpha > 0) {
      requestAnimationFrame(drawExplosion);
    } else {
      flashFade();
    }
  }

  drawExplosion();
}

function flashFade() {
  let flashAlpha = 1;
  const flashDuration = 300;
  const startTime = Date.now();

  function drawFlash() {
    const elapsed = Date.now() - startTime;
    flashAlpha = Math.max(0, 1 - (elapsed / flashDuration));

    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.6})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (flashAlpha > 0) {
      requestAnimationFrame(drawFlash);
    } else {
      setTimeout(() => {
        alert(`Game Over! Score: ${score}`);
        clickCount = 0;
        points = [];
      }, 100);
    }
  }

  drawFlash();
}

// Flappy Chicken Game
const flappyCanvas = document.getElementById('flappyChicken');
const flappyCtx = flappyCanvas.getContext('2d');
let flappyGameActive = false;
let flappyScore = 0;
let flappyHighScore = localStorage.getItem('flappyHighScore') ? parseInt(localStorage.getItem('flappyHighScore')) : 0;
let flappyGameStarted = false;
let flappyGameOver = false;

let flappyChicken = {
  x: 50,
  y: 150,
  width: 30,
  height: 30,
  velocityY: 0,
  gravity: 0.25,
  flapPower: -5.5
};

let flappyPipes = [];
let flappyPipeWidth = 60;
let flappyPipeGap = 140;
let flappyPipeSpeed = 2;
let flappyPipeSpawnTimer = 0;

function drawChicken(x, y, width, height) {
  const pixelSize = 2;
  
  // Body (golden/orange pixelated)
  flappyCtx.fillStyle = '#FFD700';
  flappyCtx.fillRect(x - 8, y - 4, 16, 12);
  
  // Darker shading on body
  flappyCtx.fillStyle = '#FFC700';
  flappyCtx.fillRect(x - 8, y + 4, 16, 4);
  
  // Head
  flappyCtx.fillStyle = '#FFD700';
  flappyCtx.fillRect(x + 4, y - 12, 8, 8);
  
  // Comb (red pixelated)
  flappyCtx.fillStyle = '#FF4444';
  flappyCtx.fillRect(x + 6, y - 14, 4, 2);
  flappyCtx.fillRect(x + 8, y - 16, 2, 2);
  flappyCtx.fillRect(x + 4, y - 15, 2, 2);
  
  // Eye (black)
  flappyCtx.fillStyle = '#000000';
  flappyCtx.fillRect(x + 7, y - 10, 2, 2);
  flappyCtx.fillStyle = '#FFFFFF';
  flappyCtx.fillRect(x + 8, y - 10, 1, 1);
  
  // Beak (orange)
  flappyCtx.fillStyle = '#FF8C00';
  flappyCtx.fillRect(x + 12, y - 8, 4, 2);
  
  // Wing (darker gold)
  flappyCtx.fillStyle = '#FFA500';
  flappyCtx.fillRect(x - 10, y - 4, 6, 8);
  
  // Tail feathers
  flappyCtx.fillStyle = '#FF8C00';
  flappyCtx.fillRect(x - 12, y - 4, 2, 2);
  flappyCtx.fillRect(x - 14, y, 2, 2);
  flappyCtx.fillRect(x - 12, y + 4, 2, 2);
}

function drawFlappyPipe(pipe) {
  // Top pipe with white color
  const topPipeHeight = pipe.topHeight;
  flappyCtx.fillStyle = '#FFFFFF';
  flappyCtx.fillRect(pipe.x, 0, flappyPipeWidth, topPipeHeight);
  
  // Add subtle shadow details to white pipe
  for (let py = 0; py < topPipeHeight; py += 4) {
    for (let px = pipe.x; px < pipe.x + flappyPipeWidth; px += 4) {
      if (Math.random() > 0.7) {
        flappyCtx.fillStyle = '#E0E0E0';
        flappyCtx.fillRect(px, py, 2, 2);
      }
    }
  }
  
  // Add vertical lines for styling
  flappyCtx.strokeStyle = '#D0D0D0';
  flappyCtx.lineWidth = 1;
  for (let x = pipe.x + 10; x < pipe.x + flappyPipeWidth; x += 10) {
    flappyCtx.beginPath();
    flappyCtx.moveTo(x, 0);
    flappyCtx.lineTo(x, topPipeHeight);
    flappyCtx.stroke();
  }
  
  // Bottom pipe with white color
  const bottomPipeStart = pipe.topHeight + flappyPipeGap;
  const bottomPipeHeight = flappyCanvas.height - bottomPipeStart;
  flappyCtx.fillStyle = '#FFFFFF';
  flappyCtx.fillRect(pipe.x, bottomPipeStart, flappyPipeWidth, bottomPipeHeight);
  
  // Add subtle shadow details to white pipe
  for (let py = bottomPipeStart; py < flappyCanvas.height; py += 4) {
    for (let px = pipe.x; px < pipe.x + flappyPipeWidth; px += 4) {
      if (Math.random() > 0.7) {
        flappyCtx.fillStyle = '#E0E0E0';
        flappyCtx.fillRect(px, py, 2, 2);
      }
    }
  }
  
  // Add vertical lines for styling on bottom pipe
  flappyCtx.strokeStyle = '#D0D0D0';
  flappyCtx.lineWidth = 1;
  for (let x = pipe.x + 10; x < pipe.x + flappyPipeWidth; x += 10) {
    flappyCtx.beginPath();
    flappyCtx.moveTo(x, bottomPipeStart);
    flappyCtx.lineTo(x, flappyCanvas.height);
    flappyCtx.stroke();
  }
  
  // Pipe edges
  flappyCtx.strokeStyle = '#D0D0D0';
  flappyCtx.lineWidth = 2;
  flappyCtx.strokeRect(pipe.x, 0, flappyPipeWidth, topPipeHeight);
  flappyCtx.strokeRect(pipe.x, bottomPipeStart, flappyPipeWidth, bottomPipeHeight);
}

function updateFlappyGame() {
  if (!flappyGameStarted) return;

  // Update chicken
  flappyChicken.velocityY += flappyChicken.gravity;
  flappyChicken.y += flappyChicken.velocityY;

  // Boundary collision
  if (flappyChicken.y - flappyChicken.height / 2 < 0 || flappyChicken.y + flappyChicken.height / 2 > flappyCanvas.height) {
    endFlappyGame();
    return;
  }

  // Spawn pipes
  flappyPipeSpawnTimer++;
  if (flappyPipeSpawnTimer > 90) {
    const topHeight = Math.random() * (flappyCanvas.height - flappyPipeGap - 80) + 40;
    flappyPipes.push({
      x: flappyCanvas.width,
      topHeight: topHeight,
      scored: false
    });
    flappyPipeSpawnTimer = 0;
  }

  // Update pipes
  for (let i = flappyPipes.length - 1; i >= 0; i--) {
    flappyPipes[i].x -= flappyPipeSpeed;

    // Scoring
    if (!flappyPipes[i].scored && flappyPipes[i].x + flappyPipeWidth < flappyChicken.x) {
      flappyScore++;
      flappyPipes[i].scored = true;
    }

    // Collision detection
    if (flappyChicken.x + flappyChicken.width / 2 > flappyPipes[i].x &&
        flappyChicken.x - flappyChicken.width / 2 < flappyPipes[i].x + flappyPipeWidth) {
      if (flappyChicken.y - flappyChicken.height / 2 < flappyPipes[i].topHeight ||
          flappyChicken.y + flappyChicken.height / 2 > flappyPipes[i].topHeight + flappyPipeGap) {
        endFlappyGame();
        return;
      }
    }

    // Remove pipes off screen
    if (flappyPipes[i].x + flappyPipeWidth < 0) {
      flappyPipes.splice(i, 1);
    }
  }
}

function drawFlappyGame() {
  // Light blue background
  flappyCtx.fillStyle = '#87CEEB';
  flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  // Draw white clouds
  const drawCloud = (x, y, size) => {
    flappyCtx.fillStyle = '#FFFFFF';
    flappyCtx.beginPath();
    flappyCtx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    flappyCtx.arc(x + size * 0.8, y, size * 0.7, 0, Math.PI * 2);
    flappyCtx.arc(x + size * 1.6, y, size * 0.6, 0, Math.PI * 2);
    flappyCtx.fill();
  };
  
  // Draw multiple clouds at different positions
  drawCloud(50, 50, 15);
  drawCloud(200, 80, 18);
  drawCloud(320, 40, 16);

  // Draw pipes
  flappyPipes.forEach(pipe => drawFlappyPipe(pipe));

  // Draw chicken
  drawChicken(flappyChicken.x, flappyChicken.y, flappyChicken.width, flappyChicken.height);

  // Draw score and high score
  flappyCtx.fillStyle = 'black';
  flappyCtx.font = 'bold 16px Arial';
  flappyCtx.textAlign = 'left';
  flappyCtx.textBaseline = 'top';
  flappyCtx.fillText(`Score: ${flappyScore}`, 10, 10);
  flappyCtx.fillText(`High Score: ${flappyHighScore}`, 10, 32);

  if (!flappyGameStarted) {
    flappyCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
    flappyCtx.fillStyle = 'white';
    flappyCtx.font = 'bold 20px Arial';
    flappyCtx.textAlign = 'center';
    flappyCtx.fillText('Click to Start', flappyCanvas.width / 2, flappyCanvas.height / 2);
  }

  updateFlappyGame();
  requestAnimationFrame(drawFlappyGame);
}

function endFlappyGame() {
  flappyGameStarted = false;
  flappyGameOver = true;
  
  // Update high score if current score is higher
  if (flappyScore > flappyHighScore) {
    flappyHighScore = flappyScore;
    localStorage.setItem('flappyHighScore', flappyHighScore);
  }
  
  setTimeout(() => {
    alert(`Game Over! Score: ${flappyScore}\nHigh Score: ${flappyHighScore}`);
    resetFlappyGame();
  }, 100);
}

function resetFlappyGame() {
  flappyChicken.y = 150;
  flappyChicken.velocityY = 0;
  flappyPipes = [];
  flappyScore = 0;
  flappyPipeSpawnTimer = 0;
  flappyGameOver = false;
}

flappyCanvas.addEventListener('click', () => {
  if (!flappyGameStarted && !flappyGameOver) {
    flappyGameStarted = true;
  } else if (flappyGameStarted) {
    flappyChicken.velocityY = flappyChicken.flapPower;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!flappyGameStarted && !flappyGameOver) {
      flappyGameStarted = true;
    } else if (flappyGameStarted) {
      flappyChicken.velocityY = flappyChicken.flapPower;
    }
  }
});

drawFlappyGame();
drawKaleidoscope();
