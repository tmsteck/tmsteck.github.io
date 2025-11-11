const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const winMessageEl = document.getElementById('win-message');
const playAgainBtn = document.getElementById('play-again');
const easyModeToggle = document.getElementById('easy-mode-toggle');
const hardModeToggle = document.getElementById('hard-mode-toggle');
const harderModeToggle = document.getElementById('harder-mode-toggle');
const skipMessageEl = document.getElementById('skip-message');
const skipButton = document.getElementById('skip-button');

// Set canvas size responsively
function setCanvasSize() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 500);
    canvas.width = size;
    canvas.height = size;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

const gridSize = 20;
let canvasSize = canvas.width / gridSize;

const message = "You are invited to a game night this Saturday at 5pm. Hope to see you there!";

let snake, direction, nextDirection, lettersOnScreen, gameOver, gameLoop, nextLetterToSpawnIndex, eatenMessage;
let easyMode = false;
let hardMode = false;
let harderMode = false;
let gameStartTime = 0;
let skipTimeoutId = null;

function getGameSpeed() {
    // Base speed is 250ms per move
    // Hard and harder mode are 3x faster
    const baseSpeed = 250;
    if (hardMode || harderMode) {
        return baseSpeed / 3; // ~83ms per move
    }
    return baseSpeed;
}

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

function getOutwardSpiralPosition(index) {
    // Generate zig-zag pattern from top to bottom, skipping every other row
    const cols = Math.floor(canvasSize);
    const rows = Math.floor(canvasSize);
    
    // Which zig-zag row are we on (skipping every other row)
    const zigzagRow = Math.floor(index / cols);
    const posInRow = index % cols;
    
    // Alternate between left-to-right and right-to-left
    let x, y;
    
    if (zigzagRow % 2 === 0) {
        // Even rows: left to right
        x = posInRow;
    } else {
        // Odd rows: right to left
        x = cols - 1 - posInRow;
    }
    
    // Skip every other row (use row * 2 to skip)
    y = zigzagRow * 2;
    
    // Clamp to canvas bounds
    x = Math.max(0, Math.min(cols - 1, Math.floor(x)));
    y = Math.max(0, Math.min(rows - 1, Math.floor(y)));
    
    return { x, y };
}

function spawnNextLetterInSequence() {
    if (nextLetterToSpawnIndex >= message.length) return;

    const char = message[nextLetterToSpawnIndex];
    let pos;
    
    if (easyMode) {
        // In easy mode, spawn in a pre-defined zig-zag pattern
        pos = getOutwardSpiralPosition(nextLetterToSpawnIndex);
    } else {
        // Normal mode: random safe position
        pos = getRandomSafePosition();
    }
    
    lettersOnScreen.push({ char, x: pos.x, y: pos.y });
    nextLetterToSpawnIndex++;
}

function spawnMultipleLetters(count) {
    for (let i = 0; i < count && nextLetterToSpawnIndex < message.length; i++) {
        spawnNextLetterInSequence();
    }
}

function initializeGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 }; // Start moving right instead of stationary
    nextDirection = { x: 1, y: 0 }; // Queue for next direction
    lettersOnScreen = [];
    nextLetterToSpawnIndex = 0;
    eatenMessage = "";
    gameOver = false;
    winMessageEl.classList.add('hidden');
    skipMessageEl.classList.add('hidden');

    // Start the timer for skip button
    gameStartTime = Date.now();
    if (skipTimeoutId) clearTimeout(skipTimeoutId);
    skipTimeoutId = setTimeout(() => {
        if (!gameOver) {
            skipMessageEl.classList.remove('hidden');
        }
    }, 15000); // 15 seconds

    // Spawn initial letters based on mode
    if (harderMode) {
        spawnMultipleLetters(2); // Spawn 2 letters at a time in harder mode
    } else if (hardMode) {
        spawnMultipleLetters(2); // Spawn 2 letters at a time in hard mode
    } else {
        spawnNextLetterInSequence(); // Spawns 'Y'
        spawnNextLetterInSequence(); // Spawns 'o'
    }
}

