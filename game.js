const WIDTH = 1280
const HEIGHT = 1024
const TILE_SIZE = 128
const TILE_OFFSET_X = 256
const TILE_OFFSET_Y = 128
const MAX_FRAMES = 30
const MAX_CHARACTERS = 2

const TILE_OFFSET_EDITOR = 4

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const buttonsContainer = document.getElementById('buttons')
const startButton = document.getElementById('startButton')
const continueButton = document.getElementById('continueButton')
const editorButton = document.getElementById('editorButton')
const endGameButton = document.getElementById('endGame')
const gameInfo = document.getElementById('info')
const hostButton = document.getElementById('hostButton')
const joinButton = document.getElementById('joinButton')
const connectionPanel = document.getElementById('connectionPanel')
const statusText = document.getElementById('statusText')
const joinRoomButton = document.getElementById('joinRoomButton')
const webrtcClient = new WebRTCClient(window)
const tiles = []
var controls = []

let animTime = 0
let lastTime = 0
let currentFrame = 0
let editing = false
let gameEnded = false
let buttons = []
let characters = []
let selectedButton = null
let lastId = -1
let currentLevel = 0
let commands = []
let selectedCharacter = 0
let moving = false



var board = [
    [7, 1, 1, 1, 1, 5],
    [4, 0, 0, 0, 0, 2],
    [4, 0, 0, 0, 0, 2],
    [4, 0, 0, 0, 0, 2],
    [4, 0, 0, 0, 0, 2],
    [10, 3, 3, 3, 3, 8]
]


async function preloadTiles() {
    for (var i = 0; i < 17; i++) {
        const img = new Image()
        img.src = "img/tiles/" + String(i).padStart(3, '0') + ".png"
        tiles.push(img)
    }
}

async function preloadCharacter(num) {
    var character = {
        num: num,
        enabled: false,
        x: 0,
        y: 0,
        exitX: 0,
        exitY: 0,
        currentAnim: "idle",
        anims: {
            "idle": []
        },
        img: {
            base: null,
            exit: null
        }
    }

    var img
    for (var i = 0; i < MAX_FRAMES; i++) {
        img = new Image()
        img.src = "img/characters/" + num + "/idle/" + String(i).padStart(3, '0') + ".png"
        character.anims.idle.push(img)
    }

    img = new Image();
    img.src = "img/characters/" + num + "/base.png"
    character.img.base = img

    img = new Image();
    img.src = "img/characters/" + num + "/exit.png"
    character.img.exit = img
    return character
}

async function preloadCharacters() {
    for (var i = 0; i < MAX_CHARACTERS; i++) {
        var character = await preloadCharacter(i)
        characters.push(character)
    }
}

async function preloadControl(name) {
    let control = {}

    let img = new Image();
    img.src = "img/buttons/" + name + ".png"
    control.default = img

    img = new Image();
    img.src = "img/buttons/" + name + "_pressed.png"
    control.pressed = img

    img = new Image();
    img.src = "img/buttons/" + name + "_disabled.png"
    control.disabled = img

    return control
}

async function preloadControls() {
    controls = [
        await preloadControl("up"),
        await preloadControl("right"),
        await preloadControl("down"),
        await preloadControl("left")
    ]
}

function addCommand(order) {
    commands.push(order)
}

function nextCommand() {
    if (commands.length > 0) {
        return commands.shift()
    }
}


function generateId() {
    //return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    lastId++
    return lastId
}

function addButton(img, x, y, width, height, value, type, onClick) {
    buttons.push(
        { id: generateId(), img: img, x: x, y: y, width: width, height: height, value: value, type: type, onClick: onClick }
    )
}

function drawButton(button) {
    if (button.img) {
        ctx.drawImage(button.img, button.x, button.y, button.width, button.height)
    }

    if (button == selectedButton) {
        ctx.strokeStyle = 'green'
        ctx.lineWidth = "4"
        ctx.beginPath()
        ctx.rect(button.x - 2, button.y - 2, button.width + 4, button.height + 4)
        ctx.stroke()
    }
}

