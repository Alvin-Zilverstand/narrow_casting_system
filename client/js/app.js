// Main Application File for SnowWorld Client Display

// Application configuration
const AppConfig = {
    SERVER_URL: 'http://localhost:3000',
    API_BASE_URL: 'http://localhost:3000/api',
    DEFAULT_ZONE: 'reception',
    REFRESH_INTERVAL: 60000, // 1 minute
    ERROR_RETRY_DELAY: 5000, // 5 seconds
    MAX_ERROR_RETRIES: 3,
    LOADING_TIMEOUT: 10000, // 10 seconds
    WEATHER_UPDATE_INTERVAL: 300000, // 5 minutes
    TIME_UPDATE_INTERVAL: 1000, // 1 second
    CONTENT_PRELOAD_TIME: 2000, // 2 seconds before content expires
    SNOW_ANIMATION_COUNT: 8
};

// Main Application Class
class SnowWorldClientApp {
    constructor() {
        this.config = AppConfig;
        this.isInitialized = false;
        this.zone = this.getZoneFromURL() || this.config.DEFAULT_ZONE;
        this.errorCount = 0;
        this.loadingTimeout = null;
        this.init();
    }

    async init() {
        try {
            console.log('🎿 Initializing SnowWorld Client Display...');
            console.log(`📍 Zone: ${this.zone}`);
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Initialize components
            this.setupGlobalErrorHandling();
            this.setupKeyboardShortcuts();
            this.setupEventListeners();
            
            // Initialize managers
            await this.initializeManagers();
            
            // Start application
            this.startApplication();
            
            this.isInitialized = true;
            console.log('✅ SnowWorld Client Display initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    async waitForDependencies() {
        const maxWaitTime = 15000; // 15 seconds
        const checkInterval = 200; // 200ms
        let elapsedTime = 0;

        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                const required = [
                    window.displayManager,
                    window.connectionManager,
                    window.weatherManager
                ];
                
                if (required.every(dep => dep)) {
                    resolve();
                } else if (elapsedTime >= maxWaitTime) {
                    const missing = required.filter(dep => !dep).map((_, i) => 
                        ['displayManager', 'connectionManager', 'weatherManager'][i]
                    );
                    reject(new Error(`Dependencies timeout - missing: ${missing.join(', ')}`));
                } else {
                    elapsedTime += checkInterval;
                    setTimeout(checkDependencies, checkInterval);
                }
            };
            
            checkDependencies();
        });
    }

    setupGlobalErrorHandling() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });

        // Handle network errors
        window.addEventListener('offline', () => {
            console.warn('Network offline detected');
            this.handleNetworkError('offline');
        });

        window.addEventListener('online', () => {
            console.log('Network online detected');
            this.handleNetworkError('online');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for F keys to avoid browser interference
            if (e.key.startsWith('F')) {
                e.preventDefault();
            }
            
            switch (e.key) {
                case 'F1':
                    // Show help/info
                    this.showSystemInfo();
                    break;
                    
                case 'F5':
                    // Refresh content
                    e.preventDefault();
                    this.refreshContent();
                    break;
                    
                case 'F11':
                    // Toggle fullscreen (handled by browser)
                    break;
                    
                case 'Escape':
                    // Exit fullscreen or show zone selector
                    e.preventDefault();
                    this.showZoneSelector();
                    break;
                    
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.refreshContent();
                    }
                    break;
                    
                case 'z':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.showZoneSelector();
                    }
                    break;
            }
        });
    }

    setupEventListeners() {
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Tab hidden - pausing updates');
                this.pauseUpdates();
            } else {
                console.log('📱 Tab visible - resuming updates');
                this.resumeUpdates();
            }
        });

        // Handle window focus/blur for better performance
        window.addEventListener('blur', () => {
            console.log('🪟 Window blurred - reducing update frequency');
            this.reduceUpdateFrequency();
        });

        window.addEventListener('focus', () => {
            console.log('🪟 Window focused - restoring update frequency');
            this.restoreUpdateFrequency();
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Handle resize for responsive adjustments
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    async initializeManagers() {
        console.log('🔧 Initializing managers...');
        
        // Set up inter-manager communication
        if (window.connectionManager) {
            window.connectionManager.zone = this.zone;
        }
        
        if (window.displayManager) {
            window.displayManager.zone = this.zone;
            window.displayManager.updateZoneDisplay();
        }
        
        console.log('✅ Managers initialized');
    }

    startApplication() {
        console.log('🚀 Starting application...');
        
        // Hide loading screen after a short delay
        this.loadingTimeout = setTimeout(() => {
            this.hideLoadingScreen();
        }, 2000);
        
        // Request initial content
        this.requestInitialContent();
        
        // Start periodic refresh
        this.startPeriodicRefresh();
        
        console.log('🎯 Application started successfully');
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            loadingScreen.style.display = 'flex';
            
            // Simulate loading progress
            this.simulateLoadingProgress();
        }
    }

    hideLoadingScreen() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    simulateLoadingProgress() {
        const progressBar = document.querySelector('.loading-progress');
        if (!progressBar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
        
        // Complete progress when ready
        setTimeout(() => {
            clearInterval(interval);
            progressBar.style.width = '100%';
        }, 1500);
    }

    requestInitialContent() {
        console.log(`📺 Requesting initial content for zone: ${this.zone}`);
        
        if (window.connectionManager) {
            window.connectionManager.requestContentForZone(this.zone);
        } else {
            // Fallback: show placeholder
            if (window.displayManager) {
                window.displayManager.showPlaceholder();
            }
        }
    }

    startPeriodicRefresh() {
        // Refresh content every minute
        setInterval(() => {
            this.refreshContent();
        }, this.config.REFRESH_INTERVAL);
        
        console.log(`🔄 Periodic refresh started with interval: ${this.config.REFRESH_INTERVAL}ms`);
    }

    refreshContent() {
        console.log('🔄 Refreshing content...');
        
        if (window.connectionManager) {
            window.connectionManager.requestContentForZone(this.zone);
        }
    }

    showSystemInfo() {
        const status = {
            zone: this.zone,
            connection: window.connectionManager?.getStatus() || 'Not available',
            display: window.displayManager?.getStatus() || 'Not available',
            weather: window.weatherManager?.getCurrentWeather() || 'Not available',
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 System Info:', status);
        
        // Could implement a visual system info overlay
        alert(`SnowWorld Display System Info:\n\n` +
              `Zone: ${status.zone}\n` +
              `Connection: ${status.connection.connected ? 'Connected' : 'Disconnected'}\n` +
              `Display: ${status.display.isPlaying ? 'Playing' : 'Stopped'}\n` +
              `Weather: ${window.weatherManager?.getWeatherSummary() || 'N/A'}\n` +
              `Time: ${new Date().toLocaleString('nl-NL')}`);
    }

    showZoneSelector() {
        const modal = document.getElementById('zoneModal');
        if (modal) {
            this.populateZoneSelector();
            modal.classList.add('active');
        }
    }

    populateZoneSelector() {
        const optionsContainer = document.getElementById('zoneOptions');
        if (!optionsContainer) return;

        const zones = [
            { id: 'reception', name: 'Receptie', description: 'Hoofdingang en receptie', icon: 'fa-door-open' },
            { id: 'restaurant', name: 'Restaurant', description: 'Eetgelegenheid', icon: 'fa-utensils' },
            { id: 'skislope', name: 'Skibaan', description: 'Hoofdskibaan', icon: 'fa-skiing' },
            { id: 'lockers', name: 'Kluisjes', description: 'Kleedkamers en kluisjes', icon: 'fa-locker' },
            { id: 'shop', name: 'Winkel', description: 'Ski-uitrusting winkel', icon: 'fa-shopping-bag' }
        ];

        optionsContainer.innerHTML = zones.map(zone => `
            <div class="zone-option" data-zone="${zone.id}">
                <div class="zone-option-icon">
                    <i class="fas ${zone.icon}"></i>
                </div>
                <div class="zone-option-name">${zone.name}</div>
                <div class="zone-option-description">${zone.description}</div>
            </div>
        `).join('');

        // Add click handlers
        optionsContainer.querySelectorAll('.zone-option').forEach(option => {
            option.addEventListener('click', () => {
                const selectedZone = option.dataset.zone;
                this.changeZone(selectedZone);
                this.hideZoneSelector();
            });
        });
    }

    hideZoneSelector() {
        const modal = document.getElementById('zoneModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    changeZone(newZone) {
        if (this.zone !== newZone) {
            console.log(`🔄 Changing zone from ${this.zone} to ${newZone}`);
            
            this.zone = newZone;
            
            // Update URL parameter
            const url = new URL(window.location);
            url.searchParams.set('zone', newZone);
            window.history.replaceState({}, '', url);
            
            // Update managers
            if (window.connectionManager) {
                window.connectionManager.setZone(newZone);
            }
            
            if (window.displayManager) {
                window.displayManager.setZone(newZone);
            }
            
            console.log(`✅ Zone changed to: ${newZone}`);
        }
    }

    getZoneFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('zone');
    }

    pauseUpdates() {
        if (window.displayManager) {
            window.displayManager.pause();
        }
    }

    resumeUpdates() {
        if (window.displayManager) {
            window.displayManager.resume();
        }
    }

    reduceUpdateFrequency() {
        // Reduce update frequency when window is not focused
        // This is handled automatically by the display manager pause/resume
    }

    restoreUpdateFrequency() {
        // Restore normal update frequency when window is focused
        // This is handled automatically by the display manager pause/resume
    }

    handleResize() {
        // Handle window resize events
        console.log('📐 Window resized');
        
        // Could implement responsive adjustments here
        // For now, the CSS handles responsive design
    }

    handleNetworkError(type) {
        switch (type) {
            case 'offline':
                console.warn('🌐 Network offline');
                if (window.displayManager) {
                    window.displayManager.showError();
                }
                break;
                
            case 'online':
                console.log('🌐 Network online');
                this.refreshContent();
                break;
        }
    }

    handleError(error) {
        console.error('❌ Application error:', error);
        this.errorCount++;
        
        if (this.errorCount >= this.config.MAX_ERROR_RETRIES) {
            console.error('Max error retries reached');
            this.showErrorOverlay('Systeemfout', 'Te veel fouten opgetreden. Herlaad de pagina.');
            return;
        }
        
        // Show user-friendly error message
        const userMessage = this.getUserFriendlyErrorMessage(error);
        console.warn('User message:', userMessage);
        
        // Retry after delay
        setTimeout(() => {
            this.refreshContent();
        }, this.config.ERROR_RETRY_DELAY);
    }

    handleInitializationError(error) {
        console.error('💥 Initialization error:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'initialization-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <div class="error-icon">❄️</div>
                <h2>SnowWorld Display</h2>
                <h3>Startfout</h3>
                <p>Het systeem kon niet worden geladen.</p>
                <details>
                    <summary>Technische details</summary>
                    <pre>${error.message}</pre>
                </details>
                <button onclick="location.reload()" class="retry-button">
                    <i class="fas fa-redo"></i> Opnieuw proberen
                </button>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .initialization-error {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .error-content {
                text-align: center;
                max-width: 500px;
                padding: 2rem;
            }
            .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            .error-content h2 {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .error-content h3 {
                color: #ffc107;
                margin-bottom: 1rem;
            }
            .error-content details {
                margin: 1rem 0;
                text-align: left;
                background: rgba(0,0,0,0.2);
                padding: 1rem;
                border-radius: 8px;
            }
            .error-content pre {
                font-size: 0.9rem;
                overflow-x: auto;
            }
            .retry-button {
                background: #0066cc;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 1rem;
            }
            .retry-button:hover {
                background: #0052a3;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    showErrorOverlay(title, message) {
        const overlay = document.getElementById('errorOverlay');
        if (overlay) {
            document.querySelector('#errorOverlay h3').textContent = title;
            document.getElementById('errorMessage').textContent = message;
            overlay.classList.add('active');
        }
    }

    getUserFriendlyErrorMessage(error) {
        const errorMap = {
            'NetworkError': 'Netwerkfout - controleer verbinding',
            'Failed to fetch': 'Kan geen verbinding maken met server',
            'timeout': 'Time-out - probeer opnieuw',
            '404': 'Content niet gevonden',
            '500': 'Serverfout - probeer later opnieuw'
        };

        const errorMessage = error.message || error.toString();
        
        for (const [key, message] of Object.entries(errorMap)) {
            if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
                return message;
            }
        }

        return 'Er is een fout opgetreden';
    }

    cleanup() {
        console.log('🧹 Cleaning up application...');
        
        if (window.weatherManager) {
            window.weatherManager.destroy();
        }
        
        if (window.connectionManager) {
            window.connectionManager.disconnect();
        }
        
        if (window.displayManager) {
            window.displayManager.stop();
        }
        
        this.isInitialized = false;
        console.log('✅ Application cleaned up');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing SnowWorld Client...');
    window.snowWorldClient = new SnowWorldClientApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.snowWorldClient) {
        window.snowWorldClient.cleanup();
    }
});

// Global utility functions
window.SnowWorldClientUtils = {
    changeZone: (zone) => window.snowWorldClient?.changeZone(zone),
    refreshContent: () => window.snowWorldClient?.refreshContent(),
    showSystemInfo: () => window.snowWorldClient?.showSystemInfo(),
    getStatus: () => ({
        zone: window.snowWorldClient?.zone,
        initialized: window.snowWorldClient?.isInitialized,
        connection: window.connectionManager?.getStatus(),
        display: window.displayManager?.getStatus(),
        weather: window.weatherManager?.getCurrentWeather()
    })
};