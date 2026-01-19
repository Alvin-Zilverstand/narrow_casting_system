// API Service for SnowWorld Admin Dashboard
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Content Management
    async getContent(zone = null, type = null) {
        const params = new URLSearchParams();
        if (zone) params.append('zone', zone);
        if (type) params.append('type', type);
        
        return this.request(`/content?${params.toString()}`);
    }

    async uploadContent(formData) {
        return fetch(`${this.baseURL}/content/upload`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            return response.json();
        });
    }

    async deleteContent(contentId) {
        return this.request(`/content/${contentId}`, {
            method: 'DELETE'
        });
    }

    // Schedule Management
    async getSchedule(zone) {
        return this.request(`/schedule/${zone}`);
    }

    async createSchedule(scheduleData) {
        return this.request('/schedule', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });
    }

    // Zones
    async getZones() {
        return this.request('/zones');
    }

    // Weather Data
    async getWeatherData() {
        return this.request('/weather');
    }

    // Analytics
    async getContentStats() {
        try {
            const content = await this.getContent();
            const stats = {
                total: content.length,
                byType: {},
                byZone: {}
            };

            content.forEach(item => {
                // Count by type
                stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
                
                // Count by zone
                stats.byZone[item.zone] = (stats.byZone[item.zone] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting content stats:', error);
            throw error;
        }
    }

    async getScheduleStats() {
        try {
            // This would typically be a dedicated endpoint
            // For now, we'll calculate based on available data
            const zones = await this.getZones();
            let totalSchedules = 0;
            let activeSchedules = 0;

            for (const zone of zones) {
                const schedule = await this.getSchedule(zone.id);
                totalSchedules += schedule.length;
                
                const now = new Date();
                const active = schedule.filter(item => {
                    const start = new Date(item.startTime);
                    const end = new Date(item.endTime);
                    return now >= start && now <= end;
                });
                activeSchedules += active.length;
            }

            return {
                total: totalSchedules,
                active: activeSchedules,
                upcoming: totalSchedules - activeSchedules
            };
        } catch (error) {
            console.error('Error getting schedule stats:', error);
            throw error;
        }
    }
}

// Create global API instance
window.api = new APIService();