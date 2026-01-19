// Connection Management for SnowWorld Client
class ConnectionManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        this.lastPingTime = null;
        this.serverUrl = 'http://localhost:3000';
        this.zone = this.getZoneFromURL() || 'reception';
        this.contentUpdateInterval = null;
        this.lastContentUpdate = null;
        this.init();
    }

    init() {
        this.connect();
        this.setupHeartbeat();
    }

    connect() {
        try {
            console.log('Connecting to server...');
            this.updateConnectionStatus('connecting');

            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 5000,
                forceNew: true,
                reconnection: false // We handle reconnection manually
            });

            this.setupEventListeners();
            
        } catch (error) {
            console.error('Connection error:', error);
            this.handleConnectionError(error);
        }
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('connected');
            
            // Join zone-specific room
            this.joinZone(this.zone);
            
            // Request initial content
            this.requestContentForZone(this.zone);
            
            // Hide error overlay if shown
            this.hideErrorOverlay();
            
            console.log(`Joined zone: ${this.zone}`);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            
            // Attempt reconnection
            this.attemptReconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.handleConnectionError(error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Reconnection failed');
            this.handleConnectionError(new Error('Reconnection failed'));
        });

        // Content updates
        this.socket.on('contentUpdated', (data) => {
            console.log('Content update received:', data);
            this.handleContentUpdate(data);
        });

        // Schedule updates
        this.socket.on('scheduleUpdated', (data) => {
            console.log('Schedule update received:', data);
            this.handleScheduleUpdate(data);
        });

        // Zone-specific updates
        this.socket.on('zoneUpdate', (data) => {
            console.log('Zone update received:', data);
            this.handleZoneUpdate(data);
        });

        // System notifications
        this.socket.on('systemNotification', (data) => {
            console.log('System notification:', data);
            this.handleSystemNotification(data);
        });

        // Ping/pong for latency monitoring
        this.socket.on('pong', (data) => {
            if (this.lastPingTime) {
                const latency = Date.now() - this.lastPingTime;
                console.log(`Latency: ${latency}ms`);
                this.updateLatencyDisplay(latency);
            }
        });
    }

    joinZone(zone) {
        if (this.isConnected && this.socket) {
            this.socket.emit('joinZone', zone);
            console.log(`Requested to join zone: ${zone}`);
        }
    }

    leaveZone(zone) {
        if (this.isConnected && this.socket) {
            this.socket.emit('leaveZone', zone);
            console.log(`Requested to leave zone: ${zone}`);
        }
    }

    requestContentForZone(zone) {
        console.log(`Requesting content for zone: ${zone}`);
        
        // Use HTTP API as fallback if WebSocket is not available
        if (this.isConnected) {
            // Request via WebSocket
            this.socket.emit('requestContent', { zone: zone });
        } else {
            // Fallback to HTTP
            this.fetchContentViaHTTP(zone);
        }
    }

    async fetchContentViaHTTP(zone) {
        try {
            const response = await fetch(`http://localhost:3000/api/schedule/${zone}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.json();
            this.handleContentUpdate({
                type: 'zone_content',
                zone: zone,
                content: content
            });
            
        } catch (error) {
            console.error('HTTP content fetch error:', error);
            this.handleContentError(error);
        }
    }

    handleContentUpdate(data) {
        if (data.type === 'zone_content' && data.zone === this.zone) {
            console.log(`Updating content for zone ${this.zone}:`, data.content);
            
            if (window.displayManager) {
                window.displayManager.updateContent(data.content);
            }
            
            this.lastContentUpdate = new Date().toISOString();
        } else if (data.type === 'content_added' || data.type === 'content_deleted') {
            // Refresh content for current zone
            this.requestContentForZone(this.zone);
        }
    }

    handleScheduleUpdate(data) {
        if (data.zone === this.zone) {
            console.log(`Schedule updated for zone ${this.zone}`);
            
            // Refresh content for current zone
            this.requestContentForZone(this.zone);
        }
    }

    handleZoneUpdate(data) {
        if (data.zone === this.zone) {
            console.log(`Zone ${this.zone} updated`);
            
            // Refresh content for current zone
            this.requestContentForZone(this.zone);
        }
    }

    handleSystemNotification(data) {
        const { message, type } = data;
        
        // Show notification on display
        if (window.displayManager) {
            // Could implement a notification overlay in the display manager
            console.log(`System notification: ${message} (${type})`);
        }
    }

    handleConnectionError(error) {
        console.error('Connection error:', error);
        this.isConnected = false;
        this.updateConnectionStatus('error');
        
        // Show error overlay
        this.showErrorOverlay('Verbindingsfout', 'Kan geen verbinding maken met de server');
        
        // Attempt reconnection
        this.attemptReconnect();
    }

    handleContentError(error) {
        console.error('Content error:', error);
        
        if (window.displayManager) {
            window.displayManager.handleError(error);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.showErrorOverlay(
                'Verbinding verbroken', 
                'Kan geen verbinding maken. Controleer de server en netwerk.'
            );
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }

    setupHeartbeat() {
        // Send ping every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            this.sendPing();
        }, 30000);
        
        // Initial ping
        this.sendPing();
    }

    sendPing() {
        if (this.isConnected && this.socket) {
            this.lastPingTime = Date.now();
            this.socket.emit('ping');
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');

        switch (status) {
            case 'connected':
                statusDot.className = 'status-dot';
                statusText.textContent = 'Verbonden';
                break;
            case 'connecting':
                statusDot.className = 'status-dot connecting';
                statusText.textContent = 'Verbinden...';
                break;
            case 'disconnected':
                statusDot.className = 'status-dot disconnected';
                statusText.textContent = 'Verbroken';
                break;
            case 'error':
                statusDot.className = 'status-dot disconnected';
                statusText.textContent = 'Fout';
                break;
        }
    }

    updateLatencyDisplay(latency) {
        // Could add latency display to UI if needed
        console.log(`Connection latency: ${latency}ms`);
        
        // Show warning if latency is high
        if (latency > 1000) {
            console.warn('High latency detected:', latency + 'ms');
        }
    }

    showErrorOverlay(title, message) {
        const overlay = document.getElementById('errorOverlay');
        if (!overlay) return;

        document.getElementById('errorMessage').textContent = message;
        overlay.classList.add('active');

        // Add retry button functionality
        const retryButton = document.getElementById('retryButton');
        if (retryButton) {
            retryButton.onclick = () => {
                this.hideErrorOverlay();
                this.reconnect();
            };
        }
    }

    hideErrorOverlay() {
        const overlay = document.getElementById('errorOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    getZoneFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('zone');
    }

    setZone(zone) {
        if (this.zone !== zone) {
            console.log(`Zone changed from ${this.zone} to ${zone}`);
            
            // Leave current zone
            this.leaveZone(this.zone);
            
            // Update zone
            this.zone = zone;
            
            // Join new zone
            this.joinZone(zone);
            
            // Request content for new zone
            this.requestContentForZone(zone);
            
            // Update display
            if (window.displayManager) {
                window.displayManager.setZone(zone);
            }
        }
    }

    reconnect() {
        console.log('Manually reconnecting...');
        this.disconnect();
        this.reconnectAttempts = 0;
        this.connect();
    }

    disconnect() {
        console.log('Disconnecting from server...');
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.socket) {
            this.socket.disconnect();
        }
        
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            zone: this.zone,
            reconnectAttempts: this.reconnectAttempts,
            lastContentUpdate: this.lastContentUpdate,
            socketId: this.socket?.id || null
        };
    }
}

// Create global connection manager instance
window.connectionManager = new ConnectionManager();