function drawButtons() {
    buttons.forEach(button => {
        drawButton(button)
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


function drawTile(x, y, tileNum,) {
    x = TILE_OFFSET_X + (x * TILE_SIZE)
    y = TILE_OFFSET_Y + (y * TILE_SIZE)

    ctx.drawImage(tiles[tileNum], x, y)
}

function drawExit(x, y, targetNum) {
    x = TILE_OFFSET_X + (x * TILE_SIZE)
    y = TILE_OFFSET_Y + (y * TILE_SIZE)

    ctx.drawImage(target[targetNum], x, y);
}

function drawBoard(delta) {
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            drawTile(x, y, board[y][x])
        }
    }
}


function drawCharacter(character, delta) {
    if (character.enabled) {
        currentFrame += character.num * 10
        ctx.drawImage(character.img.exit, character.exitX * TILE_SIZE + TILE_OFFSET_X, character.exitY * TILE_SIZE + TILE_OFFSET_Y);
        ctx.drawImage(character.anims[character.currentAnim][currentFrame % character.anims[character.currentAnim].length], character.x * TILE_SIZE + TILE_OFFSET_X, character.y * TILE_SIZE + TILE_OFFSET_Y);
    }
}

function drawCharacters(delta) {
    characters.forEach(character => {
        drawCharacter(character, delta)
    })
}

function validCommand(command) {
    if (command.value == 0) {
        return (characters[command.character].y > 0)
    } else if (command.value == 1) {
        return (characters[command.character].x < 5)
    } else if (command.value == 2) {
        return (characters[command.character].y < 5)
    } else if (command.value == 3) {
        return (characters[command.character].x > 0)
    }
}

function move() {
    if (commands.length > 0) {
        moving = true
        let command = nextCommand()
        console.log("command", command)


        if (validCommand(command)) {
            if (command.value == 0) {
                characters[command.character].y -= 1
            } else if (command.value == 1) {
                characters[command.character].x += 1
            } else if (command.value == 2) {
                characters[command.character].y += 1
            } else if (command.value == 3) {
                characters[command.character].x -= 1
            }
        }

        //TODO Animate movement
        setTimeout(() => {
            moving = false
        }, 250)
    }
}


function gameLoop(timestamp) {
    if (gameEnded) {
        return // Stop the game loop if game has ended
    }
    
    if (lastTime == 0) {
        lastTime = timestamp
        requestAnimationFrame(gameLoop)
    } else {
        const delta = (timestamp - lastTime) / 1000

        lastTime = timestamp

        animTime += delta * 10
        currentFrame = Math.floor(animTime);

        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        drawBoard(delta)
        drawCharacters()
        drawButtons()


        if (!moving) {
            move()
        }




        requestAnimationFrame(gameLoop)
    }
}


function setCharacterPos(character, x, y) {
    character.x = TILE_OFFSET_X + x * TILE_SIZE
    character.y = TILE_OFFSET_Y + y * TILE_SIZE
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
    endGameButton.style.display = 'block'
    canvas.style.display = 'block'
    gameEnded = false
    lastTime = 0
    requestAnimationFrame(gameLoop)
}

function endGame() {
    if (!confirm("Are you sure you want to end the game?")) {
        return
    }
    
    saveGameState()
    gameEnded = true
    buttonsContainer.style.display = 'flex'
    endGameButton.style.display = 'none'
    canvas.style.display = 'none'

    characters = []
    buttons = []
    
    // Reset animation timing
    animTime = 0
    lastTime = 0
    currentFrame = 0
    
    // Reset character positions
    warrior.x = 0
    warrior.y = 0
    warrior.targetX = 0
    warrior.targetY = 0
    warrior.currentAnim = "idle"
    
    // Clear the canvas
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Reset selected button
    selectedButton = null
    
    // Reset editing mode
    editing = false
    
    console.log("Game ended")
}

function hostGame() {
    console.log("Hosting game...")
    
    // Show connection panel with room interface
    connectionPanel.style.display = 'block'
    document.getElementById('roomSection').style.display = 'block'
    buttonsContainer.style.display = 'none'
    statusText.textContent = 'Enter a room name to create/join a room'
}

function joinGame() {
    console.log("Joining game...")
    
    // Show connection panel with room interface
    connectionPanel.style.display = 'block'
    document.getElementById('roomSection').style.display = 'block'
    buttonsContainer.style.display = 'none'
    statusText.textContent = 'Enter a room name to join an existing room'
}

function initializeBoard(onClick) {
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            addButton(null, x * TILE_SIZE + TILE_OFFSET_X, y * TILE_SIZE + TILE_OFFSET_Y, TILE_SIZE, TILE_SIZE, null, "tile", onClick)
        }
    }
}


