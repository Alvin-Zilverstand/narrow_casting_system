// Weather Widget Management for SnowWorld Client
class WeatherManager {
    constructor() {
        this.weatherData = null;
        this.updateInterval = null;
        this.lastUpdate = null;
        this.updateFrequency = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        this.loadWeatherData();
        this.startAutoUpdate();
        this.updateTimeDisplay();
        this.startTimeUpdate();
    }

    async loadWeatherData() {
        try {
            // Try to get weather data from server
            const response = await fetch('http://localhost:3000/api/weather');
            if (response.ok) {
                this.weatherData = await response.json();
                this.lastUpdate = new Date().toISOString();
                this.updateWeatherDisplay();
                console.log('Weather data loaded:', this.weatherData);
            } else {
                throw new Error('Failed to fetch weather data');
            }
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.useFallbackWeatherData();
        }
    }

    useFallbackWeatherData() {
        // Fallback to mock weather data
        this.weatherData = {
            temperature: -5,
            snowCondition: 'Frisse sneeuw',
            slopeCondition: 'Perfect',
            humidity: 65,
            windSpeed: 8,
            lastUpdated: new Date().toISOString()
        };
        
        this.lastUpdate = new Date().toISOString();
        this.updateWeatherDisplay();
        console.log('Using fallback weather data');
    }

    updateWeatherDisplay() {
        if (!this.weatherData) return;

        const elements = {
            temperature: document.getElementById('temperature'),
            snowCondition: document.getElementById('snowCondition'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed')
        };

        // Update temperature
        if (elements.temperature) {
            elements.temperature.textContent = this.weatherData.temperature;
        }

        // Update snow condition
        if (elements.snowCondition) {
            elements.snowCondition.textContent = this.weatherData.snowCondition;
        }

        // Update humidity
        if (elements.humidity) {
            elements.humidity.textContent = `${this.weatherData.humidity}%`;
        }

        // Update wind speed
        if (elements.windSpeed) {
            elements.windSpeed.textContent = this.weatherData.windSpeed;
        }

        // Update weather condition icon
        this.updateWeatherIcon();
    }

    updateWeatherIcon() {
        const condition = this.weatherData.snowCondition.toLowerCase();
        const iconElement = document.querySelector('.weather-condition i');
        
        if (!iconElement) return;

        let iconClass = 'fa-snowflake';
        
        if (condition.includes('fris')) {
            iconClass = 'fa-snowflake';
        } else if (condition.includes('poeder')) {
            iconClass = 'fa-skiing';
        } else if (condition.includes('nat')) {
            iconClass = 'fa-tint';
        } else if (condition.includes('ijzig')) {
            iconClass = 'fa-icicles';
        } else if (condition.includes('storm')) {
            iconClass = 'fa-wind';
        }

        iconElement.className = `fas ${iconClass}`;
    }

    updateTimeDisplay() {
        const now = new Date();
        
        // Update time
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Update date
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    startTimeUpdate() {
        // Update time every second
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }

    startAutoUpdate() {
        // Update weather every 5 minutes
        this.updateInterval = setInterval(() => {
            this.loadWeatherData();
        }, this.updateFrequency);
        
        console.log(`Weather auto-update started with frequency: ${this.updateFrequency}ms`);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Weather auto-update stopped');
        }
    }

    // Simulate weather changes for demo purposes
    simulateWeatherChange() {
        const conditions = [
            { temperature: -8, snowCondition: 'Poedersneeuw', humidity: 45, windSpeed: 12 },
            { temperature: -3, snowCondition: 'Natte sneeuw', humidity: 85, windSpeed: 6 },
            { temperature: -12, snowCondition: 'IJzige sneeuw', humidity: 35, windSpeed: 15 },
            { temperature: -1, snowCondition: 'Koude regen', humidity: 90, windSpeed: 8 },
            { temperature: -6, snowCondition: 'Frisse sneeuw', humidity: 65, windSpeed: 8 }
        ];

        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        this.weatherData = {
            ...this.weatherData,
            ...randomCondition,
            lastUpdated: new Date().toISOString()
        };
        
        this.updateWeatherDisplay();
        console.log('Weather simulation updated:', this.weatherData);
    }

    // Get weather-based background gradient
    getWeatherBackground() {
        if (!this.weatherData) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

        const temp = this.weatherData.temperature;
        const condition = this.weatherData.snowCondition.toLowerCase();

        // Temperature-based gradients
        if (temp <= -10) {
            return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'; // Very cold - dark blue
        } else if (temp <= -5) {
            return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'; // Cold - light blue
        } else if (temp <= 0) {
            return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Near freezing - purple
        } else {
            return 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'; // Above freezing - light
        }
    }

    // Update display background based on weather
    updateBackground() {
        const background = this.getWeatherBackground();
        document.body.style.background = background;
        
        // Also update the display container if it exists
        const displayContainer = document.querySelector('.display-container');
        if (displayContainer) {
            displayContainer.style.background = background;
        }
    }

    // Get current weather data
    getCurrentWeather() {
        return {
            ...this.weatherData,
            lastUpdate: this.lastUpdate
        };
    }

    // Get weather summary for display
    getWeatherSummary() {
        if (!this.weatherData) return 'Geen weersdata beschikbaar';
        
        return `${this.weatherData.temperature}°C, ${this.weatherData.snowCondition}`;
    }

    // Check if weather data is stale
    isWeatherDataStale() {
        if (!this.lastUpdate) return true;
        
        const lastUpdate = new Date(this.lastUpdate);
        const now = new Date();
        const staleThreshold = 10 * 60 * 1000; // 10 minutes
        
        return (now - lastUpdate) > staleThreshold;
    }

    // Force weather update
    async refreshWeather() {
        console.log('Force refreshing weather data...');
        await this.loadWeatherData();
    }

    // Set custom weather data (for testing/demo)
    setWeatherData(data) {
        this.weatherData = {
            ...this.weatherData,
            ...data,
            lastUpdated: new Date().toISOString()
        };
        
        this.lastUpdate = new Date().toISOString();
        this.updateWeatherDisplay();
        this.updateBackground();
        
        console.log('Custom weather data set:', this.weatherData);
    }

    // Get weather icon for condition
    getWeatherIcon(condition) {
        const conditionLower = condition.toLowerCase();
        
        if (conditionLower.includes('fris')) return 'fa-snowflake';
        if (conditionLower.includes('poeder')) return 'fa-skiing';
        if (conditionLower.includes('nat')) return 'fa-tint';
        if (conditionLower.includes('ijzig')) return 'fa-icicles';
        if (conditionLower.includes('storm')) return 'fa-wind';
        if (conditionLower.includes('koud')) return 'fa-temperature-low';
        
        return 'fa-snowflake';
    }

    // Get temperature color based on value
    getTemperatureColor(temp) {
        if (temp <= -10) return '#1e3c72'; // Very cold - dark blue
        if (temp <= -5) return '#4facfe'; // Cold - blue
        if (temp <= 0) return '#667eea'; // Near freezing - purple
        if (temp <= 5) return '#89f7fe'; // Cold - light blue
        return '#66a6ff'; // Cool - light
    }

    // Cleanup
    destroy() {
        this.stopAutoUpdate();
        console.log('Weather manager destroyed');
    }
}

// Create global weather manager instance
window.weatherManager = new WeatherManager();