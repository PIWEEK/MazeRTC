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
const hostButton = document.getElementById('hostButton')
const joinButton = document.getElementById('joinButton')
const connectionPanel = document.getElementById('connectionPanel')
const statusText = document.getElementById('statusText')
const joinRoomButton = document.getElementById('joinRoomButton')
const webrtcClient = new WebRTCClient(window)
const tiles = []
const SELECTED_CHARACTER_COLOR = '#00ff00'
let controls = []
let doorsImgs = []
let doors = []
let plates = []

let animTime = 0
let lastTime = 0
let currentFrame = 0
let editing = false
let gameEnded = false
let buttons = []
let characters = []
let movements = {}
let selectedButton = null
let lastId = -1
let currentLevel = 3
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
            "idle": [],
            "exit": []
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

    character.anims.exit = [character.anims.idle[0]] // Use the first frame of idle as exit animation

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

async function preloadDoor(name) {
    let img = new Image();
    img.src = "img/doors/" + name + ".png"
    return img
}

async function preloadDoors() {
    doorsImgs = {
        closed: [
            await preloadDoor("red_up"),
            await preloadDoor("red_right"),
            await preloadDoor("red_down"),
            await preloadDoor("red_left"),
            await preloadDoor("blue_up"),
            await preloadDoor("blue_right"),
            await preloadDoor("blue_down"),
            await preloadDoor("blue_left"),
        ],
        open: [
            await preloadDoor("red_up_open"),
            await preloadDoor("red_right_open"),
            await preloadDoor("red_down_open"),
            await preloadDoor("red_left_open"),
            await preloadDoor("blue_up_open"),
            await preloadDoor("blue_right_open"),
            await preloadDoor("blue_down_open"),
            await preloadDoor("blue_left_open"),
        ],
        plates: [
            await preloadDoor("red_key"),
            await preloadDoor("blue_key")
        ]
    }
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

function addShadow(ctx) {
    ctx.shadowColor = SELECTED_CHARACTER_COLOR;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawCharacter(character, delta) {
    // if (character.enabled) {
    currentFrame += character.num * 10

    const charX = character.x * TILE_SIZE + TILE_OFFSET_X;
    const charY = character.y * TILE_SIZE + TILE_OFFSET_Y;
    const animationIndex = currentFrame % character.anims[character.currentAnim].length


    ctx.save()
    if (character.num === selectedCharacter) {
        addShadow(ctx);
    }

    if (character.currentAnim === "exit") {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(character.anims[character.currentAnim][animationIndex], charX, charY);
    ctx.restore();
    // }
}

function drawCharacters(delta) {
    characters.forEach(character => {
        drawCharacter(character, delta)
    })
}


function drawExits(delta) {
    characters.forEach(character => {
        if (character.enabled) {
            ctx.drawImage(character.img.exit, character.exitX * TILE_SIZE + TILE_OFFSET_X, character.exitY * TILE_SIZE + TILE_OFFSET_Y);
        }
    })
}

function drawDoors(delta) {
    doors.forEach(door => {
        let img = door.img
        if (door.open) {
            img = door.imgOpen
        }
        ctx.drawImage(img, door.x * TILE_SIZE + TILE_OFFSET_X, door.y * TILE_SIZE + TILE_OFFSET_Y);
    })
}

function drawPlates(delta) {
    plates.forEach(plate => {
        ctx.drawImage(plate.img, plate.x * TILE_SIZE + TILE_OFFSET_X, plate.y * TILE_SIZE + TILE_OFFSET_Y);
    })
}


function emptyTile(tile) {

    let ok = true
    characters.forEach(character => {
        if ((character.x == tile.x) && (character.y == tile.y)) {
            ok = false
        }
    })
    return ok
}

function checkMoveDoors(currentTile, targetTile, movement) {

    var ok = true

    doors.forEach(d => {
        if ((d.x == currentTile.x) && (d.y == currentTile.y)) {
            if ((!d.open) && (d.value == movement)) {
                ok = false
            }
        }

        if ((d.x == targetTile.x) && (d.y == targetTile.y)) {
            if ((!d.open) && (d.value == (movement + 2) % 4)) {
                ok = false
            }
        }
    })
    return ok
}


function validCommand(command) {
    let character = characters[command.character];
    if (!character || !character.enabled) {
        return false;
    }

    let currentTile = TILES[board[character.y][character.x]];

    let currentCoords = { x: character.x, y: character.y }



    if (command.value == 0) {
        let targetTile = TILES[board[character.y - 1][character.x]]
        let targetCoords = { x: character.x, y: character.y - 1 }
        return (character.y > 0 && currentTile.canMoveUp && targetTile.canMoveDown && emptyTile(targetCoords) && checkMoveDoors(currentCoords, targetCoords, 0))
    } else if (command.value == 1) {
        let targetTile = TILES[board[character.y][character.x + 1]]
        let targetCoords = { x: character.x + 1, y: character.y }
        return (character.x < 5 && currentTile.canMoveRight && targetTile.canMoveLeft && emptyTile(targetCoords) && checkMoveDoors(currentCoords, targetCoords, 1))
    } else if (command.value == 2) {
        let targetTile = TILES[board[character.y + 1][character.x]]
        let targetCoords = { x: character.x, y: character.y + 1 }
        return (character.y < 5 && currentTile.canMoveDown && targetTile.canMoveUp && emptyTile(targetCoords) && checkMoveDoors(currentCoords, targetCoords, 2))
    } else if (command.value == 3) {
        let targetTile = TILES[board[character.y][character.x - 1]]
        let targetCoords = { x: character.x - 1, y: character.y }
        return (character.x > 0 && currentTile.canMoveLeft && targetTile.canMoveRight && emptyTile(targetCoords) && checkMoveDoors(currentCoords, targetCoords, 3))
    }
}


function checkDoors() {

    const openColors = new Set()

    plates.forEach(plate => {
        characters.forEach(character => {
            if ((character.enabled) && (character.x == plate.x && character.y == plate.y)) {
                openColors.add(plate.value)
            }
        })
    })

    doors.forEach(door => {
        door.open = openColors.has(Math.floor(door.value / 4))
    })
}

function move() {
    if (commands.length > 0) {
        moving = true
        let command = nextCommand()

        if (command.character === selectedCharacter && validCommand(command)) {
            if (command.value == 0) {
                characters[command.character].y -= 1
            } else if (command.value == 1) {
                characters[command.character].x += 1
            } else if (command.value == 2) {
                characters[command.character].y += 1
            } else if (command.value == 3) {
                characters[command.character].x -= 1
            }

            if (checkCharacterInExit(characters[command.character])) {
                characters[command.character].currentAnim = "exit"
                characters[command.character].enabled = false
            }

            webrtcClient.sendMessage({
                type: "updateCharacter",
                character: selectedCharacter,
                position: [characters[command.character].x, characters[command.character].y],
                enabled: characters[command.character].enabled,
                currentAnim: characters[command.character].currentAnim
            })

            checkGameEnd()
        }

        //TODO Animate movement
        setTimeout(() => {
            moving = false
            checkDoors()
        }, 250)
    }
}

function checkCharacterInExit(character) {
    return character.x === character.exitX && character.y === character.exitY;
}

function checkGameEnd() {
    const charactersInExit = []
    for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        if (checkCharacterInExit(character)) {
            charactersInExit.push(i);
        }
    }

    if (charactersInExit.length === characters.length) {
        console.log("All characters reached their exits! Game over!")
    }
}

function updateCharacter(character, position, enabled, currentAnim) {
    console.log("Updating character", position)
    const [x, y] = position
    characters[character].x = x
    characters[character].y = y
    characters[character].enabled = enabled
    characters[character].currentAnim = currentAnim
    checkDoors()
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
        drawExits()
        drawDoors()
        drawPlates()
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
    for (let i = 0; i < characters.length; i++) {
        const [x, y] = coordsToTile(e.offsetX, e.offsetY);
        const character = characters[i];
        if (character.x === x && character.y === y) {
            selectedCharacter = i;
            break
        }
    }

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
    connectionPanel.style.display = 'block'
    document.getElementById('roomSection').style.display = 'block'
    buttonsContainer.style.display = 'none'
    statusText.textContent = 'Enter a room name to create/join a room'
}

function joinGame() {
    console.log("Joining game...")
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

async function gameMode() {
    loadLevel(LEVELS[currentLevel]);

    // FIXME
    characters[0].enabled = true;
    characters[1].enabled = true;

    console.log(webrtcClient)

    const clients = await webrtcClient.getClients()
    const allClientIds = Object.keys(clients)
    const totalPeers = allClientIds.length
    const currentClientId = webrtcClient.peerId

    movements = {};

    // Create random assignment based on number of peers
    let assignments = [];

    if (totalPeers === 1) {
        // Single player: all 4 buttons
        assignments = [
            { clientId: currentClientId, buttons: [0, 1, 2, 3] }
        ];
    } else if (totalPeers === 2) {
        // Two players: each gets 2 buttons (randomly assigned)
        const shuffledButtons = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        assignments = [
            { clientId: allClientIds[0], buttons: shuffledButtons.slice(0, 2) },
            { clientId: allClientIds[1], buttons: shuffledButtons.slice(2, 4) }
        ];
    } else if (totalPeers === 3) {
        // Three players: randomly assign 2-1-1 distribution
        const shuffledButtons = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        const shuffledClients = [...allClientIds].sort(() => Math.random() - 0.5);
        assignments = [
            { clientId: shuffledClients[0], buttons: shuffledButtons.slice(0, 2) },
            { clientId: shuffledClients[1], buttons: shuffledButtons.slice(2, 3) },
            { clientId: shuffledClients[2], buttons: shuffledButtons.slice(3, 4) }
        ];
    } else if (totalPeers === 4) {
        // Four or more players: each gets 1 button randomly
        const shuffledButtons = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        const shuffledClients = [...allClientIds].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 4; i++) {
            assignments.push({
                clientId: shuffledClients[i % totalPeers],
                buttons: [shuffledButtons[i]]
            });
        }
    }

    // Store assignments in movements object
    assignments.forEach(assignment => {
        movements[assignment.clientId] = assignment.buttons;
    });

    console.log("game mode movements:", movements);

    setMovementButtons(movements);

    const gameState = getGameState()
    webrtcClient.sendMessage({
        type: 'gameStateUpdate',
        gameState: gameState
    })

    let onBoardClick = (button) => { }

    initializeBoard(onBoardClick)
    displayGameArea()
}

function setMovementButtons(movements) {
    const currentClientId = webrtcClient.signalingClient ? webrtcClient.signalingClient.clientId : webrtcClient.peerId || "default";
    const myButtons = movements[currentClientId] || [];

    const buttonConfigs = [
        { control: controls[0], x: WIDTH / 2 - TILE_SIZE / 4, y: TILE_SIZE / 2, value: 0 }, // UP
        { control: controls[1], x: TILE_SIZE * 8, y: HEIGHT / 2 - TILE_SIZE / 4, value: 1 }, // RIGHT
        { control: controls[2], x: WIDTH / 2 - TILE_SIZE / 4, y: TILE_SIZE * 7, value: 2 }, // DOWN
        { control: controls[3], x: TILE_SIZE * 1.5, y: HEIGHT / 2 - TILE_SIZE / 4, value: 3 } // LEFT
    ];

    let onClick = (button) => {
        addCommand({ character: selectedCharacter, value: button.value })
    }

    buttons = []

    myButtons.forEach(buttonIndex => {
        const config = buttonConfigs[buttonIndex];
        addButton(
            config.control.default,
            config.x,
            config.y,
            TILE_SIZE / 2,
            TILE_SIZE / 2,
            config.value,
            "playDirection",
            onClick
        );
    });
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
    levelTxt += "  ],\n"

    levelTxt += "  doors: [\n"
    doors.forEach(door => {
        levelTxt += "    {\n"
        levelTxt += "    value: " + door.value + ",\n"
        levelTxt += "    x: " + door.x + ",\n"
        levelTxt += "    y: " + door.y + ",\n"
        levelTxt += "    },\n"
    })
    levelTxt += "  ],\n"

    levelTxt += "  plates: [\n"
    plates.forEach(plate => {
        levelTxt += "    {\n"
        levelTxt += "    value: " + plate.value + ",\n"
        levelTxt += "    x: " + plate.x + ",\n"
        levelTxt += "    y: " + plate.y + ",\n"
        levelTxt += "    },\n"
    })
    levelTxt += "  ]\n"




    levelTxt += "}\n"

    console.log(levelTxt)
}

function addDoor(x, y, value, open) {
    console.log("Add door", value)
    doors.push({ x: x, y: y, img: doorsImgs.closed[value], imgOpen: doorsImgs.open[value], value: value, open: open })
}

function addRemoveDoor(x, y, value, open) {
    let doorPos = -1
    for (i = 0; i < doors.length; i++) {
        if ((doors[i].x == x) && (doors[i].y == y)) {
            doorPos = i
            break
        }
    }

    if (doorPos != -1) {
        doors.splice(doorPos, 1)
    } else {
        addDoor(x, y, value, open)
    }
}

function addPlate(x, y, value) {
    plates.push({ x: x, y: y, img: doorsImgs.plates[value], value: value })
}

function addRemovePlate(x, y, value) {
    let platePos = -1
    for (i = 0; i < plates.length; i++) {
        if ((plates[i].x == x) && (plates[i].y == y)) {
            platePos = i
            break
        }
    }

    if (platePos != -1) {
        plates.splice(platePos, 1)
    } else {
        addPlate(x, y, value)
    }
}

function editMode() {
    buttons = []
    loadLevel(LEVELS[currentLevel]);


    let onClick = (button) => {
        selectedButton = button
        logLevel()
    }

    let x = 15
    let y = 128
    for (i = 0; i < 17; i++) {
        addButton(tiles[i], x, y, 50, 50, i, "editTile", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }

    }


    x = 15
    y += 60

    characters.forEach(character => {
        addButton(character.img.base, x, y, 50, 50, character.num, "editCharacter", onClick)
        addButton(character.img.exit, x + 60, y, 50, 50, character.num, "editExit", onClick)
        x += 120
        if (x > 200) {
            x = 15
            y += 60
        }
    })

    x = 15
    y += 60

    for (i = 0; i < doorsImgs.closed.length; i++) {
        addButton(doorsImgs.closed[i], x, y, 50, 50, i, "editDoor", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }
    }

    x = 15

    for (i = 0; i < doorsImgs.plates.length; i++) {
        addButton(doorsImgs.plates[i], x, y, 50, 50, i, "editPlate", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }
    }



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
        } else if (selectedButton.type == "editDoor") {
            addRemoveDoor(bx, by, selectedButton.value)
        } else if (selectedButton.type == "editPlate") {
            addRemovePlate(bx, by, selectedButton.value)
        }


        logLevel()
    }

    initializeBoard(onBoardClick)
    displayGameArea()

    buttons[0].onClick(buttons[0])
}

