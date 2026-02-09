// UI Management for SnowWorld Admin Dashboard
class UIManager {
    constructor() {
        this.currentTab = 'content';
        this.contentCache = new Map();
        this.zonesCache = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadZones();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Content upload
        document.getElementById('addContentBtn')?.addEventListener('click', () => {
            this.openContentModal();
        });

        document.getElementById('contentUploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadContent();
        });

        // Schedule management
        document.getElementById('addScheduleBtn')?.addEventListener('click', () => {
            this.openScheduleModal();
        });

        document.getElementById('scheduleForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createSchedule();
        });

        // Filters
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyContentFilters();
        });

        // Modal controls
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        // File input preview
        document.getElementById('contentFile')?.addEventListener('change', (e) => {
            this.previewFile(e.target.files[0]);
        });

        // Content type change - show/hide appropriate fields
        document.getElementById('contentType')?.addEventListener('change', (e) => {
            this.handleContentTypeChange(e.target.value);
        });

        // Zone management
        document.getElementById('addZoneBtn')?.addEventListener('click', () => {
            this.openZoneModal();
        });

        document.getElementById('zoneForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createZone();
        });

        // Icon selector
        document.querySelectorAll('.icon-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const icon = e.currentTarget.dataset.icon;
                this.selectIcon(icon);
            });
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        try {
            switch (tabName) {
                case 'content':
                    await this.loadContent();
                    break;
                case 'schedule':
                    await this.loadSchedule();
                    break;
                case 'zones':
                    await this.loadZonesOverview();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName} data:`, error);
            this.showToast(`Fout bij het laden van ${tabName} data`, 'error');
        }
    }

    // Content Management
    async loadContent(zone = null, type = null) {
        const cacheKey = `${zone || 'all'}-${type || 'all'}`;
        
        if (this.contentCache.has(cacheKey)) {
            this.renderContent(this.contentCache.get(cacheKey));
            return;
        }

        const content = await api.getContent(zone, type);
        this.contentCache.set(cacheKey, content);
        this.renderContent(content);
    }

    renderContent(content) {
        const grid = document.getElementById('contentGrid');
        if (!grid) return;

        if (content.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-photo-video fa-3x"></i>
                    <h3>Geen content gevonden</h3>
                    <p>Begin met het toevoegen van content voor uw narrowcasting systeem.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = content.map(item => this.createContentCard(item)).join('');
        
        // Add event listeners to content cards
        grid.querySelectorAll('.delete-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentId = e.target.dataset.contentId;
                this.deleteContent(contentId);
            });
        });
    }

    createContentCard(item) {
        const typeIcon = {
            'image': 'fa-image',
            'video': 'fa-video',
            'livestream': 'fa-broadcast-tower',
            'text': 'fa-font'
        }[item.type] || 'fa-file';

        const typeLabel = {
            'image': 'Afbeelding',
            'video': 'Video',
            'livestream': 'Livestream',
            'text': 'Tekst'
        }[item.type] || 'Bestand';

        return `
            <div class="content-item" data-content-id="${item.id}">
                <div class="content-preview ${item.type}">
                    ${item.type === 'image' ? 
                        `<img src="${item.url}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Afbeelding'">` :
                        item.type === 'text' ?
                        `<div class="text-preview"><i class="fas ${typeIcon} fa-3x"></i><p>${item.textContent ? item.textContent.substring(0, 50) + '...' : 'Tekst content'}</p></div>` :
                        `<i class="fas ${typeIcon} fa-3x"></i>`
                    }
                </div>
                <div class="content-info">
                    <h3 class="content-title">${item.title}</h3>
                    <div class="content-meta">
                        <span><i class="fas ${typeIcon}"></i> ${typeLabel}</span>
                        <span><i class="fas fa-map-marker-alt"></i> Zone: ${item.zone}</span>
                        <span><i class="fas fa-clock"></i> Duur: ${item.duration}s</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(item.createdAt).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div class="content-actions">
                        <button class="btn btn-danger btn-small delete-content" data-content-id="${item.id}">
                            <i class="fas fa-trash"></i> Verwijderen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Modal Management
    async openContentModal() {
        const modal = document.getElementById('contentModal');
        if (!modal) {
            console.error('Content modal not found');
            return;
        }
        modal.classList.add('active');
        
        // Reset form fields visibility before loading zones
        this.handleContentTypeChange('');
        
        // Load zones into dropdown
        await this.loadZonesSelect('contentZone');
    }

    openScheduleModal() {
        const modal = document.getElementById('scheduleModal');
        modal.classList.add('active');
        this.loadContentSelect();
        this.loadZonesSelect('scheduleZone');
        this.setDefaultScheduleTimes();
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        // Reset forms
        document.getElementById('contentUploadForm')?.reset();
        document.getElementById('scheduleForm')?.reset();
        document.getElementById('zoneForm')?.reset();
        document.getElementById('fileInfo').innerHTML = '';
        
        // Reset text content field
        const textContent = document.getElementById('textContent');
        if (textContent) {
            textContent.value = '';
        }
        
        // Reset form fields visibility
        this.handleContentTypeChange('');
    }

    // Content Upload
    previewFile(file) {
        if (!file) return;

        const fileInfo = document.getElementById('fileInfo');
        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        
        fileInfo.innerHTML = `
            <div class="file-details">
                <strong>Bestand:</strong> ${file.name}<br>
                <strong>Grootte:</strong> ${fileSize} MB<br>
                <strong>Type:</strong> ${file.type}
            </div>
        `;

        // Auto-detect content type
        if (file.type.startsWith('image/')) {
            document.getElementById('contentType').value = 'image';
        } else if (file.type.startsWith('video/')) {
            document.getElementById('contentType').value = 'video';
        }
    }

    handleContentTypeChange(type) {
        const fileUploadGroup = document.getElementById('fileUploadGroup');
        const textContentGroup = document.getElementById('textContentGroup');
        const contentFile = document.getElementById('contentFile');
        const textContent = document.getElementById('textContent');

        if (type === 'text') {
            if (fileUploadGroup) fileUploadGroup.style.display = 'none';
            if (textContentGroup) textContentGroup.style.display = 'block';
            if (contentFile) contentFile.removeAttribute('required');
            if (textContent) textContent.setAttribute('required', 'required');
        } else {
            if (fileUploadGroup) fileUploadGroup.style.display = 'block';
            if (textContentGroup) textContentGroup.style.display = 'none';
            if (contentFile) contentFile.setAttribute('required', 'required');
            if (textContent) textContent.removeAttribute('required');
        }
    }

    async uploadContent() {
        const title = document.getElementById('contentTitle').value;
        const type = document.getElementById('contentType').value;
        const zone = document.getElementById('contentZone').value;
        const duration = document.getElementById('contentDuration').value;

        if (!type) {
            this.showToast('Selecteer een type', 'error');
            return;
        }

        try {
            this.showLoading('Bezig met opslaan...');

            if (type === 'text') {
                // Handle text content
                const textContent = document.getElementById('textContent').value;
                
                if (!textContent.trim()) {
                    this.showToast('Voer tekst in', 'error');
                    this.hideLoading();
                    return;
                }

                const textData = {
                    title: title,
                    textContent: textContent,
                    zone: zone,
                    duration: parseInt(duration)
                };

                const result = await api.createTextContent(textData);
            } else {
                // Handle file upload
                const fileInput = document.getElementById('contentFile');
                
                if (!fileInput.files[0]) {
                    this.showToast('Selecteer een bestand', 'error');
                    this.hideLoading();
                    return;
                }

                const formData = new FormData();
                formData.append('content', fileInput.files[0]);
                formData.append('title', title);
                formData.append('type', type);
                formData.append('zone', zone);
                formData.append('duration', duration);

                const result = await api.uploadContent(formData);
            }
            
            this.closeModals();
            this.clearContentCache();
            await this.loadContent();
            
            this.showToast('Content succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('Opslaan mislukt: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteContent(contentId) {
        if (!confirm('Weet u zeker dat u deze content wilt verwijderen?')) {
            return;
        }

        try {
            this.showLoading('Bezig met verwijderen...');
            await api.deleteContent(contentId);
            
            this.clearContentCache();
            await this.loadContent();
            
            this.showToast('Content succesvol verwijderd', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Verwijderen mislukt: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Schedule Management
    async loadSchedule() {
        const zoneSelect = document.getElementById('scheduleZoneSelect');
        const selectedZone = zoneSelect?.value || 'reception';
        
        try {
            const schedule = await api.getSchedule(selectedZone);
            this.renderSchedule(schedule);
        } catch (error) {
            console.error('Error loading schedule:', error);
            this.showToast('Fout bij het laden van planning', 'error');
        }
    }

    renderSchedule(schedule) {
        const timeline = document.getElementById('scheduleTimeline');
        if (!timeline) return;

        if (schedule.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times fa-3x"></i>
                    <h3>Geen actieve planning</h3>
                    <p>Er is momenteel geen geplande content voor deze zone.</p>
                </div>
            `;
            return;
        }

        timeline.innerHTML = schedule.map(item => `
            <div class="schedule-item">
                <div class="schedule-time">
                    ${new Date(item.startTime).toLocaleTimeString('nl-NL', {hour: '2-digit', minute: '2-digit'})} - 
                    ${new Date(item.endTime).toLocaleTimeString('nl-NL', {hour: '2-digit', minute: '2-digit'})}
                </div>
                <div class="schedule-content">
                    <h4>${item.title}</h4>
                    <p>Type: ${item.type} | Duur: ${item.duration}s</p>
                </div>
            </div>
        `).join('');
    }

    async createSchedule() {
        const formData = {
            contentId: document.getElementById('scheduleContent').value,
            zone: document.getElementById('scheduleZone').value,
            startTime: document.getElementById('scheduleStart').value,
            endTime: document.getElementById('scheduleEnd').value,
            priority: parseInt(document.getElementById('schedulePriority').value)
        };

        try {
            this.showLoading('Bezig met plannen...');
            await api.createSchedule(formData);
            
            this.closeModals();
            await this.loadSchedule();
            
            this.showToast('Planning succesvol aangemaakt!', 'success');
        } catch (error) {
            console.error('Schedule creation error:', error);
            this.showToast('Planning mislukt: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    setDefaultScheduleTimes() {
        const now = new Date();
        const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        document.getElementById('scheduleStart').value = startTime.toISOString().slice(0, 16);
        document.getElementById('scheduleEnd').value = endTime.toISOString().slice(0, 16);
    }

    async createZone() {
        const zoneId = document.getElementById('zoneId').value.trim();
        const zoneName = document.getElementById('zoneName').value.trim();
        const zoneDescription = document.getElementById('zoneDescription').value.trim();
        const zoneDisplayOrder = document.getElementById('zoneDisplayOrder').value;
        const zoneIcon = document.getElementById('zoneIcon').value;

        if (!zoneId || !zoneName) {
            this.showToast('Zone ID en naam zijn verplicht', 'error');
            return;
        }

        // Validate zone ID format (lowercase letters, numbers, hyphens only)
        const validIdPattern = /^[a-z0-9-]+$/;
        if (!validIdPattern.test(zoneId)) {
            this.showToast('Zone ID mag alleen kleine letters, cijfers en streepjes bevatten', 'error');
            return;
        }

        const zoneData = {
            id: zoneId,
            name: zoneName,
            description: zoneDescription,
            icon: zoneIcon,
            displayOrder: parseInt(zoneDisplayOrder) || 0
        };

        try {
            this.showLoading('Bezig met toevoegen...');
            await api.createZone(zoneData);
            
            this.closeModals();
            this.zonesCache = null; // Clear cache
            await this.loadZonesOverview();
            
            this.showToast('Zone succesvol toegevoegd!', 'success');
        } catch (error) {
            console.error('Zone creation error:', error);
            this.showToast('Zone toevoegen mislukt: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Zones Management
    async loadZones() {
        if (this.zonesCache) return this.zonesCache;
        
        try {
            this.zonesCache = await api.getZones();
            return this.zonesCache;
        } catch (error) {
            console.error('Error loading zones:', error);
            return [];
        }
    }

    async loadZonesSelect(selectId) {
        try {
            const zones = await this.loadZones();
            const select = document.getElementById(selectId);
            if (!select) {
                console.error(`Select element with id '${selectId}' not found`);
                return;
            }

            if (!zones || zones.length === 0) {
                console.error('No zones loaded');
                select.innerHTML = '<option value="">Geen zones beschikbaar</option>';
                return;
            }

            select.innerHTML = zones.map(zone => 
                `<option value="${zone.id}">${zone.name}</option>`
            ).join('');
            
            console.log(`Loaded ${zones.length} zones into ${selectId}`);
        } catch (error) {
            console.error('Error in loadZonesSelect:', error);
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Fout bij laden zones</option>';
            }
        }
    }

    async loadContentSelect() {
        try {
            const content = await api.getContent();
            const select = document.getElementById('scheduleContent');
            if (!select) return;

            select.innerHTML = content.map(item => 
                `<option value="${item.id}">${item.title} (${item.type})</option>`
            ).join('');
        } catch (error) {
            console.error('Error loading content select:', error);
        }
    }

    async loadZonesOverview() {
        const zones = await this.loadZones();
        const grid = document.getElementById('zonesGrid');
        if (!grid) return;

        grid.innerHTML = zones.map(zone => `
            <div class="zone-card">
                <div class="zone-icon">
                    <i class="fas ${zone.icon || 'fa-map-marker-alt'} fa-3x"></i>
                </div>
                <h3 class="zone-name">${zone.name}</h3>
                <p class="zone-description">${zone.description}</p>
            </div>
        `).join('');
    }

    selectIcon(iconName) {
        // Update hidden input
        document.getElementById('zoneIcon').value = iconName;
        
        // Update visual selection
        document.querySelectorAll('.icon-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.icon === iconName) {
                option.classList.add('selected');
            }
        });
    }

    openZoneModal() {
        const modal = document.getElementById('zoneModal');
        if (!modal) {
            console.error('Zone modal not found');
            return;
        }
        modal.classList.add('active');
        
        // Reset icon selection to default
        this.selectIcon('fa-map-marker-alt');
    }
    }

    // Analytics
    async loadAnalytics() {
        try {
            const contentStats = await api.getContentStats();
            const scheduleStats = await api.getScheduleStats();
            const zones = await this.loadZones();

            this.renderContentStats(contentStats);
            this.renderScheduleStats(scheduleStats);
            this.renderZoneStats(zones);
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showToast('Fout bij het laden van analytics', 'error');
        }
    }

    renderContentStats(stats) {
        const container = document.getElementById('contentStats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Totaal Content</span>
                <span class="stat-value">${stats.total}</span>
            </div>
            ${Object.entries(stats.byType).map(([type, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('')}
        `;
    }

    renderScheduleStats(stats) {
        const container = document.getElementById('scheduleStats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Totaal Planningen</span>
                <span class="stat-value">${stats.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Actief</span>
                <span class="stat-value">${stats.active}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Aankomend</span>
                <span class="stat-value">${stats.upcoming}</span>
            </div>
        `;
    }

    renderZoneStats(zones) {
        const container = document.getElementById('zoneStats');
        if (!container) return;

        container.innerHTML = zones.map(zone => `
            <div class="stat-item">
                <span class="stat-label">${zone.name}</span>
                <span class="stat-value">${zone.description}</span>
            </div>
        `).join('');
    }

    // Utility Methods
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    showLoading(message = 'Bezig...') {
        const loading = document.createElement('div');
        loading.id = 'globalLoading';
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('globalLoading');
        if (loading) {
            loading.remove();
        }
    }

    clearContentCache() {
        this.contentCache.clear();
    }

    async refreshData() {
        this.clearContentCache();
        await this.loadTabData(this.currentTab);
        this.showToast('Data ververst!', 'success');
    }

    async loadInitialData() {
        try {
            await this.loadZones();
            await this.loadContent();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Fout bij het laden van initiële data', 'error');
        }
    }

    applyContentFilters() {
        const zone = document.getElementById('zoneFilter').value;
        const type = document.getElementById('typeFilter').value;
        this.loadContent(zone || null, type || null);
    }
}

// Create global UI instance
window.ui = new UIManager();

// Global helper functions for onclick handlers
window.closeModal = function() {
    if (window.ui) {
        window.ui.closeModals();
    }
};

window.closeScheduleModal = function() {
    if (window.ui) {
        window.ui.closeModals();
    }
};

window.closeZoneModal = function() {
    if (window.ui) {
        window.ui.closeModals();
    }
};