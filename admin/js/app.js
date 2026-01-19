// Main Application File for SnowWorld Admin Dashboard

// Application configuration
const AppConfig = {
    API_BASE_URL: 'http://localhost:3000/api',
    WS_URL: 'http://localhost:3000',
    REFRESH_INTERVAL: 30000, // 30 seconds
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_FILE_TYPES: {
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video': ['video/mp4', 'video/webm', 'video/ogg']
    }
};

// Main Application Class
class SnowWorldAdminApp {
    constructor() {
        this.config = AppConfig;
        this.isInitialized = false;
        this.refreshTimer = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing SnowWorld Admin Dashboard...');
            
            // Wait for dependencies to load
            await this.waitForDependencies();
            
            // Initialize application components
            this.setupGlobalErrorHandling();
            this.setupKeyboardShortcuts();
            this.setupAutoRefresh();
            
            // Initialize UI and WebSocket connections
            if (window.ui) {
                console.log('UI Manager loaded successfully');
            }
            
            if (window.wsManager) {
                console.log('WebSocket Manager loaded successfully');
            }
            
            if (window.api) {
                console.log('API Service loaded successfully');
            }
            
            this.isInitialized = true;
            console.log('SnowWorld Admin Dashboard initialized successfully');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    async waitForDependencies() {
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let elapsedTime = 0;

        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (window.ui && window.wsManager && window.api) {
                    resolve();
                } else if (elapsedTime >= maxWaitTime) {
                    reject(new Error('Dependencies timeout - required services not loaded'));
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
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R: Refresh data
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }
            
            // Ctrl/Cmd + N: New content (if on content tab)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (window.ui && window.ui.currentTab === 'content') {
                    window.ui.openContentModal();
                }
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                window.ui?.closeModals();
            }
            
            // F5: Refresh (prevent default and use our refresh)
            if (e.key === 'F5') {
                e.preventDefault();
                this.refreshData();
            }
        });
    }

    setupAutoRefresh() {
        // Clear any existing timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // Set up new timer
        this.refreshTimer = setInterval(() => {
            this.autoRefresh();
        }, this.config.REFRESH_INTERVAL);
        
        console.log(`Auto-refresh enabled with interval: ${this.config.REFRESH_INTERVAL}ms`);
    }

    autoRefresh() {
        // Only refresh if connected and not in modal
        if (window.wsManager?.getConnectionStatus().connected && 
            !document.querySelector('.modal.active')) {
            
            console.log('Performing auto-refresh...');
            
            // Refresh current tab data
            if (window.ui) {
                window.ui.refreshData();
            }
        }
    }

    refreshData() {
        if (window.ui) {
            window.ui.refreshData();
        }
        
        if (window.wsManager) {
            const status = window.wsManager.getConnectionStatus();
            console.log('Connection status:', status);
        }
    }

    showWelcomeMessage() {
        const messages = [
            'Welkom bij SnowWorld Narrowcasting Admin!',
            'Systeem succesvol geladen.',
            'Klaar om content te beheren.'
        ];
        
        messages.forEach((message, index) => {
            setTimeout(() => {
                window.ui?.showToast(message, 'info');
            }, index * 1000);
        });
    }

    handleError(error) {
        console.error('Application error:', error);
        
        // Show user-friendly error message
        const userMessage = this.getUserFriendlyErrorMessage(error);
        window.ui?.showToast(userMessage, 'error');
        
        // Log to server if connected
        if (window.wsManager?.getConnectionStatus().connected) {
            window.wsManager.sendMessage('clientError', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        }
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Create emergency error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'emergency-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>❄️ SnowWorld Admin Dashboard</h2>
                <h3>Startfout</h3>
                <p>Er is een fout opgetreden bij het laden van het systeem.</p>
                <details>
                    <summary>Technische details</summary>
                    <pre>${error.message}\n${error.stack}</pre>
                </details>
                <button onclick="location.reload()" class="btn btn-primary">Opnieuw Proberen</button>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
        
        // Add emergency styles
        const style = document.createElement('style');
        style.textContent = `
            .emergency-error {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .error-content {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 600px;
                text-align: center;
            }
            .error-content h2 {
                color: #0066cc;
                margin-bottom: 1rem;
            }
            .error-content h3 {
                color: #dc3545;
                margin-bottom: 1rem;
            }
            .error-content details {
                margin: 1rem 0;
                text-align: left;
            }
            .error-content pre {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 5px;
                overflow-x: auto;
                font-size: 0.8rem;
            }
        `;
        document.head.appendChild(style);
    }

    getUserFriendlyErrorMessage(error) {
        // Map common errors to user-friendly messages
        const errorMap = {
            'NetworkError': 'Netwerkfout - controleer uw internetverbinding',
            'TypeError: Failed to fetch': 'Kan geen verbinding maken met de server',
            'HTTP error! status: 404': 'Gevraagde gegevens niet gevonden',
            'HTTP error! status: 500': 'Serverfout - probeer het later opnieuw',
            'timeout': 'Time-out - het verzoek duurde te lang',
            'upload': 'Upload mislukt - controleer het bestand',
            'delete': 'Verwijderen mislukt - probeer het opnieuw'
        };

        const errorMessage = error.message || error.toString();
        
        for (const [key, message] of Object.entries(errorMap)) {
            if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
                return message;
            }
        }

        return 'Er is een fout opgetreden - probeer het opnieuw';
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    validateFile(file) {
        if (!file) return { valid: false, error: 'Geen bestand geselecteerd' };
        
        if (file.size > this.config.MAX_FILE_SIZE) {
            return { 
                valid: false, 
                error: `Bestand te groot (max ${this.formatFileSize(this.config.MAX_FILE_SIZE)})` 
            };
        }
        
        const fileType = file.type;
        let isValidType = false;
        
        for (const types of Object.values(this.config.SUPPORTED_FILE_TYPES)) {
            if (types.includes(fileType)) {
                isValidType = true;
                break;
            }
        }
        
        if (!isValidType) {
            return { 
                valid: false, 
                error: 'Niet-ondersteund bestandstype' 
            };
        }
        
        return { valid: true };
    }

    // Cleanup
    destroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        if (window.wsManager) {
            window.wsManager.disconnect();
        }
        
        this.isInitialized = false;
        console.log('SnowWorld Admin Dashboard destroyed');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    window.snowWorldApp = new SnowWorldAdminApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.snowWorldApp) {
        window.snowWorldApp.destroy();
    }
});

// Global utility functions
window.SnowWorldUtils = {
    formatFileSize: (bytes) => window.snowWorldApp?.formatFileSize(bytes) || '0 Bytes',
    formatDuration: (seconds) => window.snowWorldApp?.formatDuration(seconds) || '0s',
    validateFile: (file) => window.snowWorldApp?.validateFile(file) || { valid: false, error: 'App not initialized' }
};