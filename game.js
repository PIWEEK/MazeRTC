const WIDTH = 1280
const HEIGHT = 1024
const TILE_SIZE = 128
const TILE_OFFSET_X = 256
const TILE_OFFSET_Y = 128
const MAX_FRAMES = 4
const MAX_CHARACTERS = 4

const TILE_OFFSET_EDITOR = 4

const JUMP = 4
const PUSH = 8
const TELEPORT = 12

const SPEED = 250

let currentLevel = 1


const MODE_LOBY = 0
const MODE_PLAYING = 1
const MODE_EDITOR = 2
const MODE_LEVEL_SELECTION = 3
var mode = MODE_LOBY

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const buttonsContainer = document.getElementById('buttons')
const startButton = document.getElementById('startButton')
const startGameButton = document.getElementById('startGameButton')
const continueButton = document.getElementById('continueButton')
const editorButton = document.getElementById('editorButton')
const hostButton = document.getElementById('hostButton')
const joinButton = document.getElementById('joinButton')
const connectionPanel = document.getElementById('connectionPanel')
const statusText = document.getElementById('statusText')
const joinRoomButton = document.getElementById('joinRoomButton')
const webrtcClient = new WebRTCClient(window)
const tiles = []
const SELECTED_CHARACTER_COLOR = '#ff0000'
let controls = []
let doorsImgs = []
let doors = []
let holesImgs = []
let holes = []
let trapImg
let traps = []
let teleportImg
let teleports = []
let plates = []

let animTime = 0
let lastTime = 0
let currentFrame = 0
let gameEnded = false
let buttons = []
let characters = []
let movements = {}
let selectedButton = null
let lastId = -1
let commands = []
let selectedCharacter = 0
let moving = false
let powers = []
let movementButtonsConfig

let imgExit
let imgPopup
let imgLevel

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
        exitKeyX: -1,
        exitKeyY: -1,
        exitOpen: false,
        drawX: 0,
        drawY: 0,
        drawTargetX: 0,
        drawTargetY: 0,
        currentAnim: "idle",
        speed: SPEED,
        anims: {
            idle: [],
            walkU: [],
            walkR: [],
            walkD: [],
            walkL: [],
            exit: []
        },
        img: {
            base: null,
            exit: null
        }
    }

    let img

    ["walkU", "walkR", "walkD", "walkL"].forEach(anim => {
        for (var i = 0; i < MAX_FRAMES; i++) {
            img = new Image()
            img.src = "img/characters/" + num + "/" + anim + "/" + String(i).padStart(3, '0') + ".png"
            character.anims[anim].push(img)
        }
    })

    img = new Image()
    img.src = "img/characters/" + num + "/idle/000.png"
    character.anims.idle.push(img)
    character.anims.exit = img // Use the first frame of idle as exit animation
    character.img.base = img // Use the first frame of idle as base animation


    img = new Image();
    img.src = "img/characters/" + num + "/exit.png"
    character.img.exit = img

    img = new Image();
    img.src = "img/characters/" + num + "/exit_closed.png"
    character.img.exitClosed = img

    img = new Image();
    img.src = "img/characters/" + num + "/exit_key.png"
    character.img.exitKey = img

    return character
}

async function preloadCharacters() {
    characters = []
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
    control.imgSelected = img

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


async function preloadPower(name) {
    let power = { selected: false }
    let img = new Image();
    img.src = "img/buttons/" + name + ".png"
    power.default = img

    img = new Image();
    img.src = "img/buttons/" + name + "_selected.png"
    power.imgSelected = img

    return power;
}



async function preloadPowers() {
    powers = [
        await preloadPower("jump"),
        await preloadPower("push"),
        await preloadPower("teleport")
    ]

    let img = new Image();
    img.src = "img/trap.png"
    trapImg = img

    img = new Image();
    img.src = "img/teleport.png"
    teleportImg = img


    for (let i = 0; i < 4; i++) {
        img = new Image();
        img.src = "img/holes/" + i + ".png"
        holesImgs.push(img)
    }


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
            await preloadDoor("orange_up"),
            await preloadDoor("orange_right"),
            await preloadDoor("orange_down"),
            await preloadDoor("orange_left"),
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
            await preloadDoor("orange_up_open"),
            await preloadDoor("orange_right_open"),
            await preloadDoor("orange_down_open"),
            await preloadDoor("orange_left_open"),
        ],
        plates: [
            await preloadDoor("red_key"),
            await preloadDoor("blue_key"),
            await preloadDoor("orange_key")
        ]
    }
}

