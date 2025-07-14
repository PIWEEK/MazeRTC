const WIDTH = 1280
const HEIGHT = 1024
const TILE_SIZE = 128
const TILE_OFFSET_X = 256
const TILE_OFFSET_Y = 128
const MAX_FRAMES = 30

const TILE_OFFSET_EDITOR = 4

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const buttonsContainer = document.getElementById('buttons')
const startButton = document.getElementById('startButton')
const editorButton = document.getElementById('editorButton')
const tiles = []

let animTime = 0
let lastTime = 0
let currentFrame = 0
let editorSelected = 0
let editing = false
let buttons = []
let characters = []
let selectedButton = null
let lastId = -1


const warrior = {
    name: "warrior",
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    currentAnim: "idle",
    anims: {
        "idle": []
    }
}


var board = [
    [7, 1, 1, 1, 1, 5],
    [4, 0, 0, 0, 0, 2],
    [4, 0, 0, 0, 0, 2],
    [4, 0, 0, 0, 0, 2],
    [4, 0, 0, 0, 0, 2],
    [10, 3, 3, 3, 3, 8]
]


async function preloadTiles() {
    for (var i = 0; i < 15; i++) {
        const img = new Image();
        img.src = "img/tiles/" + String(i).padStart(3, '0') + ".png"
        tiles.push(img);
    }
}

async function preloadCharacter(character) {
    for (var i = 0; i < MAX_FRAMES; i++) {
        const img = new Image();
        img.src = "img/characters/" + character.name + "/idle/" + String(i).padStart(3, '0') + ".png"
        character.anims.idle.push(img);
    }
}

function generateId() {
    //return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    lastId++
    return lastId
}

function addButton(img, x, y, width, height, value, onClick) {
    buttons.push(
        { id: generateId(), img: img, x: x, y: y, width: width, height: height, value: value, onClick: onClick }
    )
}

function drawButton(button) {
    if (button.img) {
        ctx.drawImage(button.img, button.x, button.y, button.width, button.height)
    }

    if (button == selectedButton) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = "4";
        ctx.beginPath();
        ctx.rect(button.x - 2, button.y - 2, button.width + 4, button.height + 4);
        ctx.stroke();
    }
}

function drawButtons() {
    buttons.forEach(button => {
        drawButton(button);
    })
}

function resizeCanvas() {
    const scaleX = window.innerWidth / WIDTH
    const scaleY = window.innerHeight / HEIGHT
    const scale = Math.min(scaleX, scaleY)

    canvas.style.transform = `scale(${scale})`
    canvas.style.marginLeft = `${-(WIDTH / 2) * scale}px`
    canvas.style.marginTop = `${-(HEIGHT / 2) * scale}px`
}

function enterFullscreenAndLockOrientation() {
    const elem = document.documentElement
    if (elem.requestFullscreen) elem.requestFullscreen()
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen()
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen()

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => { })
    }
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh
}


function drawTile(x, y, tileNum, border) {
    x = TILE_OFFSET_X + (x * TILE_SIZE)
    y = TILE_OFFSET_Y + (y * TILE_SIZE)

    ctx.drawImage(tiles[tileNum], x, y);
}

function drawBoard(delta) {
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            drawTile(x, y, board[y][x]);
        }
    }
}


function drawCharacter(character, delta) {

    ctx.drawImage(character.anims[character.currentAnim][currentFrame], character.x, character.y);
}

function drawCharacters(delta) {
    characters.forEach(character => {
        drawCharacter(character, delta)
    });
}


function gameLoop(timestamp) {
    if (lastTime == 0) {
        lastTime = timestamp;
        requestAnimationFrame(gameLoop)
    } else {
        const delta = (timestamp - lastTime) / 1000

        lastTime = timestamp

        animTime += delta * 10
        if (animTime > MAX_FRAMES) {
            animTime = 0
        }

        currentFrame = Math.floor(animTime);
        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        drawBoard(delta)
        drawCharacters()
        drawButtons()

        requestAnimationFrame(gameLoop)
    }
}


function setCharacterPos(character, x, y) {
    character.x = TILE_OFFSET_X + x * TILE_SIZE;
    character.y = TILE_OFFSET_Y + y * TILE_SIZE;
}


function coordsToTile(x, y) {
    return [Math.floor((x - TILE_OFFSET_X) / TILE_SIZE), Math.floor((y - TILE_OFFSET_Y) / TILE_SIZE)]
}

function onCanvasClick(e) {
    console.log(e.offsetX, e.offsetY)
    console.log(coordsToTile(e.offsetX, e.offsetY))

    for (var i = 0; i < buttons.length; i++) {
        if (pointInRect(e.offsetX, e.offsetY, buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height)) {
            buttons[i].onClick(buttons[i])
            break
        }
    }
}

function displayGameArea() {
    //enterFullscreenAndLockOrientation()
    buttonsContainer.style.display = 'none'
    lastTime = 0
    requestAnimationFrame(gameLoop)
}


function initializeBoard(onClick) {
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            addButton(null, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, null, onClick)
        }
    }
}


function startGame() {
    characters = []
    buttons = []
    loadMap(0)

    displayGameArea()
}



function editMode() {
    characters = []
    buttons = []

    let onClick = (button) => {
        selectedButton = button;
    }


    let x = -10
    let y = 350
    for (i = 0; i < 15; i++) {
        x += 60
        if (x > 180) {
            x = 50
            y += 60
        }

        addButton(tiles[i], x, y, 50, 50, i, onClick)
    }


    let onBoardClick = (button) => {
        var [bx, by] = coordsToTile(button.x + 1, button.y + 1)
        console.log("bxby", bx, by)
        board[by][bx] = selectedButton.value
    }


    initializeBoard(onBoardClick)


    displayGameArea()
}

function loadMap(mapNum) {
    characters = [warrior]
    setCharacterPos(warrior, 0, 0);
}

function initialize() {
    preloadTiles();
    preloadCharacter(warrior);

    resizeCanvas();

    startButton.addEventListener('click', startGame);
    editorButton.addEventListener('click', editMode);
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', onCanvasClick);
}



window.addEventListener('load', initialize)