function gameMode() {
    loadLevel(LEVELS[currentLevel]);

    buttons = []

    let onClick = (button) => {
        addCommand({ character: selectedCharacter, value: button.value })
    }



    addButton(controls[0].default, WIDTH / 2 - TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2, 0, "playDirection", onClick)
    addButton(controls[1].default, TILE_SIZE * 8, HEIGHT / 2 - TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2, 1, "playDirection", onClick)
    addButton(controls[2].default, WIDTH / 2 - TILE_SIZE / 4, TILE_SIZE * 7, TILE_SIZE / 2, TILE_SIZE / 2, 2, "playDirection", onClick)
    addButton(controls[3].default, TILE_SIZE * 1.5, HEIGHT / 2 - TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2, 3, "playDirection", onClick)


    let onBoardClick = (button) => {

    }


    initializeBoard(onBoardClick)
    displayGameArea()
}


function logLevel() {

    levelTxt = "{\n"
    levelTxt += "  map: [" + board.map(row => row.join(', ')).join(', ') + "],\n"
    levelTxt += "  characters: [\n"
    characters.forEach(character => {
        levelTxt += "    {\n"
        levelTxt += "    num: " + character.num + ",\n"
        levelTxt += "    enabled: " + character.enabled + ",\n"
        levelTxt += "    x: " + character.x + ",\n"
        levelTxt += "    y: " + character.y + ",\n"
        levelTxt += "    exitX: " + character.exitX + ",\n"
        levelTxt += "    exitY: " + character.exitY + ",\n"
        levelTxt += "    },\n"
    })
    levelTxt += "  ]\n"
    levelTxt += "}\n"

    console.log(levelTxt)
}

function editMode() {
    loadLevel(LEVELS[currentLevel]);

    buttons = []

    let onClick = (button) => {
        console.log("onClick", button)
        selectedButton = button
        logLevel()
    }

    let x = -10
    let y = 128
    for (i = 0; i < 17; i++) {
        x += 60
        if (x > 180) {
            x = 50
            y += 60
        }
        addButton(tiles[i], x, y, 50, 50, i, "editTile", onClick)
    }



    y += 120

    characters.forEach(character => {
        addButton(character.img.base, 50, y, 50, 50, character.num, "editCharacter", onClick)
        addButton(character.img.exit, 110, y, 50, 50, character.num, "editExit", onClick)
        y += 60
    })



    let onBoardClick = (button) => {
        var [bx, by] = coordsToTile(button.x + 1, button.y + 1)

        if (selectedButton.type == "editTile") {
            board[by][bx] = selectedButton.value
        } else if (selectedButton.type == "editCharacter") {
            if (characters[selectedButton.value].enabled && characters[selectedButton.value].x == bx && characters[selectedButton.value].y == by) {
                characters[selectedButton.value].enabled = false
            } else {
                characters[selectedButton.value].enabled = true
                characters[selectedButton.value].x = bx
                characters[selectedButton.value].y = by
            }
        } else if (selectedButton.type == "editExit") {
            characters[selectedButton.value].exitX = bx
            characters[selectedButton.value].exitY = by
        }


        logLevel()
    }


    initializeBoard(onBoardClick)


    displayGameArea()

    buttons[0].onClick(buttons[0])
}

