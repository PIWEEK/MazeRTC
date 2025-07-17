const WSSPORT = 8090 // FIXME use envvar
const WSHOST =  'localhost' // FIXME use envvar

class WebRTCClient {
    constructor(window) {
        this.window = window
        this.connection = null
        this.dataChannel = null
        this.isHost = false
        this.iceQueue = []
        this.connectionAttempts = 0
        this.maxConnectionAttempts = 3
        this.signalingClient = null
        this.currentRoomId = null
        this.clientId = "default"
        this.roomId = null
        this.configuration = {}
    }

    init(isHost, roomId = null, clientId = null) {
        this.isHost = isHost || false
        this.clientId = clientId || "default"
        this.roomId = roomId || "default"
    }

    async initializeSignaling(host) {
        const protocol = window.location.protocol.includes('https') ? 'wss': 'ws'
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

        this.signalingClient.onPeerJoined = (clientId) => {
            console.log(`Peer ${clientId} joined`);
            this.clientId = clientId;
        };

        this.signalingClient.onOffer = async (fromId, offer) => {
            console.log(`Received offer from ${fromId}`);
            const answer = await this.handleOffer(JSON.stringify(offer));
            this.signalingClient.sendAnswer("host", this.roomId, answer);
        };

        this.signalingClient.onAnswer = async (fromId, answer) => {
            console.log(`Received answer from ${fromId}`);
            await this.handleAnswer(JSON.stringify(answer));
        };

        this.signalingClient.onIceCandidate = async (fromId, candidate) => {
            console.log(`Received ICE candidate from ${fromId}`);
            await this.addICECandidate(JSON.stringify(candidate));
        };

        await this.signalingClient.connect();

        if (host && this.clientId != "host") {
            console.log('@@@@ create offer for peer', {roomID: this.roomId, client: this.clientId})
            host.createOfferForPeer(this.roomId, this.clientId);
        }
    }

    // async joinRoom(roomId, isHost = false) {
    //     if (!this.signalingClient) {
    //         throw new Error('Signaling client not initialized');
    //     }

    //     this.currentRoomId = roomId;
    //     this.isHost = isHost
    //     this.signalingClient.joinRoom(roomId);
    // }

    async createOfferForPeer(roomId, clientId) {
        try {
            const offer = await this.createOffer();
            this.signalingClient.sendOffer(clientId, roomId, offer);
            return offer;
        } catch (error) {
            console.error('Error creating offer for peer:', error);
            throw error;
        }
    }

    async createOffer() {
        this.connectionAttempts++
        this.isHost = true

        // Clean up any existing connection
        if (this.connection) {
            this.connection.close()
        }

        this.connection = new RTCPeerConnection(this.configuration)
        this.setupPeerConnection()

        this.dataChannel = this.connection.createDataChannel(`data:channel:${this.roomId}:${this.clientId}`, { ordered: true })
        this.setupDataChannel()

        try {
            const offer = await this.connection.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false
            })
            await this.connection.setLocalDescription(offer)
            return offer
        } catch (error) {
            console.error('Error creating offer:', error)
            throw error
        }
    }

    async handleOffer(offerString) {
        console.log('@@@ Handling offer:', offerString)
        this.connectionAttempts++
        this.isHost = false

        // Clean up any existing connection
        if (this.connection) {
            this.connection.close()
        }

        this.connection = new RTCPeerConnection(this.configuration)
        this.setupPeerConnection()

        this.connection.ondatachannel = (event) => {
            this.dataChannel = event.channel
            this.setupDataChannel()
        }

        try {
            const offer = JSON.parse(offerString)
            await this.connection.setRemoteDescription(offer)

            const answer = await this.connection.createAnswer()
            await this.connection.setLocalDescription(answer)

            return answer
        } catch (error) {
            console.error('Error handling offer:', error)
            throw error
        }
    }

    async handleAnswer(answerString) {
        console.log('@@@ Handling answer:', answerString)
        try {
            const answer = JSON.parse(answerString)
            await this.connection.setRemoteDescription(answer)

            for (const candidate of this.iceQueue) {
                await this.connection.addIceCandidate(candidate)
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

    setupPeerConnection() {
        this.connection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate)
                // Send ICE candidate to the peer through signaling server
                if (this.signalingClient && this.clientId) {
                    this.signalingClient.sendIceCandidate(this.clientId, this.roomId, event.candidate);
                }
            } else {
                console.log('ICE candidate gathering complete')
            }
        }

        this.connection.onconnectionstatechange = () => {
            console.log('Connection state:', this.connection.connectionState)
            const status = this.connection.connectionState

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

        this.connection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.connection.iceConnectionState)
            const iceState = this.connection.iceConnectionState

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

        this.connection.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', this.connection.iceGatheringState)
            if (this.connection.iceGatheringState === 'gathering') {
                if (this.window && this.window.updateConnectionStatus) {
                    this.window.updateConnectionStatus('Gathering network information...')
                }
            }
            if (this.connection.iceGatheringState === 'complete') {
                if (this.window && this.window.updateConnectionStatus) {
                    this.window.updateConnectionStatus('Gathering network information completed!')
                }
            }
        }
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel opened')
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Connected - Ready to play!')
            }
        }

        this.dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data)
            if (message.type === 'gameStateUpdate') {
                console.log('Game state update received:', message.gameState)
                if (this.window && this.window.updateGame) {
                    this.window.updateGame(message.gameState)
                }
                return
            }

            if (message.type === 'updateCharacter') {
                console.log('Character update received:', message.position)
                if (this.window && this.window.updateCharacter) {
                    this.window.updateCharacter(message.character, message.position, message.enabled, message.currentAnim)
                }
                return
            }
        }

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error)
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Data channel error')
            }
        }

        this.dataChannel.onclose = () => {
            console.log('Data channel closed')
            if (this.window && this.window.updateConnectionStatus) {
                this.window.updateConnectionStatus('Disconnected')
            }
        }
    }

    async addICECandidate(candidateString) {
        const candidate = JSON.parse(candidateString)

        if (this.connection.remoteDescription) {
            await this.connection.addIceCandidate(candidate)
        } else {
            this.iceQueue.push(candidate)
        }
    }

    sendMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message))
        } else {
            console.warn('Data channel not ready, message not sent:', message)
        }
    }

    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close()
        }
        if (this.connection) {
            this.connection.close()
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