async function preloadPopups() {
    imgPopup = new Image();
    imgPopup.src = "img/popup.png"

    imgLevel = new Image();
    imgLevel.src = "img/buttons/level.png"

    imgExit = new Image();
    imgExit.src = "img/buttons/exit.png"


    imgExit
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

function addButton(img, imgSelected, x, y, width, height, value, type, onClick) {
    buttons.push(
        { id: generateId(), img: img, imgSelected: imgSelected, x: x, y: y, width: width, height: height, value: value, type: type, onClick: onClick, selected: false }
    )
}

function drawButton(button) {
    if (!button.selected && button.img) {
        ctx.drawImage(button.img, button.x, button.y, button.width, button.height)
    } else if (button.selected && button.imgSelected) {
        ctx.drawImage(button.imgSelected, button.x, button.y, button.width, button.height)
    }


    // For editor
    if (button == selectedButton) {
        ctx.strokeStyle = 'green'
        ctx.lineWidth = "4"
        ctx.beginPath()
        ctx.rect(button.x - 2, button.y - 2, button.width + 4, button.height + 4)
        ctx.stroke()
    }

    if (button.type == "level") {
        ctx.font = '48px Impact'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.fillText(String(button.value + 1).padStart(2, '0'), button.x + button.width / 2, button.y + button.height * 0.6)
    }
}

function drawButtons() {
    buttons.forEach(button => {

        if (((button.type != "jump") || (selectedCharacter == 0)) &&
            ((button.type != "push") || (selectedCharacter == 1)) &&
            ((button.type != "teleport") || (selectedCharacter == 3))) {
            drawButton(button)
        }
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


function drawBoard(delta) {
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            drawTile(x, y, board[y][x])
        }
    }
}

function addShadow(ctx) {
    ctx.shadowColor = SELECTED_CHARACTER_COLOR;
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawCharacter(character, delta) {
    if (character.enabled) {
        currentFrame += character.num * 10
        let inc = character.speed * delta


        // Animation
        if (character.drawX < character.drawTargetX) {
            character.drawX = Math.min(character.drawX + inc, character.drawTargetX)
        } else if (character.drawX > character.drawTargetX) {
            character.drawX = Math.max(character.drawX - inc, character.drawTargetX)
        } else if (character.drawY < character.drawTargetY) {
            character.drawY = Math.min(character.drawY + inc, character.drawTargetY)
        } else if (character.drawY > character.drawTargetY) {
            character.drawY = Math.max(character.drawY - inc, character.drawTargetY)
        }


        const animationIndex = (currentFrame % character.anims[character.currentAnim].length) || 0

        ctx.save()
        if (character.num === selectedCharacter) {
            addShadow(ctx);
        }

        if (character.currentAnim === "exit") {
            ctx.globalAlpha = 0.5;
        }
        ctx.drawImage(character.anims[character.currentAnim][animationIndex], character.drawX, character.drawY);
        ctx.restore();
    }
}

function drawCharacters(delta) {
    for (let i = 3; i >= 0; i--) {
        drawCharacter(characters[i], delta)
    }
}


function drawExits(delta) {
    characters.forEach(character => {
        if (character.enabled) {
            if (character.exitOpen) {
                ctx.drawImage(character.img.exit, character.exitX * TILE_SIZE + TILE_OFFSET_X, character.exitY * TILE_SIZE + TILE_OFFSET_Y);
            } else {
                ctx.drawImage(character.img.exitClosed, character.exitX * TILE_SIZE + TILE_OFFSET_X, character.exitY * TILE_SIZE + TILE_OFFSET_Y);
            }

            if (character.exitKeyX != -1) {
                ctx.drawImage(character.img.exitKey, character.exitKeyX * TILE_SIZE + TILE_OFFSET_X, character.exitKeyY * TILE_SIZE + TILE_OFFSET_Y);
            }
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

function drawItems(items) {
    items.forEach(item => {
        ctx.drawImage(item.img, item.x * TILE_SIZE + TILE_OFFSET_X, item.y * TILE_SIZE + TILE_OFFSET_Y);
    })
}

function drawLevelSelection() {
    ctx.drawImage(imgPopup, 140, 0);

    ctx.font = '80px Impact'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText('SELECT LEVEL', canvas.width / 2, 410)

}


function emptyTile(tile) {
    return findItem(characters, tile.x, tile.y) == null
}

function checkMoveDoors(currentTile, targetTile, movement) {

    var ok = true

    doors.forEach(d => {
        if ((d.x == currentTile.x) && (d.y == currentTile.y)) {
            if ((!d.open) && ((d.value % 4) == movement)) {
                ok = false
            }
        }

        if ((d.x == targetTile.x) && (d.y == targetTile.y)) {
            if ((!d.open) && ((d.value % 4) == (movement + 2) % 4)) {
                ok = false
            }
        }
    })
    return ok
}

function findItem(items, x, y) {
    for (let i = 0; i < items.length; i++) {
        if ((items[i].x == x) && (items[i].y == y) && (items[i].enabled != false)) {
            return items[i]
        }
    }
}

function canMove(currentTile, targetTile, movement, character, ignoreTraps) {
    if (!currentTile || !targetTile) {
        return false
    }

    let currentHole = findItem(holes, currentTile.x, currentTile.y)
    let targetHole = findItem(holes, targetTile.x, targetTile.y)

    let inverseMovement = (movement + 2) % 4

    let targetTrap = null
    if (!ignoreTraps) {
        targetTrap = findItem(traps, targetTile.x, targetTile.y)
    }

    return (currentTile.allowedMoves[movement] || ((character == 2) && currentHole && (currentHole.value == movement))) &&
        (targetTile.allowedMoves[inverseMovement] || ((character == 2) && targetHole && (targetHole.value == inverseMovement))) &&
        !targetTrap &&
        checkMoveDoors(currentTile, targetTile, movement)
}


function getTile(x, y) {
    if ((x < 0) || (x > 5) || (y < 0) || (y > 5)) {
        return null
    }

    return {
        allowedMoves: TILES[board[y][x]],
        x: x,
        y: y
    }
}


function getTargetTile(currentTile, value) {
    if (currentTile) {
        if (value == 0) {
            return getTile(currentTile.x, currentTile.y - 1)
        } else if (value == 1) {
            return getTile(currentTile.x + 1, currentTile.y)
        } else if (value == 2) {
            return getTile(currentTile.x, currentTile.y + 1)
        } else if (value == 3) {
            return getTile(currentTile.x - 1, currentTile.y)
        }
    }
}

function getWalkInfo(command) {
    let character = characters[command.character]
    let currentTile = getTile(character.x, character.y)
    let targetTile = getTargetTile(currentTile, command.value)

    if (canMove(currentTile, targetTile, command.value, command.character) && emptyTile(targetTile)) {
        return [character, targetTile]
    }
}

function getJumpInfo(command) {
    let value = command.value - JUMP
    let character = characters[command.character]
    let currentTile = getTile(character.x, character.y)
    let targetTile = getTargetTile(currentTile, value)
    let targetTile2 = getTargetTile(targetTile, value)


    if (targetTile && targetTile2) {
        if (canMove(currentTile, targetTile, value) && canMove(targetTile, targetTile2, value) && !emptyTile(targetTile) && emptyTile(targetTile2)) {
            return [character, targetTile2]
        }
    }
}

function getPushInfo(command) {
    let value = command.value - PUSH
    let character = characters[command.character]
    let currentTile = getTile(character.x, character.y)
    let targetTile = getTargetTile(currentTile, value)
    let targetTile2 = getTargetTile(targetTile, value)
    let targetTile3 = getTargetTile(targetTile2, value)
    if (targetTile && targetTile2 && targetTile3) {
        let trap = findItem(traps, targetTile2.x, targetTile2.y)
        let targetCharacter = findItem(characters, targetTile.x, targetTile.y)

        if (targetCharacter &&
            trap &&
            canMove(currentTile, targetTile, value, command.character, true) &&
            canMove(targetTile, targetTile2, value, command.character, true) &&
            canMove(targetTile2, targetTile3, value, command.character, true)) {
            return [targetCharacter, targetTile3]
        }
    }
}


function getMoveInfo(command) {
    let character = characters[command.character];
    if (!character || !character.enabled) {
        return null;
    }

    if (command.value < JUMP) {
        return getWalkInfo(command);
    } else if ((command.value >= JUMP) && (command.value < PUSH)) {
        return getJumpInfo(command);
    } else if ((command.value >= PUSH) && (command.value < TELEPORT)) {
        return getPushInfo(command);
    } else if (command.value == TELEPORT) {

    }
}

function pushAnim(character, targetTile) {
    let x = character.drawX
    let y = character.drawY
    character.drawTargetX = targetTile.x * TILE_SIZE + TILE_OFFSET_X
    character.drawTargetY = targetTile.y * TILE_SIZE + TILE_OFFSET_Y
    character.speed = SPEED * 8

    setTimeout(() => {
        character.drawTargetX = x
        character.drawTargetY = y

        setTimeout(() => {
            character.drawX = x
            character.drawY = y
            character.speed = SPEED
        }, 75)

    }, 75)

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


function teleport(command) {
    let character = characters[command.character]
    let targetCharacter = characters[command.targetCharacter]
    let teleportPlatform = findItem(teleports, character.x, character.y)
    if (teleportPlatform) {
        setCharacterPos(character, targetCharacter.x, targetCharacter.y)
        setCharacterPos(targetCharacter, teleportPlatform.x, teleportPlatform.y)
        endMove(command.character, character)

        webrtcClient.sendMessage({
            type: "runCommand",
            command: "updateCharacter",
            args: {
                character: character.num,
                position: [character.x, character.y],
                enabled: character.enabled,
                currentAnim: character.currentAnim,
                speed: 10000
            }
        })

        webrtcClient.sendMessage({
            type: "runCommand",
            command: "updateCharacter",
            args: {
                character: targetCharacter.num,
                position: [targetCharacter.x, targetCharacter.y],
                enabled: targetCharacter.enabled,
                currentAnim: targetCharacter.currentAnim,
                speed: 10000
            }
        })
    }
}

function move() {
    if (commands.length > 0) {
        let command = nextCommand()
        if (command.character === selectedCharacter) {

            if (command.value == TELEPORT) {
                teleport(command)

            } else {


                const moveInfo = getMoveInfo(command) || []
                const [character, targetTile] = moveInfo
                if (targetTile) {
                    moving = true

                    character.drawTargetX = targetTile.x * TILE_SIZE + TILE_OFFSET_X
                    character.drawTargetY = targetTile.y * TILE_SIZE + TILE_OFFSET_Y

                    if (command.value >= JUMP) {
                        character.speed = SPEED * 2
                    }

                    if (targetTile.x > character.x) {
                        character.currentAnim = "walkR"
                    } else if (targetTile.x < character.x) {
                        character.currentAnim = "walkL"
                    } if (targetTile.y > character.y) {
                        character.currentAnim = "walkD"
                    } if (targetTile.y < character.y) {
                        character.currentAnim = "walkU"
                    }

                    // Add push anim
                    if ((command.value >= PUSH) && (command.value < TELEPORT)) {
                        pushAnim(characters[command.character], targetTile)

                    }

                    webrtcClient.sendMessage({
                        type: "runCommand",
                        command: "updateCharacter",
                        args: {
                            character: character.num,
                            position: [targetTile.x, targetTile.y],
                            enabled: character.enabled,
                            currentAnim: character.currentAnim,
                            speed: character.speed
                        }
                    })

                    setTimeout(() => {
                        endMove(character.num, targetTile)
                    }, 500)
                }
            }
        }
    }
}

function endMove(chNum, targetTile) {
    moving = false
    clearPowers()
    let character = characters[chNum]
    character.speed = SPEED

    character.currentAnim = "idle"

    setCharacterPos(character, targetTile.x, targetTile.y)
    checkDoors()

    if (checkCharacterInExit(character)) {
        character.currentAnim = "exit"
        character.enabled = false
        selectNextCharacter()
    }

    checkOpenExits()

    checkGameEnd()
}

function checkOpenExits() {
    let open = true
    for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        if (character.enabled &&
            (character.exitOpen || character.x != character.exitKeyX || character.y != character.exitKeyY)) {
            open = false
            break
        }
    }
    if (open) {
        characters.forEach(character => {
            character.exitOpen = true
        })
    }
}

function checkCharacterInExit(character) {
    return character.x === character.exitX && character.y === character.exitY && character.exitOpen;
}

function checkCharacterInExitKey(character) {
    return character.x === character.exitKeyX && character.y === character.exitKeyY;
}

function checkGameEnd() {
    let end = true

    for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        if (character.enabled) {
            end = false
            break
        }
    }

    if (end) {
        console.log("All characters reached their exits! Game over!")
        levelSelectionMode()
    }
}

function updateCharacter({ character, position, enabled, currentAnim, speed }) {
    console.log("Updating character", position)
    const [x, y] = position
    characters[character].drawTargetX = x * TILE_SIZE + TILE_OFFSET_X
    characters[character].drawTargetY = y * TILE_SIZE + TILE_OFFSET_Y
    characters[character].enabled = enabled
    characters[character].currentAnim = currentAnim
    characters[character].speed = speed

    // For teleport
    if (speed == 10000) {
        setCharacterPos(characters[character], x * TILE_SIZE + TILE_OFFSET_X, TILE_SIZE + TILE_OFFSET_Y)
        endMove(character, { x: x, y: y })

    }

    setTimeout(() => {
        endMove(character, { x: x, y: y })
    }, 500)
}

function runCommand(command, args) {
    this[command](args)
    if (webrtcClient.isHost) {
        webrtcClient.sendMessage({
            type: "runCommand",
            command: command,
            args: args
        })
    }
}

function gameLoop(timestamp) {
    if (mode == MODE_EDITOR) {
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.strokeStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        drawBoard()
        drawExits()
        drawDoors()
        drawItems(plates)
        drawItems(holes)
        drawItems(teleports)
        drawItems(traps)
        drawCharacters()
        drawButtons()

        requestAnimationFrame(gameLoop)
    } else if (mode == MODE_LEVEL_SELECTION) {
        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawBoard()
        drawLevelSelection()
        drawButtons()
        requestAnimationFrame(gameLoop)
    } else if (mode == MODE_PLAYING) {
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
            drawItems(plates)
            drawItems(holes)
            drawItems(teleports)
            drawItems(traps)
            drawCharacters(delta)
            drawButtons()

            if (!moving) {
                move()
            }
        }

        requestAnimationFrame(gameLoop)
    }
}


function coordsToTile(x, y) {
    return [Math.floor((x - TILE_OFFSET_X) / TILE_SIZE), Math.floor((y - TILE_OFFSET_Y) / TILE_SIZE)]
}

function onCanvasClick(e) {
    onCoordsClick(e.offsetX, e.offsetY)
}

function clearPowers() {
    // Unselect all buttons
    buttons.forEach(button => {
        button.selected = false
    });

    // Unselect all powers
    powers.forEach(powers => {
        powers.selected = false
    });
}

function selectCharacter(num) {
    if (characters[num].enabled) {
        clearPowers();
        selectedCharacter = num;
    }
}


function onCoordsClick(coordX, coordY) {
    const [x, y] = coordsToTile(coordX, coordY);
    for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        if ((character.x === x && character.y === y) && (selectedCharacter != i) && character.enabled) {
            if (powers[2].selected) {
                addCommand({ character: selectedCharacter, targetCharacter: i, value: TELEPORT })
            } else {
                selectCharacter(i)
            }
            break
        }
    }

    for (var i = 0; i < buttons.length; i++) {
        if (pointInRect(coordX, coordY, buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height)) {
            buttons[i].onClick(buttons[i])
        }
    }
}

function displayGameArea() {
    const isPhone = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent)
    if (isPhone) {
        enterFullscreenAndLockOrientation()
    }
    buttonsContainer.style.display = 'none'
    canvas.style.display = 'block'
    document.body.classList.add('playing')
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
    canvas.style.display = 'none'
    document.body.classList.remove('playing')

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
            addButton(null, null, x * TILE_SIZE + TILE_OFFSET_X, y * TILE_SIZE + TILE_OFFSET_Y, TILE_SIZE, TILE_SIZE, null, "tile", onClick)
        }
    }
}

function levelSelectionMode() {
    mode = MODE_LEVEL_SELECTION

    buttons = []

    let onClick = (button) => {
        currentLevel = button.value
        gameMode()
    }


    let x = 180
    let y = 435

    for (let i = 0; i < LEVELS.length; i++) {
        addButton(imgLevel, null, x, y, TILE_SIZE, TILE_SIZE, i, "level", onClick)
        x += 128
        if (x > 1000) {
            x = 180
            y += 128
        }

    }

    displayGameArea()
}

async function gameMode() {
    mode = MODE_PLAYING

    buttons = []


    loadLevel(LEVELS[currentLevel]);

    // FIXME
    //characters[0].enabled = true;
    //characters[1].enabled = true;

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

    movementButtonsConfig = [
        { control: controls[0], x: WIDTH / 2 - TILE_SIZE / 4, y: 0, value: 0 }, // UP
        { control: controls[1], x: TILE_SIZE * 8, y: HEIGHT / 2 - TILE_SIZE / 4, value: 1 }, // RIGHT
        { control: controls[2], x: WIDTH / 2 - TILE_SIZE / 4, y: TILE_SIZE * 7, value: 2 }, // DOWN
        { control: controls[3], x: TILE_SIZE, y: HEIGHT / 2 - TILE_SIZE / 4, value: 3 }, // LEFT
    ];

    let onClick = (button) => {
        if (powers[0].selected) {
            addCommand({ character: selectedCharacter, value: button.value + JUMP })
        } else if (powers[1].selected) {
            addCommand({ character: selectedCharacter, value: button.value + PUSH })
        } else {
            addCommand({ character: selectedCharacter, value: button.value })
        }

        button.selected = true
        setTimeout(() => {
            button.selected = false
        }, 250)
    }


    myButtons.forEach(buttonIndex => {
        const config = movementButtonsConfig[buttonIndex];
        addButton(
            config.control.default,
            config.control.imgSelected,
            config.x,
            config.y,
            TILE_SIZE,
            TILE_SIZE,
            config.value,
            "playDirection",
            onClick
        );
    });


    let onJump = (button) => {
        if (selectedCharacter == 0) {
            button.selected = !button.selected
            powers[0].selected = !powers[0].selected
        }
    }

    // Jump button
    addButton(
        powers[0].default,
        powers[0].imgSelected,
        TILE_SIZE * 9 - 25,
        25,
        TILE_SIZE,
        TILE_SIZE,
        4,
        "jump",
        onJump
    );

    let onPush = (button) => {
        if (selectedCharacter == 1) {
            button.selected = !button.selected
            powers[1].selected = !powers[1].selected
        }
    }

    // Push button
    addButton(
        powers[1].default,
        powers[1].imgSelected,
        TILE_SIZE * 9 - 25,
        25,
        TILE_SIZE,
        TILE_SIZE,
        5,
        "push",
        onPush
    );



    let onTeleport = (button) => {
        if (selectedCharacter == 3) {
            button.selected = !button.selected
            powers[2].selected = !powers[2].selected
        }
    }

    // Teleport button
    addButton(
        powers[2].default,
        powers[2].imgSelected,
        TILE_SIZE * 9 - 25,
        25,
        TILE_SIZE,
        TILE_SIZE,
        5,
        "teleport",
        onTeleport
    );


    //Exit
    addButton(
        imgExit,
        null,
        25,
        25,
        TILE_SIZE,
        TILE_SIZE,
        5,
        "exit",
        endGame
    );


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
        levelTxt += "    exitKeyX: " + character.exitKeyX + ",\n"
        levelTxt += "    exitKeyY: " + character.exitKeyY + ",\n"
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
    levelTxt += "  ],\n"

    levelTxt += "  holes: [\n"
    holes.forEach(hole => {
        levelTxt += "    {\n"
        levelTxt += "    value: " + hole.value + ",\n"
        levelTxt += "    x: " + hole.x + ",\n"
        levelTxt += "    y: " + hole.y + ",\n"
        levelTxt += "    },\n"
    })
    levelTxt += "  ],\n"

    levelTxt += "  traps: [\n"
    traps.forEach(trap => {
        levelTxt += "    {\n"
        levelTxt += "    value: " + trap.value + ",\n"
        levelTxt += "    x: " + trap.x + ",\n"
        levelTxt += "    y: " + trap.y + ",\n"
        levelTxt += "    },\n"
    })
    levelTxt += "  ],\n"

    levelTxt += "  teleports: [\n"
    teleports.forEach(teleport => {
        levelTxt += "    {\n"
        levelTxt += "    value: " + teleport.value + ",\n"
        levelTxt += "    x: " + teleport.x + ",\n"
        levelTxt += "    y: " + teleport.y + ",\n"
        levelTxt += "    },\n"
    })
    levelTxt += "  ]\n"

    levelTxt += "}\n"

    console.log(levelTxt)
}

function addDoor(x, y, value, open) {
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

function addItem(x, y, items, imgs, value) {
    items.push({ x: x, y: y, img: imgs[value], value: value })
}

function addRemoveItem(x, y, items, imgs, value) {
    let pos = -1
    for (i = 0; i < items.length; i++) {
        if ((items[i].x == x) && (items[i].y == y)) {
            pos = i
            break
        }
    }

    if (pos != -1) {
        items.splice(pos, 1)
    } else {
        addItem(x, y, items, imgs, value)
    }
}



function editMode() {
    mode = MODE_EDITOR
    buttons = []
    loadLevel(LEVELS[currentLevel]);


    let onClick = (button) => {
        selectedButton = button
        logLevel()
    }

    let x = 15
    let y = 75
    for (i = 0; i < 17; i++) {
        addButton(tiles[i], null, x, y, 50, 50, i, "editTile", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }

    }

    x = 15
    y += 60

    characters.forEach(character => {
        addButton(character.img.base, null, x, y, 50, 50, character.num, "editCharacter", onClick)
        addButton(character.img.exit, null, x + 60, y, 50, 50, character.num, "editExit", onClick)
        addButton(character.img.exitKey, null, x + 120, y, 50, 50, character.num, "editExitKey", onClick)
        y += 60
        x = 15
    })

    x = 15

    for (i = 0; i < doorsImgs.closed.length; i++) {
        addButton(doorsImgs.closed[i], null, x, y, 50, 50, i, "editDoor", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }
    }

    x = 15

    for (i = 0; i < doorsImgs.plates.length; i++) {
        addButton(doorsImgs.plates[i], null, x, y, 50, 50, i, "editPlate", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }
    }

    x = 15
    y += 60

    for (i = 0; i < holesImgs.length; i++) {
        addButton(holesImgs[i], null, x, y, 50, 50, i, "editHole", onClick)
        x += 60
        if (x > 200) {
            x = 15
            y += 60
        }
    }

    x = 15
    addButton(trapImg, null, x, y, 50, 50, i, "editTrap", onClick)
    x += 60
    addButton(teleportImg, null, x, y, 50, 50, i, "editTeleport", onClick)



    let onBoardClick = (button) => {
        var [bx, by] = coordsToTile(button.x + 1, button.y + 1)
        let character = characters[selectedButton.value]

        if (selectedButton.type == "editTile") {
            board[by][bx] = selectedButton.value
        } else if (selectedButton.type == "editCharacter") {
            if (character.enabled && character.x == bx && character.y == by) {
                character.enabled = false
            } else {
                character.enabled = true
                setCharacterPos(character, bx, by)
            }
        } else if ((selectedButton.type == "editExit") && character.enabled) {
            character.exitX = bx
            character.exitY = by
        } else if ((selectedButton.type == "editExitKey") && character.enabled) {
            if (character.exitKeyX == bx && character.exitKeyY == by) {
                character.exitKeyX = -1
                character.exitKeyY = -1
            } else {
                character.exitKeyX = bx
                character.exitKeyY = by
            }
        } else if (selectedButton.type == "editDoor") {
            addRemoveDoor(bx, by, selectedButton.value)
        } else if (selectedButton.type == "editPlate") {
            addRemoveItem(bx, by, plates, doorsImgs.plates, selectedButton.value)
        } else if (selectedButton.type == "editHole") {
            addRemoveItem(bx, by, holes, holesImgs, selectedButton.value)
        } else if (selectedButton.type == "editTrap") {
            addRemoveItem(bx, by, traps, [trapImg], 0)
        } else if (selectedButton.type == "editTeleport") {
            addRemoveItem(bx, by, teleports, [teleportImg], 0)
        }


        logLevel()
    }

    initializeBoard(onBoardClick)
    displayGameArea()

    buttons[0].onClick(buttons[0])
}

function loadLevel(level) {

    traps = []
    holes = []
    teleports = []
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
        characters[i].currentAnim = "idle"
        characters[i].enabled = level.characters[i].enabled
        setCharacterPos(characters[i], level.characters[i].x, level.characters[i].y)

        characters[i].exitX = level.characters[i].exitX
        characters[i].exitY = level.characters[i].exitY

        characters[i].exitKeyX = -1
        characters[i].exitKeyY = -1
        characters[i].exitOpen = true

        if ((level.characters[i].exitKeyX != null) && (level.characters[i].exitKeyX != -1)) {
            characters[i].exitKeyX = level.characters[i].exitKeyX
            characters[i].exitKeyY = level.characters[i].exitKeyY
            characters[i].exitOpen = false
        }

        if (characters[i].enabled) {
            selectedCharacter = i
        }

        console.log(characters[i])

    }


    if (level.doors) {
        level.doors.forEach(door => {
            addDoor(door.x, door.y, door.value, door.open)
        })
    }

    if (level.plates) {
        level.plates.forEach(plate => {
            addItem(plate.x, plate.y, plates, doorsImgs.plates, plate.value)
        })
    }

    if (level.traps) {
        level.traps.forEach(trap => {
            addItem(trap.x, trap.y, traps, [trapImg], 0)
        })
    }

    if (level.teleports) {
        level.teleports.forEach(teleport => {
            addItem(teleport.x, teleport.y, teleports, [teleportImg], 0)
        })
    }

    if (level.holes) {
        level.holes.forEach(hole => {
            addItem(hole.x, hole.y, holes, holesImgs, hole.value)
        })
    }
}

function initialize() {
    preloadTiles();
    preloadCharacters();
    preloadControls();
    preloadPowers();
    preloadDoors();
    preloadPopups();

    resizeCanvas();

    // Check if there's a saved game and show continue button
    if (localStorage.getItem('mazeRTC_gameState')) {
        continueButton.style.display = 'block'
    }

    startButton.addEventListener('click', levelSelectionMode)
    editorButton.addEventListener('click', editMode)
    hostButton.addEventListener('click', hostGame)
    joinButton.addEventListener('click', joinGame)
    joinRoomButton.addEventListener('click', joinRoom)
    startGameButton.addEventListener('click', startGame)

    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('click', onCanvasClick)
    window.addEventListener('keydown', onKeyDown)
    window.updateConnectionStatus = updateConnectionStatus
}

window.addEventListener('load', initialize)

function updateConnectionStatus(status) {
    statusText.textContent = status

    if (status === 'Connected - Ready to play!') {
        if (webrtcClient.isHost) {
            console.log("new pair connected")
            // levelSelectionMode()

        }
    }
}

function startGame() {
    // gameMode()
    levelSelectionMode()
    const gameState = getGameState()
    webrtcClient.sendMessage({
        type: 'gameStateUpdate',
        gameState: gameState
    });
    closeConnectionPanel()
    displayGameArea()
}

function updateGame(gameState) {
    setGameState(gameState)
    setMovementButtons(gameState.movements)
    closeConnectionPanel()
    displayGameArea()
}

function closeConnectionPanel() {
    connectionPanel.style.display = 'none'
    buttonsContainer.style.display = 'none'
}

function selectNextCharacter() {
    for (i = 1; i < 4; i++) {
        let num = (selectedCharacter + i) % MAX_CHARACTERS
        if (characters[num].enabled) {
            selectCharacter(num)
            break
        }
    }
}

function onKeyDown(e) {
    if (mode == MODE_PLAYING) {
        if (e.key !== 'F12' && e.key != 'F5') {
            e.preventDefault()
        }
        switch (e.key.toLowerCase()) {
            case "arrowup":
                // Up pressed
                onCoordsClick(movementButtonsConfig[0].x, movementButtonsConfig[0].y)
                break;
            case "arrowright":
                // Right pressed
                onCoordsClick(movementButtonsConfig[1].x, movementButtonsConfig[1].y)
                break;
            case "arrowdown":
                // Down pressed
                onCoordsClick(movementButtonsConfig[2].x, movementButtonsConfig[2].y)
                break;
            case "arrowleft":
                onCoordsClick(movementButtonsConfig[3].x, movementButtonsConfig[3].y)
                break;
            case "p":
                onCoordsClick(TILE_SIZE * 9, 26)
                break;
            case "1":
                if (characters[0].enabled) { selectCharacter(0) }
                break;
            case "2":
                if (characters[1].enabled) { selectCharacter(1) }
                break;
            case "3":
                if (characters[2].enabled) { selectCharacter(2) }
                break;
            case "4":
                if (characters[3].enabled) { selectCharacter(3) }
                break;
            case "tab":
                selectNextCharacter()
        }
    }
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
        holes: holes.map(hole => ({
            value: hole.value,
            x: hole.x,
            y: hole.y
        })),
        traps: traps.map(trap => ({
            value: trap.value,
            x: trap.x,
            y: trap.y
        })),
        teleports: teleports.map(teleport => ({
            value: teleport.value,
            x: teleport.x,
            y: teleport.y
        })),

        board: board,
        animTime: animTime,
        currentFrame: currentFrame,
        timestamp: Date.now(),
        movements: movements
    }
}