function loadLevel(level) {
    let i = 0;
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            board[y][x] = level.map[i]
            i++
        }
    }

    for (i = 0; i < characters.length; i++) {
        characters[i].enabled = level.characters[i].enabled
        characters[i].x = level.characters[i].x
        characters[i].y = level.characters[i].y
        characters[i].exitX = level.characters[i].exitX
        characters[i].exitY = level.characters[i].exitY
    }

}

function initialize() {
    preloadTiles();
    preloadCharacters();
    preloadControls();

    resizeCanvas();


    // Check if there's a saved game and show continue button
    if (localStorage.getItem('mazeRTC_gameState')) {
        continueButton.style.display = 'block'
    }

    startButton.addEventListener('click', gameMode)
    continueButton.addEventListener('click', () => {
        if (loadGameState()) {
            displayGameArea()
        } else {
            alert("No saved game found!")
        }
    })
    editorButton.addEventListener('click', editMode)
    hostButton.addEventListener('click', hostGame)
    joinButton.addEventListener('click', joinGame)
    joinRoomButton.addEventListener('click', joinRoom)

    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('click', onCanvasClick)
    endGameButton.addEventListener('click', endGame)
    window.addEventListener('keydown', onKeyDown)

    // Make updateConnectionStatus available globally
    window.updateConnectionStatus = updateConnectionStatus
}

window.addEventListener('load', initialize)

function updateConnectionStatus(status) {
    statusText.textContent = status
    
    if (status === 'Connected - Ready to play!') {
        setTimeout(() => {
            closeConnectionPanel()
            gameMode()
        }, 2000)
    }
}

function updateGameInfo(info) {
    gameInfo.textContent = info
}

function closeConnectionPanel() {
    connectionPanel.style.display = 'none'
    buttonsContainer.style.display = 'flex'
}

function onKeyDown(e) {
    console.log("Key down:", e.key)
    if (e.key === 'ArrowUp') {
        webrtcClient.sendMessage("{ direction: \"up\" }")
    }

    if (e.key === 'ArrowDown') {
        webrtcClient.sendMessage("{ direction: \"down\" }")
    }
}

function saveGameState() {
    const gameState = {
        characters: characters.map(char => ({
            name: char.name,
            x: char.x,
            y: char.y,
            targetX: char.targetX,
            targetY: char.targetY,
            currentAnim: char.currentAnim
        })),
        board: board,
        animTime: animTime,
        currentFrame: currentFrame,
        timestamp: Date.now()
    }
    
    localStorage.setItem('mazeRTC_gameState', JSON.stringify(gameState))
    console.log("Game state saved")
}

function loadGameState() {
    const savedState = localStorage.getItem('mazeRTC_gameState')
    if (savedState) {
        try {
            const gameState = JSON.parse(savedState)
            
            // Restore board
            board = gameState.board
            
            // Restore characters
            characters = gameState.characters.map(charData => {
                const char = { ...warrior }
                char.name = charData.name
                char.x = charData.x
                char.y = charData.y
                char.targetX = charData.targetX
                char.targetY = charData.targetY
                char.currentAnim = charData.currentAnim
                return char
            })
            
            // Restore animation state
            animTime = gameState.animTime || 0
            currentFrame = gameState.currentFrame || 0
            
            console.log("Game state loaded")
            return true
        } catch (error) {
            console.error("Failed to load game state:", error)
            return false
        }
    }
    return false
}

async function joinRoom() {
    const roomName = document.getElementById('roomInput').value.trim()
    if (!roomName) {
        alert('Please enter a room name')
        return
    }
    
    try {
        statusText.textContent = 'Connecting to signaling server...'
        
        // Initialize signaling if not already done
        if (!webrtcClient.signalingClient) {
            await webrtcClient.initializeSignaling()
        }
        
        // Join the room
        await webrtcClient.joinRoom(roomName)
        
        document.getElementById('roomStatus').textContent = `Joined room: ${roomName}`
        statusText.textContent = 'Waiting for other players...'
    } catch (error) {
        console.error('Error joining room:', error)
        statusText.textContent = 'Error joining room'
    }
}