function loadLevel(level) {

    plates = []
    doors = []

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


    if (level.doors) {
        level.doors.forEach(door => {
            addDoor(door.x, door.y, door.value, door.open)
        })
    }

    if (level.plates) {
        level.plates.forEach(plate => {
            addPlate(plate.x, plate.y, plate.value)
        })
    }
}

function initialize() {
    preloadTiles();
    preloadCharacters();
    preloadControls();
    preloadDoors();

    resizeCanvas();

    // Check if there's a saved game and show continue button
    if (localStorage.getItem('mazeRTC_gameState')) {
        continueButton.style.display = 'block'
    }

    startButton.addEventListener('click', gameMode)
    editorButton.addEventListener('click', editMode)
    hostButton.addEventListener('click', hostGame)
    joinButton.addEventListener('click', joinGame)
    joinRoomButton.addEventListener('click', joinRoom)

    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('click', onCanvasClick)
    endGameButton.addEventListener('click', endGame)
    window.addEventListener('keydown', onKeyDown)
    window.updateConnectionStatus = updateConnectionStatus
}

window.addEventListener('load', initialize)

function updateConnectionStatus(status) {
    statusText.textContent = status

    if (status === 'Connected - Ready to play!') {
        setTimeout(() => {
            closeConnectionPanel()

            if (webrtcClient.isHost) {
                gameMode()
                const gameState = getGameState()
                webrtcClient.sendMessage({
                    type: 'gameStateUpdate',
                    gameState: gameState
                });
            }
        }, 2000)
    }
}

