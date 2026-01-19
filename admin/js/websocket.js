// WebSocket Management for SnowWorld Admin Dashboard
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.init();
    }

    init() {
        this.connect();
    }

    connect() {
        try {
            this.socket = io('http://localhost:3000', {
                transports: ['websocket', 'polling'],
                timeout: 5000,
                forceNew: true
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleConnectionError();
        }
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus(true);
            
            // Join admin room for global updates
            this.socket.emit('joinZone', 'admin');
            
            this.showToast('Verbonden met server', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this.updateConnectionStatus(false);
            
            // Attempt reconnection
            this.attemptReconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.handleConnectionError();
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
    }

    handleContentUpdate(data) {
        // Clear content cache to force refresh
        if (window.ui) {
            window.ui.clearContentCache();
        }

        // Show notification based on update type
        switch (data.type) {
            case 'content_added':
                this.showToast(`Nieuwe content toegevoegd: ${data.content.title}`, 'info');
                break;
            case 'content_deleted':
                this.showToast('Content verwijderd', 'warning');
                break;
            case 'content_updated':
                this.showToast('Content bijgewerkt', 'info');
                break;
        }

        // Refresh current view if on content tab
        if (window.ui && window.ui.currentTab === 'content') {
            window.ui.loadContent();
        }
    }

    handleScheduleUpdate(data) {
        // Show notification
        this.showToast(`Planning bijgewerkt voor zone: ${data.zone}`, 'info');

        // Refresh schedule view if currently viewing this zone
        const currentZone = document.getElementById('scheduleZoneSelect')?.value;
        if (window.ui && window.ui.currentTab === 'schedule' && currentZone === data.zone) {
            window.ui.loadSchedule();
        }
    }

    handleZoneUpdate(data) {
        // Handle zone-specific updates
        this.showToast(`Zone ${data.zone} bijgewerkt`, 'info');
        
        // Refresh relevant views
        if (window.ui) {
            if (window.ui.currentTab === 'zones') {
                window.ui.loadZonesOverview();
            } else if (window.ui.currentTab === 'content') {
                window.ui.loadContent();
            }
        }
    }

    handleSystemNotification(data) {
        // Handle system-level notifications
        const { message, type, duration } = data;
        this.showToast(message, type || 'info', duration);
    }

    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('connectionText');
        
        if (statusDot) {
            statusDot.className = connected ? 'status-dot' : 'status-dot disconnected';
        }
        
        if (statusText) {
            statusText.textContent = connected ? 'Verbonden' : 'Verbinding verbroken';
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.showToast('Kan geen verbinding maken met de server', 'error');
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

    handleConnectionError() {
        this.isConnected = false;
        this.updateConnectionStatus(false);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.showToast('Verbinding verbroken. Probeert opnieuw...', 'warning');
        } else {
            this.showToast('Kan geen verbinding maken met de server', 'error');
        }
    }

    // Public methods
    joinZone(zone) {
        if (this.isConnected && this.socket) {
            this.socket.emit('joinZone', zone);
            console.log(`Joined zone: ${zone}`);
        }
    }

    leaveZone(zone) {
        if (this.isConnected && this.socket) {
            this.socket.emit('leaveZone', zone);
            console.log(`Left zone: ${zone}`);
        }
    }

    sendMessage(event, data) {
        if (this.isConnected && this.socket) {
            this.socket.emit(event, data);
        } else {
            console.warn('Cannot send message: not connected');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    reconnect() {
        this.disconnect();
        this.reconnectAttempts = 0;
        this.connect();
    }

    // Utility methods
    showToast(message, type = 'info', duration = 5000) {
        if (window.ui) {
            window.ui.showToast(message, type);
        } else {
            // Fallback to browser notification
            console.log(`Toast [${type}]: ${message}`);
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            socketId: this.socket?.id || null
        };
    }
}

// Create global WebSocket instance
window.wsManager = new WebSocketManager();