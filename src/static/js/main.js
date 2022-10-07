const directionSequence = ['S', 'E', 'N', 'W'];
const squareRenderMapping = {
    '.': '⚪',
    'N': '🤖',
    'W': '🤖',
    'S': '🤖',
    'E': '🤖',
    'X': '💥'
};
const directionForwardMapping = {
    'S' : [1, 0],
    'E' : [0, -1],
    'N' : [-1, 0],
    'W' : [0, 1]
};

let board = [];

function main() {
    setUpCreateBoardListener();
    setUpStartListener();
    createBoard(10, 10);
}

function setUpCreateBoardListener() {
    document.getElementById('createBoard').addEventListener('click', () => {
        const sizeX = document.getElementById('sizeX').value;
        const sizeY = document.getElementById('sizeY').value;

        createBoard(sizeX, sizeY);
    });
}

function setUpStartListener() {
    document.getElementById('start').addEventListener('click', () => {
        startAlgorithm();
    });
}

function createBoard(sizeX, sizeY) {
    board = [];

    for (let i = 0; i < sizeY; i++) {
        const row = [];

        for (let j = 0; j < sizeX; j++) {
            row.push('.');
        }

        board.push(row);
    }
    
    const roversElement = document.getElementById('rovers');
    roversElement.innerHTML = '';

    renderBoard();
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    let newBoard = '';

    for (const row in board) {
        let newRow = '';

        for (const column in board[row]) {
            const square = board[row][column];

            newRow += `<div class="square ${square === '.' || square === 'X' ? 'empty' : `rover rotate-${square}`}empty cursor-pointer" id="${row}-${column}">${squareRenderMapping[square]}</div>`;
        }

        newBoard += `<div class="row" id="${row}">${newRow}</div>`;
    }

    boardElement.innerHTML = newBoard;
    document.getElementById('rovers').style.height = `${boardElement.clientHeight}px`;

    addSquareClickListeners();
}

function renderSquare(x, y) {
    const square = board[x][y];
    const position = `${x}-${y}`;

    const squareElement = document.getElementById(position);

    squareElement.innerHTML = squareRenderMapping[square];
    squareElement.className = `square cursor-pointer ${square === '.' || square === 'X' ? 'empty' : `rover rotate-${square}`}`;
}

function createRover(x, y, direction) {
    board[x][y] = direction;

    renderSquare(x, y);
    addRoverToInterface(x, y);
}

function deleteRover(x, y, value) {
    board[x][y] = value;

    renderSquare(x, y);
    removeRoverFromInterface(x, y);
}

function rotateRoverClockwise(x, y) {
    board[x][y] = directionSequence[(directionSequence.indexOf(board[x][y]) + 1) % directionSequence.length];

    renderSquare(x, y);
    renderRoverInterface(x, y);
}

function rotateRoverAnticlockwise(x, y) {
    board[x][y] = directionSequence.at((directionSequence.indexOf(board[x][y]) - 1));

    renderSquare(x, y);
    renderRoverInterface(x, y);
}

function moveRoverForward(x, y) {
    const boardWidth = board.length;
    const boardHeight = board[0].length;

    const directionToMove = directionForwardMapping[board[x][y]];

    const newX = x + directionToMove[0];
    const newY = y + directionToMove[1];

    let destroyed = true;

    if (newX < 0 || newX >= boardHeight || newY < 0 || newY >= boardWidth) {
        deleteRover(x, y, 'X');
    } else if (board[newX][newY] === 'X') {
        deleteRover(x, y, '.');
    } else if (board[newX][newY] !== '.') {
        deleteRover(x, y, '.');
        deleteRover(newX, newY, 'X');
    } else {
        destroyed = false;

        moveRoverPosition(x, y, newX, newY);
    }

    return { destroyed, newX, newY };
}

