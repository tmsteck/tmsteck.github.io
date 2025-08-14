const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const winMessageEl = document.getElementById('win-message');
const playAgainBtn = document.getElementById('play-again');

const gridSize = 20;
const canvasSize = canvas.width / gridSize;
const message = "You are invited to a game night this Saturday at 5pm. Hope to see you there!";

let snake, direction, lettersOnScreen, gameOver, gameLoop, nextLetterToSpawnIndex, eatenMessage;

function isPositionOccupied(pos) {
    const snakeCollision = snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    const letterCollision = lettersOnScreen.some(letter => letter.x === pos.x && letter.y === pos.y);
    return snakeCollision || letterCollision;
}

function getRandomSafePosition() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * canvasSize),
            y: Math.floor(Math.random() * canvasSize)
        };
    } while (isPositionOccupied(position));
    return position;
}

function spawnNextLetterInSequence() {
    if (nextLetterToSpawnIndex >= message.length) return;

    const char = message[nextLetterToSpawnIndex];
    const pos = getRandomSafePosition();
    lettersOnScreen.push({ char, x: pos.x, y: pos.y });
    
    nextLetterToSpawnIndex++;
}

function initializeGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    lettersOnScreen = [];
    nextLetterToSpawnIndex = 0;
    eatenMessage = "";
    gameOver = false;
    winMessageEl.classList.add('hidden');

    // Spawn the first two letters to start the game
    spawnNextLetterInSequence(); // Spawns 'Y'
    spawnNextLetterInSequence(); // Spawns 'o'
}

function draw() {
    if (gameOver) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Pac-Man Wall Collision
    if (head.x < 0) head.x = canvasSize - 1;
    if (head.x >= canvasSize) head.x = 0;
    if (head.y < 0) head.y = canvasSize - 1;
    if (head.y >= canvasSize) head.y = 0;
    
    // Self Collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        alert("Oops! You ran into yourself. Let's restart the message.");
        initializeGame();
        return;
    }

    snake.unshift(head);

    // Letter & Space Collision Logic
    const letterIndex = lettersOnScreen.findIndex(l => l.x === head.x && l.y === head.y);

    if (letterIndex > -1) {
        const eatenObject = lettersOnScreen[letterIndex];
        eatenMessage += eatenObject.char; // Add character to our internal message string

        lettersOnScreen.splice(letterIndex, 1);
        spawnNextLetterInSequence();

        if (eatenMessage.length >= message.length) {
            winGame();
            return;
        }
    } else {
        snake.pop(); // Only remove tail if no letter was eaten
    }

    // --- Drawing ---
    ctx.fillStyle = '#34495e'; // Background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake with the message inside it
    snake.forEach((segment, index) => {
        ctx.fillStyle = '#2ecc71'; // Snake color
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        const char = eatenMessage[index];
        if (char && char !== ' ') { // If a character exists for this segment, draw it
            ctx.fillStyle = '#ffffff'; // Letter color
            ctx.font = `bold ${gridSize * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char, segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);
        }
    });

    // Draw food letters and space boxes
    lettersOnScreen.forEach(letter => {
        const x = letter.x * gridSize;
        const y = letter.y * gridSize;

        if (letter.char === ' ') {
            ctx.strokeStyle = '#f1c40f'; // Box color for spaces
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        } else {
            ctx.fillStyle = '#f1c40f'; // Letter color
            ctx.font = `${gridSize * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter.char, x + gridSize / 2, y + gridSize / 2);
        }
    });
}

function winGame() {
    gameOver = true;
    clearInterval(gameLoop);
    // Display the correct, unscrambled message in the win screen
    document.querySelector('#win-message h2').textContent = message;
    winMessageEl.classList.remove('hidden');
}

document.addEventListener('keydown', e => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) direction = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y === 0) direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x === 0) direction = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x === 0) direction = { x: 1, y: 0 }; break;
    }
});

document.getElementById('up').addEventListener('click', () => { if (direction.y === 0) direction = { x: 0, y: -1 }; });
document.getElementById('down').addEventListener('click', () => { if (direction.y === 0) direction = { x: 0, y: 1 }; });
document.getElementById('left').addEventListener('click', () => { if (direction.x === 0) direction = { x: -1, y: 0 }; });
document.getElementById('right').addEventListener('click', () => { if (direction.x === 0) direction = { x: 1, y: 0 }; });

playAgainBtn.addEventListener('click', () => {
    initializeGame();
    gameLoop = setInterval(draw, 250);
});

// Initial Game Start
initializeGame();
gameLoop = setInterval(draw, 250);