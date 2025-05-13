const player = document.getElementById("player");

const score = document.getElementById("score");
const startButton = document.getElementById("startBtn");
const game = document.getElementById("game");


let isJumping = false;
let collisionCheckLoop;
let keyPressed = false;
let spawnTimeout;
let gameSpeedMultiplier = 1;
let difficultyInterval;
let lastSpawnWasBurst = false;
let currentScore = 0;
let scoreInterval;

function jump() {
  console.log("Jumping");
  if (isJumping) return;
  isJumping = true;
  player.classList.add("jump");
  setTimeout(() => {
    player.classList.remove("jump");
    isJumping = false;
  }, 500);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !keyPressed) {
    keyPressed = true;
    jump();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    keyPressed = false;
  }
});

function checkCollision() {
  const playerRect = player.getBoundingClientRect();
  const allObstacles = document.querySelectorAll(".obstacle");

  allObstacles.forEach((obstacle) => {
    const obstacleRect = obstacle.getBoundingClientRect();

    const isColliding = !(
      playerRect.right < obstacleRect.left ||
      playerRect.left > obstacleRect.right ||
      playerRect.bottom < obstacleRect.top ||
      playerRect.top > obstacleRect.bottom
    );

    if (isColliding) {
      gameOver();
    }
  });
}

function updateScore() {
  score.innerText = `Score: ${currentScore}`;
}

function startScoreCounter() {
  scoreInterval = setInterval(() => {
    currentScore += 1;
    updateScore();
  }, 100);
}

function gameOver() {
  alert(`Game Over!\nFinal Score: ${currentScore}`);
  clearInterval(collisionCheckLoop);
  clearInterval(difficultyInterval);
  clearTimeout(spawnTimeout);
  clearInterval(scoreInterval);
  game.style.animationPlayState = "paused";

  const allObstacles = document.querySelectorAll(".obstacle");
  allObstacles.forEach((obstacle) => {
    obstacle.classList.add("frozen"); 
  });
}

function randomObstacle() {
  const newObstacle = document.createElement("div");
  newObstacle.classList.add("obstacle");


  const baseDuration = 2;
  const adjustedDuration = baseDuration / gameSpeedMultiplier;

  newObstacle.style.animationDuration = `${adjustedDuration}s`;

  game.appendChild(newObstacle);


  const moveInterval = setInterval(() => {
    const obstacleRect = newObstacle.getBoundingClientRect();
    if (obstacleRect.right < 0) {
      clearInterval(moveInterval);
      newObstacle.remove();
    }
  }, 20);
}

function startObstacleSpawner() {
  function scheduleNextSpawn() {
    const minDelay = 550;
    const baseMaxDelay = 3000;
    const scalingFactor = 500; 
    const maxDelay = baseMaxDelay / (1 + gameSpeedMultiplier * 0.5); 

    const roll = Math.random();
    let r;

    if (roll < 0.6 && !lastSpawnWasBurst) {
      const burstMin = 0.3;
      const burstRange = 0.3 + 1 / (gameSpeedMultiplier + 1);
      r = Math.random() * burstRange + burstMin;
      lastSpawnWasBurst = true;
    } else if (roll < 0.9 || lastSpawnWasBurst) {
      r = Math.random();
      lastSpawnWasBurst = false;
    } else {
      r = Math.random() ** 2;
      lastSpawnWasBurst = false;
    }

    const delay = r * (maxDelay - minDelay) + minDelay;

    spawnTimeout = setTimeout(() => {
      randomObstacle();
      scheduleNextSpawn();
    }, delay);
  }

  scheduleNextSpawn();
}

function startDifficultyRamp() {
  difficultyInterval = setInterval(() => {
    gameSpeedMultiplier += 0.2;
    currentScore += 50;
    updateScore();
    console.log("Speed x", gameSpeedMultiplier.toFixed(1));
  }, 8000);
}

startButton.addEventListener("click", () => {
  document.getElementById("startBox").style.display = "none";
  game.style.animationPlayState = "running";
  collisionCheckLoop = setInterval(checkCollision, 50);
  startScoreCounter();
  startDifficultyRamp();
  startObstacleSpawner(); 
});
