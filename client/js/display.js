// Display Management for SnowWorld Client
class DisplayManager {
    constructor() {
        this.currentContent = [];
        this.currentIndex = 0;
        this.contentTimer = null;
        this.transitionDuration = 1000; // 1 second
        this.isPlaying = false;
        this.zone = this.getZoneFromURL() || 'reception';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateZoneDisplay();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Handle window focus/blur
        window.addEventListener('blur', () => this.pause());
        window.addEventListener('focus', () => this.resume());

        // Handle errors
        window.addEventListener('error', (e) => {
            console.error('Display error:', e.error);
            this.handleError(e.error);
        });
    }

    getZoneFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('zone');
    }

    updateZoneDisplay() {
        const zoneElement = document.getElementById('currentZone');
        if (zoneElement) {
            zoneElement.textContent = this.getZoneDisplayName(this.zone);
        }
    }

    getZoneDisplayName(zoneId) {
        const zoneNames = {
            'reception': 'Receptie',
            'restaurant': 'Restaurant',
            'skislope': 'Skibaan',
            'lockers': 'Kluisjes',
            'shop': 'Winkel',
            'all': 'Algemeen'
        };
        return zoneNames[zoneId] || zoneId;
    }

    async loadContent(contentList) {
        try {
            console.log('Loading content for zone:', this.zone);
            
            // Filter content for current zone
            this.currentContent = contentList.filter(item => 
                item.zone === this.zone || item.zone === 'all'
            );

            if (this.currentContent.length === 0) {
                this.showPlaceholder();
                return;
            }

            // Sort content by priority and creation date
            this.currentContent.sort((a, b) => {
                const priorityA = a.priority || 0;
                const priorityB = b.priority || 0;
                if (priorityA !== priorityB) return priorityB - priorityA;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            console.log(`Loaded ${this.currentContent.length} content items`);
            
            // Start playback
            this.startPlayback();
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError();
        }
    }

    startPlayback() {
        if (this.currentContent.length === 0) {
            this.showPlaceholder();
            return;
        }

        this.isPlaying = true;
        this.currentIndex = 0;
        
        // Show first content item
        this.showContentItem(this.currentContent[0]);
        
        // Set up automatic progression
        this.scheduleNextContent();
    }

    showContentItem(contentItem) {
        const display = document.getElementById('contentDisplay');
        if (!display) return;

        // Create content element
        const contentElement = this.createContentElement(contentItem);
        
        // Clear previous content with fade out
        this.clearCurrentContent(() => {
            display.appendChild(contentElement);
            
            // Fade in new content
            setTimeout(() => {
                contentElement.classList.add('active');
            }, 50);
        });
    }

    createContentElement(contentItem) {
        const element = document.createElement('div');
        element.className = 'content-item';
        element.dataset.contentId = contentItem.id;

        switch (contentItem.type) {
            case 'image':
                element.innerHTML = `
                    <img src="${contentItem.url}" alt="${contentItem.title}">
                `;
                // Handle image load errors
                element.querySelector('img').onerror = () => {
                    this.handleContentError(contentItem, 'image');
                };
                break;

            case 'video':
                element.innerHTML = `
                    <video autoplay muted loop>
                        <source src="${contentItem.url}" type="${contentItem.mimeType}">
                        Uw browser ondersteunt geen video tags.
                    </video>
                `;
                // Handle video errors
                element.querySelector('video').onerror = () => {
                    this.handleContentError(contentItem, 'video');
                };
                break;

            case 'livestream':
                element.innerHTML = `
                    <div class="content-placeholder">
                        <i class="fas fa-broadcast-tower"></i>
                        <h3>Livestream</h3>
                        <p>${contentItem.title}</p>
                    </div>
                `;
                break;

            default:
                element.innerHTML = `
                    <div class="content-placeholder">
                        <i class="fas fa-file-alt"></i>
                        <h3>${contentItem.title}</h3>
                        <p>Type: ${contentItem.type}</p>
                    </div>
                `;
        }

        return element;
    }

    handleContentError(contentItem, type) {
        console.error(`Error loading ${type}:`, contentItem);
        
        // Replace with error placeholder
        const element = document.querySelector(`[data-content-id="${contentItem.id}"]`);
        if (element) {
            element.innerHTML = `
                <div class="content-placeholder error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Fout bij laden</h3>
                    <p>${type} kon niet worden geladen</p>
                </div>
            `;
        }
    }

    clearCurrentContent(callback) {
        const currentItems = document.querySelectorAll('.content-item');
        let itemsToRemove = currentItems.length;
        
        if (itemsToRemove === 0) {
            if (callback) callback();
            return;
        }

        currentItems.forEach(item => {
            item.classList.remove('active');
            item.classList.add('content-fade-out');
            
            setTimeout(() => {
                item.remove();
                itemsToRemove--;
                
                if (itemsToRemove === 0 && callback) {
                    callback();
                }
            }, this.transitionDuration);
        });
    }

    scheduleNextContent() {
        if (!this.isPlaying) return;

        // Clear existing timer
        if (this.contentTimer) {
            clearTimeout(this.contentTimer);
        }

        const currentItem = this.currentContent[this.currentIndex];
        const duration = (currentItem.duration || 10) * 1000; // Convert to milliseconds

        this.contentTimer = setTimeout(() => {
            this.nextContent();
        }, duration);
    }

    nextContent() {
        if (!this.isPlaying || this.currentContent.length === 0) return;

        // Move to next content item
        this.currentIndex = (this.currentIndex + 1) % this.currentContent.length;
        
        // Show next content
        this.showContentItem(this.currentContent[this.currentIndex]);
        
        // Schedule next content
        this.scheduleNextContent();
    }

    previousContent() {
        if (!this.isPlaying || this.currentContent.length === 0) return;

        // Move to previous content item
        this.currentIndex = (this.currentIndex - 1 + this.currentContent.length) % this.currentContent.length;
        
        // Show previous content
        this.showContentItem(this.currentContent[this.currentIndex]);
        
        // Schedule next content
        this.scheduleNextContent();
    }

    showPlaceholder() {
        const display = document.getElementById('contentDisplay');
        if (!display) return;

        this.clearCurrentContent(() => {
            const placeholder = document.createElement('div');
            placeholder.className = 'content-item active';
            placeholder.innerHTML = `
                <div class="content-placeholder">
                    <i class="fas fa-snowflake"></i>
                    <h3>Welkom bij SnowWorld</h3>
                    <p>Er is momenteel geen content beschikbaar voor deze zone.</p>
                </div>
            `;
            
            display.appendChild(placeholder);
        });
    }

    showError() {
        const display = document.getElementById('contentDisplay');
        if (!display) return;

        this.clearCurrentContent(() => {
            const error = document.createElement('div');
            error.className = 'content-item active';
            error.innerHTML = `
                <div class="content-placeholder error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Fout bij het laden van content</h3>
                    <p>Er is een fout opgetreden. Probeer het opnieuw.</p>
                </div>
            `;
            
            display.appendChild(error);
        });
    }

    pause() {
        this.isPlaying = false;
        if (this.contentTimer) {
            clearTimeout(this.contentTimer);
        }
        console.log('Display paused');
    }

    resume() {
        if (!this.isPlaying && this.currentContent.length > 0) {
            this.isPlaying = true;
            this.scheduleNextContent();
            console.log('Display resumed');
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.contentTimer) {
            clearTimeout(this.contentTimer);
        }
        this.clearCurrentContent();
        console.log('Display stopped');
    }

    updateContent(newContent) {
        console.log('Updating content...');
        
        // Stop current playback
        this.stop();
        
        // Load new content
        this.loadContent(newContent);
    }

    setZone(zone) {
        if (this.zone !== zone) {
            console.log(`Zone changed from ${this.zone} to ${zone}`);
            this.zone = zone;
            this.updateZoneDisplay();
            
            // Request new content for this zone
            if (window.connectionManager) {
                window.connectionManager.requestContentForZone(zone);
            }
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    handleError(error) {
        console.error('Display error:', error);
        this.showError();
        
        // Show error overlay
        const errorOverlay = document.getElementById('errorOverlay');
        if (errorOverlay) {
            document.getElementById('errorMessage').textContent = 
                'Kan geen content laden. Controleer de verbinding.';
            errorOverlay.classList.add('active');
        }
    }

    // Get current status
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            currentZone: this.zone,
            contentCount: this.currentContent.length,
            currentIndex: this.currentIndex,
            currentContent: this.currentContent[this.currentIndex] || null
        };
    }
}

// Create global display manager instance
window.displayManager = new DisplayManager();