function draw() {
    if (gameOver) return;

    // Update canvasSize in case window was resized
    canvasSize = canvas.width / gridSize;
    
    // Apply buffered direction change
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall Collision handling
    if (hardMode || harderMode) {
        // Hard mode: walls are collidable (game over)
        if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
            gameOver = true;
            clearInterval(gameLoop);
            alert("You hit the wall! Game Over. Let's restart.");
            initializeGame();
            gameLoop = setInterval(draw, getGameSpeed());
            return;
        }
    } else {
        // Normal mode: Pac-Man style wrapping
        if (head.x < 0) head.x = canvasSize - 1;
        if (head.x >= canvasSize) head.x = 0;
        if (head.y < 0) head.y = canvasSize - 1;
        if (head.y >= canvasSize) head.y = 0;
    }
    
    // Self Collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;
        clearInterval(gameLoop);
        alert("Oops! You ran into yourself. Let's restart the message.");
        initializeGame();
        gameLoop = setInterval(draw, getGameSpeed());
        return;
    }

    snake.unshift(head);

    // Letter & Space Collision Logic
    const letterIndex = lettersOnScreen.findIndex(l => l.x === head.x && l.y === head.y);

    if (letterIndex > -1) {
        const eatenObject = lettersOnScreen[letterIndex];
        eatenMessage += eatenObject.char; // Add character to our internal message string

        lettersOnScreen.splice(letterIndex, 1);
        
        // Spawn more letters based on mode
        if (harderMode) {
            spawnMultipleLetters(1); // Spawn 1 letter at a time in harder mode
        } else if (hardMode) {
            spawnMultipleLetters(2); // Spawn 2 letters at a time in hard mode
        } else {
            spawnNextLetterInSequence();
        }

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
        if (char) { // Draw any character, including spaces
            ctx.fillStyle = char === ' ' ? '#34495e' : '#ffffff'; // White text, or dark for spaces
            ctx.font = `bold ${gridSize * 0.7}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (char !== ' ') {
                ctx.fillText(char, segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);
            }
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
            ctx.font = `bold ${gridSize * 0.7}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter.char, x + gridSize / 2, y + gridSize / 2);
        }
    });

    // Harder mode: Draw darkness with flashlight effect
    if (harderMode) {
        const head = snake[0];
        // Flashlight radius = 4 + 1/2 of letters eaten
        const baseRadius = 4 + eatenMessage.length / 2;
        const flashlightRadius = gridSize * baseRadius;
        
        // Create radial gradient for flashlight effect
        const gradient = ctx.createRadialGradient(
            head.x * gridSize + gridSize / 2, head.y * gridSize + gridSize / 2, 0,
            head.x * gridSize + gridSize / 2, head.y * gridSize + gridSize / 2, flashlightRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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
        case 'ArrowUp': if (direction.y === 0) nextDirection = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y === 0) nextDirection = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x === 0) nextDirection = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x === 0) nextDirection = { x: 1, y: 0 }; break;
    }
});

document.getElementById('up').addEventListener('click', () => { if (direction.y === 0) nextDirection = { x: 0, y: -1 }; });
document.getElementById('down').addEventListener('click', () => { if (direction.y === 0) nextDirection = { x: 0, y: 1 }; });
document.getElementById('left').addEventListener('click', () => { if (direction.x === 0) nextDirection = { x: -1, y: 0 }; });
document.getElementById('right').addEventListener('click', () => { if (direction.x === 0) nextDirection = { x: 1, y: 0 }; });

playAgainBtn.addEventListener('click', () => {
    initializeGame();
    gameLoop = setInterval(draw, getGameSpeed());
});

easyModeToggle.addEventListener('change', (e) => {
    easyMode = e.target.checked;
});

hardModeToggle.addEventListener('change', (e) => {
    hardMode = e.target.checked;
    if (hardMode) {
        easyMode = false;
        harderMode = false;
        easyModeToggle.checked = false;
        harderModeToggle.checked = false;
    }
});

harderModeToggle.addEventListener('change', (e) => {
    harderMode = e.target.checked;
    if (harderMode) {
        easyMode = false;
        hardMode = false;
        easyModeToggle.checked = false;
        hardModeToggle.checked = false;
    }
});

skipButton.addEventListener('click', () => {
    gameOver = true;
    clearInterval(gameLoop);
    if (skipTimeoutId) clearTimeout(skipTimeoutId);
    document.querySelector('#win-message h2').textContent = message;
    skipMessageEl.classList.add('hidden');
    winMessageEl.classList.remove('hidden');
});

// Initial Game Start
initializeGame();
gameLoop = setInterval(draw, getGameSpeed());
