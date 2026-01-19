# SnowWorld Narrowcasting System

Een modern narrowcasting systeem voor SnowWorld, ontworpen voor het beheren en weergeven van content op verschillende schermen binnen het skigebied.

## 🎯 Features

- **Real-time Content Updates**: WebSocket-gebaseerde real-time synchronisatie
- **Zone-specifieke Content**: Verschillende content per zone (receptie, restaurant, skibaan, etc.)
- **Content Planning**: Plan content voor specifieke tijden en data
- **Meerdere Content Types**: Ondersteuning voor afbeeldingen, video's en livestreams
- **Weer Widget**: Actuele weersinformatie met winterse styling
- **Responsive Design**: Werkt op alle schermformaten
- **Offline Capable**: Blijft functioneren tijdens verbindingsproblemen

## 🏗️ Systeem Architectuur

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Backend   │    │   Admin     │    │   Client    │
│   Server    │◄──►│  Dashboard  │    │   Display   │
│  (Node.js)  │    │  (Browser)  │    │  (Browser)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 Snelle Start

### Vereisten
- Node.js 18+ 
- npm 8+
- Moderne web browser

### Installatie

```bash
# Clone het project
git clone [repository-url]
cd snowworld-narrowcasting

# Installeer backend dependencies
cd backend
npm install

# Installeer admin dashboard dependencies
cd ../admin
npm install
```

### Opstarten

```bash
# Start de backend server
cd backend
npm start

# Start de admin dashboard (in nieuw terminal venster)
cd admin
npm start

# Open client display in browser
# Open client/index.html of ga naar:
# http://localhost:3000/client/index.html?zone=reception
```

## 📁 Project Structuur

```
snowworld-narrowcasting/
├── backend/                 # Node.js backend server
│   ├── server.js           # Hoofd server bestand
│   ├── database/           # Database management
│   ├── services/           # Business logic
│   └── package.json        # Backend dependencies
├── admin/                  # Admin dashboard
│   ├── index.html          # Hoofd HTML bestand
│   ├── styles.css          # Styling
│   ├── js/                 # JavaScript modules
│   └── package.json        # Admin dependencies
├── client/                 # Client display
│   ├── index.html          # Display HTML
│   ├── styles.css          # Display styling
│   └── js/                 # Display JavaScript
├── database/               # SQLite database bestanden
├── public/uploads/         # Geüploade media bestanden
│   ├── images/            # Afbeeldingen
│   └── videos/            # Video's
└── docs/                   # Documentatie
```

## 🎮 Gebruik

### Admin Dashboard
1. Ga naar `http://localhost:8080`
2. Klik op "Content Toevoegen" om nieuwe media te uploaden
3. Gebruik de "Planning" tab om content te plannen
4. Beheer zones via de "Zones" tab

### Client Display
- Standaard zone: `http://localhost:3000/client/index.html`
- Specifieke zone: `http://localhost:3000/client/index.html?zone=reception`
- Beschikbare zones: reception, restaurant, skislope, lockers, shop

### Keyboard Shortcuts (Client)
- **F5**: Content verversen
- **Escape**: Zone selector tonen
- **F1**: Systeem informatie

## 🔧 Configuratie

### Backend Configuratie
```javascript
// backend/server.js
const PORT = process.env.PORT || 3000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

### Zone Configuratie
```javascript
// Standaard zones beschikbaar:
- reception: Receptie
- restaurant: Restaurant  
- skislope: Skibaan
- lockers: Kluisjes
- shop: Winkel
```

## 🌐 API Endpoints

### Content Management
- `POST /api/content/upload` - Upload content
- `GET /api/content` - Haal content op
- `DELETE /api/content/:id` - Verwijder content

### Schedule Management
- `POST /api/schedule` - Maak planning
- `GET /api/schedule/:zone` - Haal planning op

### Zones
- `GET /api/zones` - Haal zones op

### Weather
- `GET /api/weather` - Haal weersdata op

## 🎨 Styling

Het systeem gebruikt een winterse kleurenschema:
- Primair: #0066cc (blauw)
- Secundair: #e6f3ff (licht blauw)
- Accent: #00a8ff (helder blauw)
- Achtergrond: Gradient van blauw naar paars

## 📱 Responsive Design

- Werkt op schermen van 320px tot 4K displays
- Touch-friendly interface
- Adaptive layouts voor verschillende oriëntaties
- High contrast mode support

## 🔒 Beveiliging

- File type validatie
- Bestandsgrootte limieten
- Input sanitization
- CORS configuratie
- SQL injection preventie

## 🚨 Foutafhandeling

- Graceful degradation bij connection issues
- Fallback content bij errors
- User-friendly error messages
- Automatic retry mechanisms

## 📊 Performance

- Content caching
- Lazy loading voor media
- WebSocket voor real-time updates
- Optimized for low bandwidth

## 🔍 Debugging

### Development Mode
```bash
cd backend
npm run dev  # Met nodemon voor auto-restart
```

### Logging
- Console logging in development
- SQLite logs tabel voor events
- Error tracking en reporting

## 🧪 Testing

```bash
# Unit tests (indien geïmplementeerd)
npm test

# Manual testing endpoints
curl http://localhost:3000/api/zones
curl http://localhost:3000/api/weather
```

## 📦 Deployment

### Production Setup
1. Gebruik PM2 voor Node.js process management
2. Configureer nginx als reverse proxy
3. SSL/TLS certificaten installeren
4. Database backups instellen

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
```

## 🔄 Updates

```bash
# Update dependencies
cd backend && npm update
cd admin && npm update

# Database migrations (indien nodig)
# Zie docs/TECHNICAL_DOCUMENTATION.md
```

## 🆘 Troubleshooting

### Veelvoorkomende Problemen

**Server start niet:**
- Controleer of Node.js geïnstalleerd is
- Controleer poort 3000 beschikbaarheid

**Content wordt niet weergegeven:**
- Controleer zone parameter in URL
- Verifieer content is geüpload via admin
- Check browser console voor errors

**WebSocket connectie faalt:**
- Controleer firewall settings
- Verifieer server draait op poort 3000
- Check CORS configuratie

**File upload errors:**
- Controleer bestandsgrootte (< 50MB)
- Verifieer bestandstype wordt ondersteund
- Check server logs voor details

## 📞 Ondersteuning

Voor technische ondersteuning:
1. Check deze README eerst
2. Raadpleeg `docs/TECHNICAL_DOCUMENTATION.md`
3. Check browser console voor errors
4. Controleer server logs

## 📄 Licentie

Dit project is ontwikkeld voor SnowWorld als onderdeel van een MBO challenge.

---

**❄️ SnowWorld Narrowcasting System - "Waar het altijd sneeuwt, ook in de zomer!" ❄️**