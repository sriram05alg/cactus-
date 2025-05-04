const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Bird image
const birdImage = new Image();
birdImage.src = 'images/bird2.png';

// Coin image
const coinImage = new Image();
coinImage.src = 'images/coin.png'; // Make sure you have a coin.png!

// Background image
const bgImage = new Image();
bgImage.src = 'images/background.jpg';

// Background music
const backgroundMusic = new Audio('audio/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

window.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
  }
});

// Bird properties
let birdX = canvas.width / 3;
let birdY = 0;
const birdWidth = 65;   // Increased bird size
const birdHeight = 65;
let velocity = 0;
const gravity = 0.3;
const lift = -8;
let pipes = [];
let pipeGap = 500;
const pipeSpacing = 350;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let passedPipes = 0;

// Background movement
let bgX = 0;
const bgSpeed = 0.5;

// Glitter stars
let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.2,
    alpha: Math.random(),
    alphaChange: Math.random() * 0.02
  });
}

// Coin properties
// Coin properties
let coin = {
  x: canvas.width + 500,
  y: Math.random() * (canvas.height - 100) + 50,
  width: 65,  // Coin is bigger now
  height: 75,
  speed: 2
};


// Funny comments
const funnyComments = [
  "Woohoo! I’m a bird with a mission!",
  "Not today, pipes! I’m unstoppable!",
  "Flap, flap, BOOM! Another pipe down!",
  "Bird power activated! Woohoo!",
  "Pipes? What pipes? I fly through them!",
  "Legend says the bird never falls!",
  "I'm basically an avian superhero!"
];

let currentFunnyComment = "";

// Latest badge
let latestBadge = "";

function awardBadge(score) {
  if (score === 3) latestBadge = "Beginner Flyer";
  else if (score === 9) latestBadge = "Pipe Dodger";
  else if (score === 18) latestBadge = "Flappy Master";
  else if (score === 30) latestBadge = "Sky Legend";
}

// Create new pipe
function createPipe() {
  const pipeY = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
  pipes.push({ x: canvas.width, y: pipeY });
}

// Update funny comment
function updateFunnyComment() {
  currentFunnyComment = funnyComments[Math.floor(Math.random() * funnyComments.length)];
}

// Reset game
function resetGame() {
  birdY = 0;
  velocity = 0;
  pipes = [];
  score = 0;
  passedPipes = 0;
  pipeGap = 500;
  latestBadge = "";
  gameOver = false;
  currentFunnyComment = "";
  coin.x = canvas.width + 500;
  coin.y = Math.random() * (canvas.height - 100) + 50;
  document.getElementById('restartBtn').style.display = 'none';
  backgroundMusic.play();
}

// Controls
window.addEventListener('keydown', function (event) {
  if (event.key === ' ') {
    velocity = lift;
  }
});

// Restart
document.getElementById('restartBtn').addEventListener('click', () => {
  resetGame();
});
document.getElementById('restartBtn').addEventListener('touchstart', function(e) {
  e.preventDefault();
  resetGame();
});


// Update game
function update() {
  if (gameOver) {
    backgroundMusic.pause();
    return;
  }

  velocity += gravity;
  birdY += velocity;

  bgX -= bgSpeed;
  if (bgX <= -canvas.width) {
    bgX = 0;
  }

  // Update stars
  stars.forEach(star => {
    star.x -= star.speed;
    if (star.x < 0) {
      star.x = canvas.width;
      star.y = Math.random() * canvas.height;
    }
    star.alpha += star.alphaChange;
    if (star.alpha <= 0 || star.alpha >= 1) {
      star.alphaChange *= -1;
    }
  });

  // Coin movement
  coin.x -= coin.speed;
  if (coin.x + coin.width < 0) {
    coin.x = canvas.width + Math.random() * 500;
    coin.y = Math.random() * (canvas.height - 100) + 50;
  }

  // Create pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeSpacing) {
    createPipe();
  }

  pipes.forEach(pipe => {
    pipe.x -= 2;
  });

  pipes = pipes.filter(pipe => pipe.x + 80 > 0);

  pipes.forEach(pipe => {
    if (pipe.x + 80 === birdX) {
      score++;
      passedPipes++;

      awardBadge(score);

      if (passedPipes % 3 === 0) {
        updateFunnyComment();
      }
    }
  });

  if (score >= 10) pipeGap = 450;
  if (score >= 20) pipeGap = 400;
  if (score >= 30) pipeGap = 350;
  if (score >= 40) pipeGap = 300;
  if (score >= 50) pipeGap = 250;

  pipes.forEach(pipe => {
    if (birdX + birdWidth > pipe.x && birdX < pipe.x + 80 &&
      (birdY < pipe.y || birdY + birdHeight > pipe.y + pipeGap)) {
      gameOver = true;
      document.getElementById('restartBtn').style.display = 'block';
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
    }
  });

  if (birdY + birdHeight > canvas.height || birdY < 0) {
    gameOver = true;
    document.getElementById('restartBtn').style.display = 'block';
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
    }
  }

  // Coin collection
  if (birdX < coin.x + coin.width &&
    birdX + birdWidth > coin.x &&
    birdY < coin.y + coin.height &&
    birdY + birdHeight > coin.y) {
    score += 5;
    updateFunnyComment();
    coin.x = canvas.width + Math.random() * 500;
    coin.y = Math.random() * (canvas.height - 100) + 50;
  }
}

