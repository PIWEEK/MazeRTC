const WSSPORT = 8090 // FIXME use envvar
const WSHOST = 'localhost' // FIXME use envvar

class WebRTCClient {
    constructor(window) {
        this.window = window
        this.connection = null
        this.connections = {}
        this.dataChannels = {}
        this.dataChannel = null
        this.isHost = false
        this.iceQueue = []
        this.connectionAttempts = 0
        this.maxConnectionAttempts = 3
        this.signalingClient = null
        this.currentRoomId = null
        this.peerId = "default"
        this.peers = []
        this.configuration = {
            iceServers: [
                // Google STUN servers
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:stun.services.mozilla.com' },
                { urls: 'stun:global.stun.twilio.com:3478' },
                { urls: 'stun:stun.stunprotocol.org:3478' }
            ],
            iceCandidatePoolSize: 10
        }
    }

    async initializeSignaling() {
        const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws'
        const signalingServerUrl = `${protocol}://${WSHOST}:${WSSPORT}`
        this.signalingClient = new SignalingClient(signalingServerUrl);

        this.signalingClient.onConnected = () => {
            console.log('Connected to signaling server');
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Connected to signaling server');
            }
        };

        this.signalingClient.onDisconnected = () => {
            console.log('Disconnected from signaling server');
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Disconnected from signaling server');
            }
        };

        this.signalingClient.onPeerJoined = (peerId, peers) => {
            console.log(`Peer ${peerId} joined`);
            this.peerId = peerId;
            this.peers = peers
            // If we're the host, create an offer
            if (this.isHost) {
                this.createOfferForPeer(peerId);
            }
        };

        this.signalingClient.onOffer = async (fromId, offer) => {
            console.log(`Received offer from ${fromId}`);
            this.peerId = fromId;
            const answer = await this.handleOffer(JSON.stringify(offer), fromId);
            this.signalingClient.sendAnswer(fromId, answer);
        };

        this.signalingClient.onAnswer = async (fromId, answer) => {
            console.log(`Received answer from ${fromId}`);
            const connection = this.connections[fromId] || this.connection;
            await this.handleAnswer(JSON.stringify(answer), connection);
        };

        this.signalingClient.onIceCandidate = async (fromId, candidate) => {
            console.log(`Received ICE candidate from ${fromId}`);
            const connection = this.connections[fromId] || this.connection;
            await this.addICECandidate(JSON.stringify(candidate), connection);
        };

        await this.signalingClient.connect();
    }

    async getClients() {
        if (!this.signalingClient) {
            const id = this.peerId || "default";
            return { [id]: {} };
        }

        return this.signalingClient.clients;
    }

    async joinRoom(roomId) {
        if (!this.signalingClient) {
            throw new Error('Signaling client not initialized');
        }

        this.currentRoomId = roomId;
        this.isHost = true // FIXME
        this.signalingClient.joinRoom(roomId);

        if (this.window && this.window.updateConnectionStatus) {
            this.window.updateConnectionStatus(`Joined room ${roomId}`);
        }
    }

    async createOfferForPeer(peerId) {
        try {
            const offer = await this.createOffer(peerId);
            this.signalingClient.sendOffer(peerId, offer);
            return offer;
        } catch (error) {
            console.error('Error creating offer for peer:', error);
            throw error;
        }
    }

    async createOffer(peerId) {
        this.connectionAttempts++
        this.isHost = true

        // // Clean up any existing connection
        // if (this.connection) {
        //     this.connection.close()
        // }

        const connection = new RTCPeerConnection(this.configuration)
        this.connections[peerId] = connection
        
        this.setupPeerConnection(connection)

        // FIXME custom channels
        this.dataChannels[peerId] = this.connections[peerId].createDataChannel('DATA:CHANNEL', { ordered: true })
        this.setupDataChannel(this.dataChannels[peerId])

        try {
            const offer = await this.connections[peerId].createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false
            })
            await this.connections[peerId].setLocalDescription(offer)

            return offer
        } catch (error) {
            console.error('Error creating offer:', error)
            throw error
        }
    }

    async handleOffer(offerString, peerId) {
        this.connectionAttempts++
        this.isHost = false

        // Clean up any existing connection
        // if (this.connection) {
        //     this.connection.close()
        // }

        const connection = new RTCPeerConnection(this.configuration)
        this.connections[peerId] = connection
        this.setupPeerConnection(connection)
        

        connection.ondatachannel = (event) => {
            const dataChannel = event.channel
            this.dataChannels[peerId] = dataChannel
            this.setupDataChannel(dataChannel)
        }

        try {
            const offer = JSON.parse(offerString)
            await connection.setRemoteDescription(offer)

            const answer = await connection.createAnswer()
            await connection.setLocalDescription(answer)

            return answer
        } catch (error) {
            console.error('Error handling offer:', error)
            throw error
        }
    }

    async handleAnswer(answerString, connection) {
        try {
            const answer = JSON.parse(answerString)
            await connection.setRemoteDescription(answer)

            for (const candidate of this.iceQueue) {
                await connection.addIceCandidate(candidate)
            }
            this.iceQueue = []
        } catch (error) {
            console.error('Error handling answer:', error)
            throw error
        }
    }

    async retryConnection() {
        if (this.connectionAttempts < this.maxConnectionAttempts) {
            console.log(`Retrying connection... Attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts}`)
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus(`Retrying connection... Attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts}`)
            }

            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 2000))

            if (this.isHost) {
                return await this.createOffer()
            }
        } else {
            console.log('Max connection attempts reached')
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Connection failed after multiple attempts. Please try again.')
            }
            throw new Error('Max connection attempts reached')
        }
    }

    setupPeerConnection(connection) {
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate)
                // Send ICE candidate to the peer through signaling server
                if (this.signalingClient && this.peerId) {
                    this.signalingClient.sendIceCandidate(this.peerId, event.candidate);
                }
            } else {
                console.log('ICE candidate gathering complete')
            }
        }

        connection.onconnectionstatechange = () => {
            console.log('Connection state:', connection.connectionState)
            const status = connection.connectionState

            let statusMessage = ''
            switch (status) {
                case 'connected':
                    statusMessage = 'Connected - Ready to play!'
                    break
                case 'connecting':
                    statusMessage = 'Connecting...'
                    break
                case 'disconnected':
                    statusMessage = 'Disconnected'
                    break
                case 'failed':
                    statusMessage = 'Connection failed - Please try again'
                    this.handleConnectionFailure()
                    break
                case 'closed':
                    statusMessage = 'Connection closed'
                    break
                default:
                    statusMessage = status
            }

            // Update status in the UI if the function exists
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus(statusMessage)
            }
        }

        connection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', connection.iceConnectionState)
            const iceState = connection.iceConnectionState

            let statusMessage = ''
            switch (iceState) {
                case 'checking':
                    statusMessage = 'Checking connectivity...'
                    break
                case 'connected':
                    statusMessage = 'ICE connected'
                    break
                case 'completed':
                    statusMessage = 'ICE completed'
                    break
                case 'failed':
                    statusMessage = 'ICE failed - Connection cannot be established'
                    break
                case 'disconnected':
                    statusMessage = 'ICE disconnected'
                    break
                case 'closed':
                    statusMessage = 'ICE closed'
                    break
                default:
                    statusMessage = `ICE: ${iceState}`
            }
        }

        connection.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', connection.iceGatheringState)
            if (connection.iceGatheringState === 'gathering') {
                if (this.window && this.window.updateConnectionStatus) {
                    this.window.updateConnectionStatus('Gathering network information...')
                }
            }
            if (connection.iceGatheringState === 'complete') {
                if (this.window && this.window.updateConnectionStatus) {
                    this.window.updateConnectionStatus('Gathering network information completed!')
                }
            }
        }
    }

    setupDataChannel(dataChannel) {
        dataChannel.onopen = () => {
            console.log('Data channel opened')
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Connected - Ready to play!')
            }
        }

        dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data)
            if (message.type === 'gameStateUpdate') {
                console.log('Game state update received:', message.gameState)
                if (this.window && this.window.updateGame) {
                    this.window.updateGame(message.gameState)
                }
                return
            }

            if (message.type === 'runCommand') {
                console.log('Run command received:', message.command, message.args)
                if (this.window && this.window.runCommand) {
                    this.window.runCommand(message.command, message.args)
                }
                return
            }
        }

        dataChannel.onerror = (error) => {
            console.error('Data channel error:', error)
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Data channel error')
            }
        }

        dataChannel.onclose = () => {
            console.log('Data channel closed')
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Disconnected')
            }
        }
    }

    async addICECandidate(candidateString, connection) {
        const candidate = JSON.parse(candidateString)

        if (connection.remoteDescription) {
            await connection.addIceCandidate(candidate)
        } else {
            this.iceQueue.push(candidate)
        }
    }

    sendMessage(message) {
        console.log('Sending message:', this.dataChannels)
        for (const dataChannel in this.dataChannels) {
            if (this.dataChannels[dataChannel] && this.dataChannels[dataChannel].readyState === 'open') {
                this.dataChannels[dataChannel].send(JSON.stringify(message))
                console.log(`Message sent on data channel ${dataChannel}:`, message)
            } else {
                console.warn(`Data channel ${dataChannel} not ready, message not sent:`, message)
            }
        }
    }

    disconnect() {
        for (const dataChannel in this.dataChannels) {
            if (this.dataChannels[dataChannel]) {
                this.dataChannels[dataChannel].close()
            }
        }
    
        for (const connectionId in this.connections) {
            if (this.connections[connectionId]) {
                this.connections[connectionId].close()
            }
        }
        console.log('Disconnected')
    }

    handleConnectionFailure() {
        console.log('Connection failed, attempting retry...')
        if (this.connectionAttempts < this.maxConnectionAttempts) {
            setTimeout(() => {
                this.retryConnection().catch(error => {
                    console.error('Retry failed:', error)
                    if (this.window && this.window.updateConnectionStatus) {
                        this.window.updateConnectionStatus('All connection attempts failed. Please try again.')
                    }
                })
            }, 3000)
        } else {
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Connection failed after multiple attempts. Please try again.')
            }
        }
    }
}