function addRoverToInterface(x, y) {
    const roversElement = document.getElementById('rovers');

    const newRoverElement = document.createElement('div');
    newRoverElement.classList.add('rover-item');
    newRoverElement.id = `rover${x}-${y}`;
    newRoverElement.innerHTML += `
        <div class="rover-icon">
            🤖
        </div>
        <div class="rover-data">
            <div class="rover-top-row">
                <div class="rover-location">
                    <span class="rover-position">Position: ${x + 1} - ${y + 1}</span>
                    <span class="rover-direction">Direction: ${board[x][y]}</span>
                </div>
                
                <div class="delete-rover-button">❌</div>
            </div>
            <div class="rover-instructions">
                <span>Type here the hover instructions (L, R, M): </span>
                <input type="text" class="rover-instructions-input" />
            </div>
        </div>
    `;
    newRoverElement.querySelector('.delete-rover-button').addEventListener('click', () => {
        const roverCoordinates = newRoverElement.id.split('rover')[1].split('-');
        const roverX = parseInt(roverCoordinates[0]);
        const roverY = parseInt(roverCoordinates[1]);

        deleteRover(roverX, roverY, '.');
    });
    newRoverElement.querySelector('.rover-instructions-input').addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/[^lrmLRM]/, '');
    });

    roversElement.appendChild(newRoverElement);
}

function removeRoverFromInterface(x, y) {
    const roverInterface = document.getElementById(`rover${x}-${y}`);
    roverInterface.parentElement.removeChild(roverInterface);
}

function renderRoverInterface(x, y) {
    const position = `${x}-${y}`;

    document.querySelector(`#rover${position} .rover-position`).innerHTML = `
        Position: ${x + 1} - ${y + 1}
    `;

    document.querySelector(`#rover${position} .rover-direction`).innerHTML = `
        Direction: ${board[x][y]} 
    `;
}

function moveRoverPosition(x, y, newX, newY) {
    const square = board[x][y];
    board[newX][newY] = square;
    board[x][y] = '.';

    renderSquare(newX, newY);
    renderSquare(x, y);

    document.querySelector(`#rover${x}-${y}`).id = `rover${newX}-${newY}`;
    renderRoverInterface(newX, newY);
}

function addSquareClickListeners() {
    const squareElements = document.getElementsByClassName('square');

    for (const squareElement of squareElements) {
        squareElement.addEventListener('click', () => {
            const position = squareElement.id;
            const squareCoordinates = position.split('-');
            const squareX = parseInt(squareCoordinates[0]);
            const squareY = parseInt(squareCoordinates[1]);
            const square = board[squareX][squareY];

            if (square === '.') {
                createRover(squareX, squareY, 'S');
            } else {
                rotateRoverClockwise(squareX, squareY);
            }
        });
    }
}

function toggleFields(shouldDisable) {
    const createBoardButton = document.getElementById('createBoard');
    const startButton = document.getElementById('start');

    createBoardButton.disabled = shouldDisable;
    startButton.disabled = shouldDisable;
}

async function startAlgorithm() {
    toggleFields(true);

    const roverElements = document.getElementsByClassName('rover-item');

    const instructionsToRun = [];

    for (const roverElement of roverElements) {
        const roverInstructions = roverElement.querySelector('.rover-instructions-input').value.toUpperCase();
        
        const position = roverElement.id;
        const roverCoordinates = position.split('rover')[1].split('-');
        const roverX = parseInt(roverCoordinates[0]);
        const roverY = parseInt(roverCoordinates[1]);

        instructionsToRun.push({
            roverX,
            roverY,
            roverInstructions,
        })
    }

    for (const { roverX, roverY, roverInstructions } of instructionsToRun) {
        if (['.', 'X'].includes(board[roverX][roverY])) {
            continue;
        }

        for (const instruction of roverInstructions.split('')) {
            if (instruction === 'L') {
                rotateRoverAnticlockwise(roverX, roverY);
            } else if (instruction === 'R') {
                rotateRoverClockwise(roverX, roverY);
            } else if (instruction === 'M') {
                const { destroyed, newX, newY } = moveRoverForward(roverX, roverY);

                if (destroyed) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    break;
                }

                roverX = newX;
                roverY = newY;
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    toggleFields(false);
}

main();