function setCharacterPos(character, x, y) {
    character.x = x
    character.y = y

    character.drawX = x * TILE_SIZE + TILE_OFFSET_X
    character.drawY = y * TILE_SIZE + TILE_OFFSET_Y

    character.drawTargetX = character.drawX
    character.drawTargetY = character.drawY
}

function setGameState(gameState) {
    mode = MODE_PLAYING
    board = gameState.board || board

    traps = []
    holes = []
    teleports = []
    plates = []
    doors = []


    // Restore characters if gameState has character data
    if (gameState.characters && gameState.characters.length > 0) {
        gameState.characters.forEach((charData, index) => {
            if (index < characters.length) {
                characters[index].enabled = charData.enabled
                setCharacterPos(characters[index], charData.x, charData.y)
                characters[index].exitX = charData.exitX
                characters[index].exitY = charData.exitY
                characters[index].currentAnim = charData.currentAnim

                characters[index].exitKeyX = -1
                characters[index].exitKeyY = -1
                characters[index].exitOpen = true

                if ((charData.exitKeyX != null) && (charData.exitKeyX != -1)) {
                    characters[index].exitKeyX = charData.exitKeyX
                    characters[index].exitKeyY = charData.exitKeyY
                    characters[index].exitOpen = false
                }
            }
        })
    }



    if (gameState.doors && gameState.doors.length > 0) {
        gameState.doors.forEach((doorData) => {
            addDoor(doorData.x, doorData.y, doorData.value, doorData.open)
        })
    }



    if (gameState.plates && gameState.plates.length > 0) {
        gameState.plates.forEach((plateData) => {
            addItem(plateData.x, plateData.y, plates, doorsImgs.plates, plateData.value)
        })
    }

    if (gameState.teleports && gameState.teleports.length > 0) {
        gameState.teleports.forEach((teleportData) => {
            addItem(teleportData.x, teleportData.y, teleports, [teleportImg], 0)
        })
    }

    if (gameState.traps && gameState.traps.length > 0) {
        gameState.traps.forEach((trapData) => {
            addItem(trapData.x, trapData.y, traps, [trapImg], 0)
        })
    }

    if (gameState.holes && gameState.holes.length > 0) {
        gameState.holes.forEach((holeData) => {
            addItem(holeData.x, holeData.y, holes, holesImgs, holeData.value)
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