// Draw stars
function drawStars() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    ctx.beginPath();
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = 'white';
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Draw pipes
function drawPipes() {
  pipes.forEach(pipe => {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + 80, pipe.y + pipeGap);
    gradient.addColorStop(0, '#FF4E50');
    gradient.addColorStop(1, '#32CD32');

    ctx.fillStyle = gradient;

    ctx.fillRect(pipe.x, 0, 80, pipe.y);

    ctx.beginPath();
    ctx.arc(pipe.x + 40, pipe.y, 40, Math.PI, 0);
    ctx.fill();

    ctx.fillRect(pipe.x, pipe.y + pipeGap, 80, canvas.height - (pipe.y + pipeGap));

    ctx.beginPath();
    ctx.arc(pipe.x + 40, pipe.y + pipeGap, 40, 0, Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 5;
    ctx.strokeRect(pipe.x, 0, 80, pipe.y);
    ctx.strokeRect(pipe.x, pipe.y + pipeGap, 80, canvas.height - (pipe.y + pipeGap));
  });
}

// Draw all
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStars();

  // Moving background
  ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  drawPipes();
  ctx.drawImage(birdImage, birdX, birdY, birdWidth, birdHeight);
  ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);

  // Score Box
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(10, 10, 250, 100);
  ctx.fillStyle = 'black';
  ctx.font = '24px Times New Roman';
  ctx.fillText(`Score: ${score}`, 30, 50);
  ctx.fillText(`High Score: ${highScore}`, 30, 90);

  // Badge Box (smaller)
  ctx.fillStyle = 'rgba(135,206,250,0.8)';
  ctx.fillRect(10, 130, 250, 80);
  ctx.fillStyle = 'black';
  ctx.font = '20px Times New Roman';
  ctx.fillText('Badge:', 30, 160);
  ctx.font = '18px Times New Roman';
  ctx.fillText(latestBadge, 30, 190);

  // Funny comment box (right side)
  ctx.fillStyle = 'rgba(255,182,193,0.8)';
  ctx.fillRect(canvas.width - 410, 10, 400, 100);
  ctx.fillStyle = 'black';
  ctx.font = '20px Times New Roman';
  ctx.fillText('Funny Comment:', canvas.width - 390, 40);
  ctx.font = '18px Times New Roman';
  ctx.fillText(currentFunnyComment, canvas.width - 390, 80);

  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Times New Roman';
    ctx.fillText('Game Over!', canvas.width / 2 - 150, canvas.height / 2);
    ctx.font = '36px Times New Roman';
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2 - 140, canvas.height / 2 + 50);
  }
}

const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', startGame);
startBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  startGame();
});

function startGame() {
  // Hide the start button and reset game state, then enter the game loop
  resetGame();
  document.getElementById('startBtn').style.display = 'none';
  gameLoop();
}

// **Game loop and resize handler**
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Resize handler (keeps canvas full-screen)
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  birdX = canvas.width / 3;
});

function requestFullscreen() {
  if (canvas.requestFullscreen) canvas.requestFullscreen();
  else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
}
