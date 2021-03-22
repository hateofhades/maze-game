var canvas = document.getElementById("canvas");
var cellSize = 50;
var cellsX;
var cellsY;

var player;

Math.seedrandom("maze");

var board = [];

var topStart;
var leftStart;

resizeCanvas();

document.addEventListener('keydown', logKey);

function logKey(e) {
    switch(e.code) {
        case "Space":
            Math.seedrandom(Date.now());
            resizeCanvas();
            break;
        case "KeyA":
            movePlayer(-1, 0);
            break;
        case "KeyW":
            movePlayer(0, -1);
            break;
        case "KeyS":
            movePlayer(0, 1);
            break;
        case "KeyD":
            movePlayer(1, 0);
            break;
    }
}

function drawPlayer() {
    let ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(leftStart + cellSize / 2 + cellSize * player[0], topStart + cellSize / 2 + cellSize * player[1], cellSize / 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = "pink";
    ctx.fill();
}

function clearPlayer() {
    let ctx = canvas.getContext("2d");

    ctx.clearRect(leftStart + 1 + cellSize * player[0], topStart + 1 + cellSize * player[1], cellSize - 2, cellSize - 2);
}

//Move player in the direction xy
function movePlayer(x, y) {
    clearPlayer();

    //Check if next cell is not out of bounds
    if(x + player[0] < 0 || y + player[1] < 0 || x + player[0] >= cellsX || y + player[1] >= cellsY) {
        drawPlayer();
        return;
    }

    //Check if there is a wall in the direction xy
    if(isWall(player[0], player[1], x + "" + y)) {
        drawPlayer();
        return;
    }

    player[0] += x;
    player[1] += y;
    drawPlayer();

    //Check if player is in the (cellsX - 1, cellsY - 1) cell, this means he wins.
    if(player[0] == cellsX - 1 && player[1] == cellsY - 1)
        resizeCanvas();
}

//Checks if there is a wall in the (x, y) cell. For directions check generateMaze function
function isWall(x, y, direction) {
    switch(direction) {
        case "01":
            if(board[y][x][1][2]) return true;
            break;
        case "0-1":
            if(board[y][x][1][0]) return true;
            break;
        case "10":
            if(board[y][x][1][1]) return true;
            break;
        case "-10":
            if(board[y][x][1][3]) return true;
            break;
    }

    return false;
}

//Draws the red exit which is always at (cellsX - 1, cellsY - 1)
function drawExits() {
    let ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(canvas.width - leftStart - cellSize / 2, canvas.height - topStart - cellSize / 2, cellSize / 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill();
}

function generateMazeRecursive(x, y, direction) {
    let newArr = [1, [1, 1, 1, 1], 0];

    //Directions = {01 - up, 0-1 - down, 10 - left, -10 - right}
    //The walls between current cell and previous cell are destroyed
    switch(direction) {
        case "01":
            newArr[1][0] = 0;
            board[y - 1][x][1][2] = 0;
            break;
        case "0-1":
            newArr[1][2] = 0;
            board[y + 1][x][1][0] = 0;
            break;
        case "10":
            newArr[1][3] = 0;
            board[y][x - 1][1][1] = 0;
            break;
        case "-10":
            newArr[1][1] = 0;
            board[y][x + 1][1][3] = 0;
            break;
    }
    board[y][x] = newArr;

    let triedCells = [];
    //For each cell neighbouring the current cell pick one at random, check if it's valid and unvisited
    //Run the maze generation function with the new cell
    while(triedCells.length != 4) {
        let nextGo = Math.floor(Math.random() * 4);
        let nextCellX, nextCellY;

        switch(nextGo) {
            case 0:
                nextCellX = 0;
                nextCellY = 1;
                break;
            case 1:
                nextCellX = 0;
                nextCellY = -1;
                break;
            case 2:
                nextCellX = 1;
                nextCellY = 0;
                break;
            case 3:
                nextCellX = -1;
                nextCellY = 0;
                break;
        }

        if(!triedCells.includes(nextCellX + "" + nextCellY)) {
            triedCells.push(nextCellX + "" + nextCellY);

            if(x + nextCellX >= 0 && x + nextCellX < cellsX && y + nextCellY >= 0 && y + nextCellY < cellsY)
                if(board[y + nextCellY][x + nextCellX][0] == 0)
                    generateMazeRecursive(x + nextCellX, y + nextCellY, nextCellX + "" + nextCellY);
        }
    }
}

//Clears canvas and board array
function restartDrawing() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    let row = [];
    board = [];
    for(let i = 0; i < cellsX; i++)
        row.push([0, Array(4).fill(1, 0, 4), 0]);
    for(let i = 0; i < cellsY; i++) 
        board.push(row.map((x) => x));
}


//Draws the cell if it was generated (board[i][j][0] == 1).
function drawEntireBoard() {
    for(let i = 0; i < cellsY; i++) {
        for(let j = 0; j < cellsX; j++) {
            if(board[i][j][0])
              drawWalls(cellSize, leftStart + (j * cellSize), topStart + (i * cellSize), board[i][j][1]);
        }
    }

    drawWalls(cellSize, leftStart + ((cellsX - 1) * cellSize), topStart + ((cellsY - 1) * cellSize), board[cellsY - 1][cellsX - 1][1]);
}

//Get the amount of cells on each axis that should be set if the size is cellSize
//and get the place from which should we start drawing
function setupBoard() {
    cellsX = Math.floor(canvas.width / cellSize);
    cellsY = Math.floor(canvas.height / cellSize);
    
    let widthLeft = canvas.width - cellSize * cellsX;
    let heightLeft = canvas.height - cellSize * cellsY;

    topStart = Math.floor(heightLeft/2);
    leftStart = Math.floor(widthLeft/2);
}

/*
drawWalls(20, 100, 100, [1, 0, 0, 0]); Wall up
drawWalls(20, 130, 100, [0, 1, 0, 0]); Wall right
drawWalls(20, 160, 100, [0, 0, 1, 0]); Wall down
drawWalls(20, 190, 100, [0, 0, 0, 1]); Wall left
*/

function resizeCanvas() {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    player = [0, 0];

    setupBoard();
    restartDrawing();
    generateMazeRecursive(0, 0, "00");
    drawEntireBoard();
	drawExits();
    drawPlayer();
}

function drawWalls(boxSize, startingPointX, startingPointY, walls) {
    let ctx = canvas.getContext("2d");
    if(walls[0]) {
        ctx.moveTo(startingPointX, startingPointY);
        ctx.lineTo(startingPointX + boxSize, startingPointY);
    }
    if(walls[1]) {
        ctx.moveTo(startingPointX + boxSize, startingPointY);
        ctx.lineTo(startingPointX + boxSize, startingPointY + boxSize);
    }
    if(walls[2]) { 
        ctx.moveTo(startingPointX + boxSize, startingPointY + boxSize);
        ctx.lineTo(startingPointX, startingPointY + boxSize);
    }
    if(walls[3]) {
        ctx.moveTo(startingPointX, startingPointY + boxSize);
        ctx.lineTo(startingPointX, startingPointY);
    }
    ctx.stroke();
}

window.addEventListener('resize', () => {
    resizeCanvas();
});