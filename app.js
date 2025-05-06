const player = document.getElementById("player");
/* const obstacle = document.getElementById("obstacle"); */
const score = document.getElementById("score");
const startButton = document.getElementById("startBtn");
const game = document.getElementById("game");
/* const obstacleAnimation = document.getElementById("obstacle-animation"); */

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
  alert(`Game Over!\ Final Score: ${currentScore}`);
  clearInterval(collisionCheckLoop);
  clearInterval(difficultyInterval);
  clearTimeout(spawnTimeout);
  clearInterval(scoreInterval);

  const allObstacles = document.querySelectorAll(".obstacle");
  allObstacles.forEach((obstacle) => obstacle.remove());
}

function randomObstacle() {
  const newObstacle = document.createElement("div");
  newObstacle.classList.add("obstacle");

  // Animation speed scales with difficulty
  const baseDuration = 2;
  const adjustedDuration = baseDuration / gameSpeedMultiplier;
  newObstacle.style.animation = `moveObstacle ${adjustedDuration}s linear forwards`;

  newObstacle.classList.add("obstacle-animation");
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
    const scalingFactor = 500; // adjust this for stronger scaling
    const maxDelay = baseMaxDelay / (1 + gameSpeedMultiplier * 0.5); // drops over time

    const roll = Math.random();
    let r;

    if (roll < 0.6 && !lastSpawnWasBurst) {
      // This spawn is a burst
      const burstMin = 0.3;
      const burstRange = 0.3 + 1 / (gameSpeedMultiplier + 1);
      r = Math.random() * burstRange + burstMin;
      lastSpawnWasBurst = true;
    } else if (roll < 0.9 || lastSpawnWasBurst) {
      // Normal spacing
      r = Math.random();
      lastSpawnWasBurst = false;
    } else {
      // Occasionally a big gap
      r = Math.random() ** 2;
      lastSpawnWasBurst = false;
    }

    const delay = r * (maxDelay - minDelay) + minDelay;

    spawnTimeout = setTimeout(() => {
      randomObstacle();
      scheduleNextSpawn();
    }, delay);
  }

  scheduleNextSpawn(); // initial call
}

function startDifficultyRamp() {
  difficultyInterval = setInterval(() => {
    gameSpeedMultiplier += 0.2;
    currentScore += 50;
    updateScore();
    console.log("Speed x", gameSpeedMultiplier.toFixed(2));
  }, 8000);
}

startButton.addEventListener("click", () => {
  document.getElementById("startBox").style.display = "none";
  collisionCheckLoop = setInterval(checkCollision, 50);
  startScoreCounter();
  startDifficultyRamp();
  startObstacleSpawner(); // no spawn until delay completes
});
