const WebSocket = require('ws')
const debug = require('debug')(`${process.env.APPNAME}:wss`)

let wss
const rooms = new Map()
const clients = new Map()

function init(port) {
    wss = new WebSocket.Server({ port })
    wss.on('connection', (ws) => {
        debug('New client connected')

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message)
                handleMessage(ws, data)
            } catch (error) {
                debug('Error parsing message:', error)
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
            }
        })
        
        ws.on('close', () => {
            debug('Client disconnected')
            handleDisconnect(ws)
        })
        
        ws.on('error', (error) => {
            debug('WebSocket error:', error)
            handleDisconnect(ws)
        })
    })

    debug(`WebSocket server listening on port ${port}`)
}

function handleMessage(ws, data) {
    const { type, roomId, targetId, payload } = data
    
    switch (type) {
        case 'join':
            handleJoin(ws, roomId, data.clientId)
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
            debug('Unknown message type:', type)
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
    const clientInfo = { roomId, id: clientId, ws }

    room.add(clientInfo)
    clients.set(ws, clientInfo)

    const clientsInfo = Array.from(room).map(client => ({
        id: client.id,
        isYou: client.ws === ws
    }))

    ws.send(JSON.stringify({
        type: 'joined',
        roomId,
        clientId,
        clientsInfo
    }))

    broadcastToRoom(roomId, {
        type: 'peer-joined',
        clientId,
        clientsInfo
    }, ws)
    
    debug(`Client ${clientId} joined room ${roomId}. Room size: ${room.size}`)
}

function handleSignaling(ws, type, roomId, targetId, payload) {
    if (!roomId || !targetId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room ID and target ID are required' }))
        return
    }
    
    const clientInfo = clients.get(ws)
    if (!clientInfo || clientInfo.roomId !== roomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not in the specified room' }))
        return
    }
    
    const room = rooms.get(roomId)
    if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
    }
    
    const targetClient = Array.from(room).find(client => client.id === targetId)
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
        
        broadcastToRoom(roomId, {
            type: 'peer-left',
            clientId: id
        }, ws)
        
        if (room.size === 0) {
            rooms.delete(roomId)
            debug(`Room ${roomId} deleted (empty)`)
        }
    }
    
    clients.delete(ws)
    debug(`Client ${id} left room ${roomId}`)
}

function broadcastToRoom(roomId, message, excludeWs = null) {
    const room = rooms.get(roomId)
    if (!room) {
        return
    }
    
    room.forEach(client => {
        if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message))
        }
    })
}

function generateClientId() {
    return Math.random().toString(36).substr(2, 9)
}

module.exports = {
    init,
    getRooms: () => rooms,
    getClients: () => clients
}
