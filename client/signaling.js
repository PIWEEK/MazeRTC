class SignalingClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.roomId = null;
        this.clientId = null;
        this.onMessage = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.onPeerJoined = null;
        this.onPeerLeft = null;
        this.onOffer = null;
        this.onAnswer = null;
        this.clients = {};
        this.onIceCandidate = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                
                this.ws.onopen = () => {
                    console.log('Connected to signaling server');
                    this.reconnectAttempts = 0;
                    if (this.onConnected) {
                        this.onConnected();
                    }
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
                
                this.ws.onclose = () => {
                    console.log('Disconnected from signaling server');
                    if (this.onDisconnected) {
                        this.onDisconnected();
                    }
                    this.attemptReconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(data) {
        const { type } = data;

        switch (type) {
            case 'joined':
                this.roomId = data.roomId;
                this.clientId = data.clientId;
                this.clients[this.clientId] = {};
                console.log(`Joined room ${this.roomId} as ${this.clientId}`);
                break;
                
            case 'peer-joined':
                console.log(`Peer ${data.clientId} joined the room`);
                this.clients[data.clientId] = {};
                if (this.onPeerJoined) {
                    this.onPeerJoined(data.clientId, data.clients);
                }
                break;
                
            case 'peer-left':
                delete this.clients[data.clientId];
                console.log(`Peer ${data.clientId} left the room`);
                if (this.onPeerLeft) {
                    this.onPeerLeft(data.clientId);
                }
                break;
                
            case 'offer':
                console.log(`Received offer from ${data.fromId}`);
                if (this.onOffer) {
                    this.onOffer(data.fromId, data.payload);
                }
                break;
                
            case 'answer':
                console.log(`Received answer from ${data.fromId}`);
                if (this.onAnswer) {
                    this.onAnswer(data.fromId, data.payload);
                }
                break;
                
            case 'ice-candidate':
                console.log(`Received ICE candidate from ${data.fromId}`);
                if (this.onIceCandidate) {
                    this.onIceCandidate(data.fromId, data.payload);
                }
                break;
                
            case 'error':
                console.error('Signaling error:', data.message);
                break;
                
            default:
                console.log('Unknown message type:', type);
        }
        
        if (this.onMessage) {
            this.onMessage(data);
        }
    }

    joinRoom(roomId, clientId = null) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        this.send({
            type: 'join',
            roomId,
            clientId
        });
    }

    leaveRoom() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }
        
        this.send({
            type: 'leave'
        });
    }

    sendOffer(targetId, offer) {
        this.send({
            type: 'offer',
            roomId: this.roomId,
            targetId,
            payload: offer
        });
    }

    sendAnswer(targetId, answer) {
        this.send({
            type: 'answer',
            roomId: this.roomId,
            targetId,
            payload: answer
        });
    }

    sendIceCandidate(targetId, candidate) {
        this.send({
            type: 'ice-candidate',
            roomId: this.roomId,
            targetId,
            payload: candidate
        });
    }

    send(data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        this.ws.send(JSON.stringify(data));
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect().catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    getClients() {
        return this.clients
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignalingClient;
}
