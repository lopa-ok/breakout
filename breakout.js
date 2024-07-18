const canvas = document.getElementById('breakoutCanvas');
const ctx = canvas.getContext('2d');

const ballRadius = 10;
const originalPaddleWidth = 100; // Store the original paddle width
let paddleWidth = originalPaddleWidth;
const paddleHeight = 10;
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 4; // Initial speed of the ball in x direction
let dy = -4; // Initial speed of the ball in y direction

let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let score = 0;
let lives = 3;
let level = 1; // Starting level

let powerupActive = false; // Track if power-up is active
let powerupDuration = 5000; // 5 seconds in milliseconds
let powerupEndTime = 0; // Timestamp when power-up will end

const bricks = [];
generateBricks();

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; // White color
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#DD0095';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (x > brick.x && x < brick.x + brickWidth && y > brick.y && y < brick.y + brickHeight) {
                    dy = -dy;
                    brick.status = 0;
                    if (brick.type === 'powerup') {
                        activatePowerup();
                    }
                    score++;
                    document.querySelector('.score').textContent = 'Score: ' + score;

                    if (score === brickRowCount * brickColumnCount * level) {
                        level++;
                        generateBricks();
                        resetBallAndPaddle();
                    }
                }
            }
        }
    }
}

function activatePowerup() {
    paddleWidth = originalPaddleWidth * 2; // Double the paddle width
    powerupActive = true;
    powerupEndTime = Date.now() + powerupDuration; // Set the end time of the power-up
}

function checkPowerupDuration() {
    if (powerupActive && Date.now() > powerupEndTime) {
        paddleWidth = originalPaddleWidth; // Reset paddle width to original
        powerupActive = false;
    }
}

function generateBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // Determine if it's a regular brick or a power-up brick
            let brickType = 'regular';
            let brickColor = '#0095DD'; // Regular brick color

            if (Math.random() < 0.1) { // 10% chance for a power-up brick
                brickType = 'powerup';
                brickColor = '#ff0000'; // Power-up brick color
            }

            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                type: brickType,
                color: brickColor
            };
        }
    }
}

function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 4; // Reset speed
    dy = -4; // Reset speed
    paddleWidth = originalPaddleWidth; // Reset paddle width to original
    paddleX = (canvas.width - paddleWidth) / 2;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    checkPowerupDuration(); // Check and manage power-up duration

    // Ball movement logic
    x += dx;
    y += dy;

    // Collision detection for walls
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            document.querySelector('.lives').textContent = 'Lives: ' + lives;
            if (!lives) {
                alert('GAME OVER');
                document.location.reload();
            } else {
                resetBallAndPaddle();
            }
        }
    }

    // Paddle movement logic
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
}

draw();