function updateGame(gameState) {
    setGameState(gameState)
    setMovementButtons(gameState.movements)
    displayGameArea()
}

function closeConnectionPanel() {
    connectionPanel.style.display = 'none'
    buttonsContainer.style.display = 'flex'
}

function onKeyDown(e) {
    // TODO
}

function getGameState() {
    return {
        characters: characters.map(char => ({
            num: char.num,
            enabled: char.enabled,
            x: char.x,
            y: char.y,
            exitX: char.exitX,
            exitY: char.exitY,
            currentAnim: char.currentAnim
        })),
        doors: doors.map(door => ({
            value: door.value,
            x: door.x,
            y: door.y,
            open: door.open
        })),
        plates: plates.map(plate => ({
            value: plate.value,
            x: plate.x,
            y: plate.y
        })),

        board: board,
        animTime: animTime,
        currentFrame: currentFrame,
        timestamp: Date.now(),
        movements: movements
    }
}

function setGameState(gameState) {
    board = gameState.board || board

    // Restore characters if gameState has character data
    if (gameState.characters && gameState.characters.length > 0) {
        gameState.characters.forEach((charData, index) => {
            if (index < characters.length) {
                characters[index].enabled = charData.enabled
                characters[index].x = charData.x
                characters[index].y = charData.y
                characters[index].exitX = charData.exitX
                characters[index].exitY = charData.exitY
                characters[index].currentAnim = charData.currentAnim
            }
        })
    }

    doors = []

    if (gameState.doors && gameState.doors.length > 0) {
        gameState.doors.forEach((doorData) => {
            addDoor(doorData.x, doorData.y, doorData.value, doorData.open)
        })
    }

    plates = []

    if (gameState.plates && gameState.plates.length > 0) {
        gameState.plates.forEach((plateData) => {
            addPlate(plateData.x, plateData.y, plateData.value)
        })
    }

    animTime = gameState.animTime || 0
    currentFrame = gameState.currentFrame || 0
}

function saveGameState() {
    const gameState = getGameState()
    localStorage.setItem('mazeRTC_gameState', JSON.stringify(gameState))
    console.log("Game state saved")
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
