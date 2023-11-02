const paddle = document.getElementById('paddle');
const ball = document.getElementById('ball');
const gameContainer = document.getElementById('game-container');
const velocitySlider = document.getElementById('velocitySlider');
const toggleGameOverBtn = document.getElementById('toggleGameOver');
let paddleVelocity = 0;
let paddleLeft = 320;

//const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

//const characters = loremIpsum.split('');

let ballX = 320; /* Centered starting position */
let ballY = 620; /* Starting position at the bottom of the screen */
let ballSpeedX = 2;
let ballSpeedY = -4;
let gameRunning = true;

// Create boxes for each character


characters.forEach((char, index) => {
  if (index < 200) { // Limiting the number of rows to 4 (40 characters)
    const box = document.createElement('div');
    box.className = 'box';
    //box.innerText = char;
    gameContainer.appendChild(box);

    // Set the position of each box with space around the edge
    const boxLeft = 20 + (index % 20) * 30;
    const boxTop = 20 + Math.floor(index / 20) * 30;
    box.style.left = `${boxLeft}px`;
    box.style.top = `${boxTop}px`;
  }
});

const boxes = document.querySelectorAll('.box');

function updateGame() {
  for (let step = 0; step < 5; step++) {
    ballX += ballSpeedX / 5;
    ballY += ballSpeedY / 5;

    // Ball collision with walls
    if (ballX < 20 || ballX > 620) { /* Adjusted to consider the added space */
      ballSpeedX = -ballSpeedX;
    }
    if (ballY > 640){
        ballSpeedY = -ballSpeedY;
    }

    if (ballY < 20) { /* Adjusted to consider the added space */
      ballSpeedY = -ballSpeedY;
    }

    // Ball collision with boxes
    // Ball collision with boxes
    for (const box of boxes) {
        const ball_rect = {
        x: ballX,
        y: ballY,
        width: 20,
        height: 20
        };
    
        const rect2 = {
        x: box.offsetLeft,
        y: box.offsetTop,
        width: box.offsetWidth,
        height: box.offsetHeight
        };
    
        // Check for overlaps on both axes (horizontal and vertical)
        // Check for overlaps on top/bottom
        if (
            ball_rect.x < rect2.x + rect2.width &&
            ball_rect.x + ball_rect.width > rect2.x &&
            ball_rect.y < rect2.y + rect2.height &&
            ball_rect.y + ball_rect.height > rect2.y
        ) {
            // Calculate the center of the ball
            const ballCenterX = ballX + 10; // Assuming the ball has a width of 20
            const ballCenterY = ballY + 10; // Assuming the ball has a height of 20

            // Calculate the center of the rectangle
            const rectCenterX = rect2.x + rect2.width / 2;
            const rectCenterY = rect2.y + rect2.height / 2;
            // Calculate the distances from the center of the ball to each edge of the rectangle
            const dx = Math.abs(ballCenterX - rectCenterX);
            const dy = Math.abs(ballCenterY - rectCenterY);

            if (Math.abs(dx - dy) < 1) {
                ballSpeedX = -ballSpeedX;
                ballSpeedY = -ballSpeedY;
                box.style.display = 'none';
            } else if (dx > dy) {
                // Collision detected on left/right, invert the ball's horizontal direction
                ballSpeedY = -ballSpeedY;
                box.style.display = 'none';
            } else {
                // Collision detected on top/bottom, invert the ball's vertical direction
                ballSpeedX = -ballSpeedX;
                box.style.display = 'none';
            }
        }

    // Ball collision with paddle
    if (
      ballY > 610 &&
      ballY < 620 &&
      ballX > paddle.offsetLeft &&
      ballX < paddle.offsetLeft + 80
    ) {
      ballSpeedY = -ballSpeedY;
      ballSpeedX = Math.max(Math.min(paddleVelocity,2),-2) + ballSpeedX;
      console.log('ballSpeedX:', ballSpeedX);
      console.log('paddleVelocity:', paddleVelocity);

    }
    

    // If the ball hits the floor and game over condition is enabled, end the game
    if (ballY > 640 && gameRunning) { /* Adjusted to consider the added space */
      gameRunning = false;
      alert('Game Over! Refresh the page to play again.');
    }
  }

  // Update ball and paddle positions
  ball.style.left = ballX + 'px';
  ball.style.top = ballY + 'px';
  }

  // Move the paddle to the center of the mouse
  document.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    //Mouse Velocity in the x direction:
    const mouseVelocity = event.movementX;
    //console.log(mouseVelocity)
    //console.log('mouseX:', mouseX)
    paddleVelocity = mouseVelocity/40//(-paddleLeft + (mouseX - paddle.offsetWidth / 2));
    //paddleLeft = mouseX - paddle.offsetWidth / 2;
    paddle.style.left = mouseX - paddle.offsetWidth / 2 + 'px';
    //console.log('paddleLeft:', paddleLeft);

  });

  requestAnimationFrame(updateGame);
}

velocitySlider.addEventListener('input', (event) => {
  ballSpeedY = -parseInt(event.target.value, 10);
});

toggleGameOverBtn.addEventListener('click', () => {
  gameRunning = !gameRunning;
});

updateGame();
