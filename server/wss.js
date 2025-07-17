const WebSocket = require('ws')
const debug = require('debug')(`${process.env.APPNAME}:wss`)

let wss
const rooms = new Map()
const clients = new Map()

function init(port) {
    wss = new WebSocket.Server({ port })
    wss.on('connection', (ws) => {
        console.log('New client connected')

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message)
                handleMessage(ws, data)
            } catch (error) {
                console.log('Error parsing message:', error)
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
            }
        })
        
        ws.on('close', () => {
            console.log('Client disconnected')
            handleDisconnect(ws)
        })
        
        ws.on('error', (error) => {
            console.log('WebSocket error:', error)
            handleDisconnect(ws)
        })
    })

    console.log(`WebSocket server listening on port ${port}`)
}

function handleMessage(ws, data) {
    const { type, roomId, clientId, targetId, payload } = data
    console.log("Received message:", data)
    
    switch (type) {
        case 'join':
            handleJoin(ws, roomId, clientId)
            break

        case 'join-room':
            handleJoinRoom(ws, roomId, clientId)
            break

        case 'create-room':
            handleCreateRoom(ws, roomId, clientId)
            break
            
        case 'prepare-connection':
            handlePrepareConnection(ws, roomId, clientId)
            break

        case 'offer':
            handleSignaling(ws, 'offer', roomId, targetId, payload)
            break
            
        case 'answer':
            handleSignaling(ws, 'answer', roomId, targetId, payload)
            break
            
        case 'ice-candidate':
            handleSignaling(ws, 'ice-candidate', roomId, targetId, payload)
            break
            
        case 'leave':
            handleLeave(ws)
            break
            
        default:
            console.log('Unknown message type:', type)
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }))
    }
}

function handleJoin(ws, roomId, clientId) {
    if (!roomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room ID is required' }))
        return
    }

    if (!clientId) {
        clientId = generateClientId()
    }

    handleDisconnect(ws)

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
    }

    const room = rooms.get(roomId)
    // FIXME clients per room
    const clientInfo = { roomId, id: clientId, ws }
    clients.set(ws, clientInfo)

    ws.send(JSON.stringify({
        type: 'joined',
        roomId,
        clientId,
    }))

    console.log(`Client ${clientId} joined room ${roomId}`)
}

function handlePrepareConnection(ws, roomId, clientId) {
    clients.forEach((client) => {
        if (client.roomId === roomId && client.id === clientId) {
            client.ws.send(JSON.stringify({
                type: 'connection-prepared',
                roomId,
                clientId
            }))
        }
    })
}

function handleCreateRoom(ws, roomId, clientId) {
    if (!roomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room ID is required' }))
        return
    }

    if (rooms.has(roomId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room already exists' }))
        return
    }

    rooms.set(roomId, new Set())
    const clientInfo = { roomId, id: clientId, ws }
    clients.set(ws, clientInfo)

    ws.send(JSON.stringify({
        type: 'joined-room',
        roomId,
        clientId,
    }))
}

function handleJoinRoom(ws, roomId, clientId) {
    if (!roomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room ID is required' }))
        return
    }
    if (!clientId) {
        clientId = generateClientId()
    }

    if (!rooms.has(roomId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }))
        return
    }

    const clientInfo = { roomId, id: clientId, ws }
    clients.set(ws, clientInfo)
    broadcastMessage({type: 'joined-room', roomId, clientId})
}

function broadcastMessage(message) {
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message))
        }
    })
    console.log(`Broadcasted message: ${JSON.stringify(message)}`)
}


function handleSignaling(ws, type, roomId, targetId, payload) {
    if (!roomId || !targetId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room ID and target ID are required' }))
        return
    }
    
    const clientInfo = clients.get(ws)
    console.log("@@@ clients", clients)
    if (!clientInfo || clientInfo.roomId !== roomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not in the specified room' }))
        return
    }
    
    const room = rooms.get(roomId)
    if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
    }

    let targetClient = null
    clients.forEach((client) => {
        if (client.roomId === roomId && client.id === targetId) {
            targetClient = client
        }
    })

    if (!targetClient) {
        ws.send(JSON.stringify({ type: 'error', message: 'Target client not found' }))
        return
    }

    targetClient.ws.send(JSON.stringify({
        type,
        fromId: clientInfo.id,
        payload
    }))
    
    debug(`Forwarded ${type} from ${clientInfo.id} to ${targetId} in room ${roomId}`)
}


function handleLeave(ws) {
    handleDisconnect(ws)
}

function handleDisconnect(ws) {
    const clientInfo = clients.get(ws)
    if (!clientInfo) {
        return
    }

    const { roomId, id } = clientInfo
    const room = rooms.get(roomId)
    
    if (room) {
        room.delete(clientInfo)
        
        if (room.size === 0) {
            rooms.delete(roomId)
            console.log(`Room ${roomId} deleted (empty)`)
        }
    }
    
    clients.delete(ws)
    console.log(`Client ${id} left room ${roomId}`)
}

function generateClientId() {
    return Math.random().toString(36).substr(2, 9)
}

module.exports = {
    init,
    getRooms: () => rooms,
    getClients: () => clients
}
