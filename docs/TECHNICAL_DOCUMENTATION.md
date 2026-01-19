# SnowWorld Narrowcasting System - Technische Documentatie

## Project Overzicht

Dit document beschrijft het technische ontwerp en de implementatie van het narrowcasting systeem voor SnowWorld. Het systeem is ontworpen als een schaalbare, real-time oplossing voor het beheren en weergeven van content op verschillende schermen binnen het skigebied.

## Systeem Architectuur

### Componenten Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                    SnowWorld Narrowcasting System               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Backend   │    │   Database  │    │ WebSocket   │       │
│  │   Server    │◄──►│  (SQLite)   │    │   Server    │       │
│  │  (Node.js)  │    │             │    │             │       │
│  └──────┬──────┘    └─────────────┘    └──────┬──────┘       │
│         │                                       │              │
│         ▼                                       ▼              │
│  ┌────────────────────────────────────────────────────┐        │
│  │              API Endpoints                         │        │
│  └────────────────────────────────────────────────────┘        │
│         │                                       │              │
│         ▼                                       ▼              │
│  ┌─────────────┐                        ┌─────────────┐       │
│  │Admin Dash   │                        │Client Display│       │
│  │(HTML/CSS/JS)│                        │(HTML/CSS/JS) │       │
│  └─────────────┘                        └─────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Server (Node.js/Express)

**Technologieën:**
- Node.js 18+ met Express framework
- Socket.io voor real-time communicatie
- SQLite voor dataopslag
- Multer voor file uploads
- UUID voor unieke identificatie

**Belangrijkste Features:**
- RESTful API endpoints voor content management
- WebSocket support voor real-time updates
- File upload functionaliteit voor media
- Zone-gebaseerde content distributie
- Scheduling systeem voor geplande content

**API Endpoints:**

```javascript
// Content Management
POST   /api/content/upload     - Upload nieuwe content
GET    /api/content           - Haal content op (optioneel gefilterd)
DELETE /api/content/:id       - Verwijder content

// Schedule Management  
POST   /api/schedule          - Maak nieuwe planning
GET    /api/schedule/:zone    - Haal actieve planning op

// Zones
GET    /api/zones             - Haal alle zones op

// Weather Data
GET    /api/weather           - Haal weersinformatie op
```

### Database Schema

**Tabellen:**

```sql
-- Content tabel
CREATE TABLE content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,           -- 'image', 'video', 'livestream'
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    originalName TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    zone TEXT DEFAULT 'all',
    duration INTEGER DEFAULT 10,  -- weergave duur in seconden
    isActive INTEGER DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT
);

-- Schedule tabel
CREATE TABLE schedule (
    id TEXT PRIMARY KEY,
    contentId TEXT NOT NULL,
    zone TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (contentId) REFERENCES content (id) ON DELETE CASCADE
);

-- Zones tabel
CREATE TABLE zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    displayOrder INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1
);

-- Logs tabel
CREATE TABLE logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    timestamp TEXT NOT NULL
);
```

### Admin Dashboard

**Technologieën:**
- Pure HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Geen externe frameworks (lichtgewicht)

**Belangrijkste Functionaliteiten:**
- Content upload met drag-and-drop
- Visuele content management interface
- Schedule planning met datum/tijd selectie
- Real-time updates via WebSocket
- Analytics dashboard met statistieken
- Zone-beheer functionaliteit

**UI Componenten:**
- Content grid met preview thumbnails
- Modal dialogs voor uploads en planning
- Filter en zoek functionaliteit
- Toast notificaties voor feedback
- Responsive design voor verschillende schermformaten

### Client Display

**Technologieën:**
- HTML5, CSS3, JavaScript (ES6+)
- CSS animations voor sneeuw effect
- Font Awesome icons
- WebSocket client

**Belangrijkste Functionaliteiten:**
- Automatische content afspelen
- Zone-specifieke content filtering
- Real-time updates via WebSocket
- Weer widget integratie
- Klok en datum display
- Adaptive layout voor verschillende schermformaten

**Display Features:**
- Content transitions met fade effects
- Error handling en fallback content
- Connection status indicator
- Loading states met animaties
- Keyboard shortcuts voor bediening

## Installatie en Setup

### Vereisten

```bash
# Node.js 18+ vereist
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

### Installatie

```bash
# Clone repository
git clone [repository-url]
cd snowworld-narrowcasting

# Backend dependencies installeren
cd backend
npm install

# Admin dashboard dependencies installeren
cd ../admin
npm install

# Client display (geen dependencies nodig)
cd ../client
# Geen npm install nodig - pure HTML/CSS/JS
```

### Configuratie

**Backend Configuratie (backend/server.js):**
```javascript
const PORT = process.env.PORT || 3000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_FILE_TYPES = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'video': ['video/mp4', 'video/webm', 'video/ogg']
};
```

### Opstarten

```bash
# Backend server starten
cd backend
npm start
# Of voor development:
npm run dev

# Admin dashboard serveren
cd admin
npm start
# Toegankelijk op: http://localhost:8080

# Client display openen
# Open client/index.html in browser
# Of serve via HTTP server voor volledige functionaliteit
```

## Gebruik

### Admin Dashboard

1. **Content Toevoegen:**
   - Klik op "Content Toevoegen" knop
   - Selecteer bestand (afbeelding of video)
   - Vul metadata in (titel, type, zone, duur)
   - Upload bestand

2. **Planning Maken:**
   - Ga naar "Planning" tab
   - Klik op "Planning Toevoegen"
   - Selecteer content en zone
   - Stel start/tijd tijden in
   - Bevestig planning

3. **Zone Beheer:**
   - Bekijk zone overzicht
   - Configureer per zone welke content getoond wordt

### Client Display

1. **Zone Selectie:**
   - Voeg `?zone=ZONE_NAME` toe aan URL
   - Beschikbare zones: reception, restaurant, skislope, lockers, shop

2. **Keyboard Shortcuts:**
   - F5: Content verversen
   - Escape: Zone selector tonen
   - F1: Systeem informatie

## Technische Beslissingen

### 1. Database Keuze: SQLite

**Redenen:**
- Geen separate database server nodig
- Snelle setup voor development
- Voldoende voor kleine tot middelgrote implementaties
- Gemakkelijk te migreren naar PostgreSQL/MySQL indien nodig

**Alternatieven overwogen:**
- PostgreSQL: Uitstekend maar vereist server setup
- MongoDB: Goed voor unstructured data maar overkill voor dit project

### 2. WebSocket vs REST

**Implementatie:** Beide
- REST voor initiele data loading
- WebSocket voor real-time updates
- Fallback naar HTTP polling bij WebSocket falen

**Redenen:**
- Real-time updates essentieel voor narrowcasting
- WebSocket minder resource intensief dan polling
- REST blijft beschikbaar als fallback

### 3. Frontend Technologie

**Keuze:** Pure HTML/CSS/JavaScript zonder frameworks

**Redenen:**
- Lichte footprint - snelle laadtijden
- Geen build process nodig
- Eenvoudig te onderhouden
- Volledige controle over implementatie
- Werkt op elk device met moderne browser

**Alternatieven overwogen:**
- React/Vue/Angular: Uitstekend maar overkill voor dit project
- jQuery: Verouderd, native JavaScript volstaat

### 4. File Storage

**Keuze:** Lokale file system storage

**Redenen:**
- Simpel en betrouwbaar
- Geen externe storage service nodig
- Snelle toegang tot bestanden
- Voldoende voor kleine tot middelgrote implementaties

**Alternatieven overwogen:**
- Cloud storage (AWS S3, etc.): Duur en complex voor dit project
- Database BLOB storage: Niet optimaal voor grote bestanden

## Performance Optimalisaties

### 1. Content Caching
- Client side caching van content metadata
- Browser caching van media bestanden
- Memory caching van actieve content

### 2. Lazy Loading
- Images worden pas geladen wanneer nodig
- Video's starten pas bij display
- Progressieve loading voor grote bestanden

### 3. Connection Optimization
- WebSocket voor real-time updates
- HTTP/2 support via Express
- Gzip compressie ingeschakeld

### 4. Responsive Design
- Adaptive layouts voor verschillende schermformaten
- Optimalisatie voor touch interfaces
- High contrast mode support

## Beveiliging

### 1. File Upload Beveiliging
- File type validatie op basis van MIME type
- Bestandsgrootte limieten
- Filename sanitization
- Upload directory restricties

### 2. Input Validatie
- Alle user input wordt gevalideerd
- SQL injection preventie via parameterized queries
- XSS preventie via output encoding

### 3. CORS Configuratie
- Specifieke origins toegestaan
- Credentials handling correct geconfigureerd

## Schaalbaarheid

### 1. Database Schaalbaarheid
- SQLite geschikt voor kleine tot middelgrote implementaties
- Migratie pad naar PostgreSQL/MySQL aanwezig
- Database indexing op kritieke velden

### 2. File Storage Schaalbaarheid
- Lokale storage geschikt voor < 10GB aan media
- Migratie pad naar cloud storage aanwezig
- CDN integratie mogelijk voor global distribution

### 3. Server Schaalbaarheid
- Node.js cluster mode ondersteund
- Load balancing ready via reverse proxy
- Stateles design voor horizontal scaling

## Monitoring en Logging

### 1. Logging System
- SQLite logs tabel voor applicatie events
- Console logging voor development
- Error tracking en reporting

### 2. Performance Monitoring
- Connection status tracking
- Content loading performance
- Error rate monitoring

### 3. Health Checks
- API endpoints voor health status
- WebSocket connection monitoring
- Content availability checks

## Foutafhandeling

### 1. Graceful Degradation
- Fallback content bij errors
- Offline mode support
- Progressive enhancement

### 2. Error Recovery
- Automatische reconnect bij connection loss
- Content retry mechanisms
- User-friendly error messages

### 3. Data Integrity
- Transaction support voor database operaties
- File upload rollback bij errors
- Consistency checks

## Testing Strategie

### 1. Unit Testing
- Individual component testing
- API endpoint testing
- Database operation testing

### 2. Integration Testing
- End-to-end workflow testing
- WebSocket communication testing
- File upload testing

### 3. Performance Testing
- Load testing voor meerdere clients
- Stress testing voor grote content volumes
- Network failure simulation

## Deployment

### 1. Production Setup
- Reverse proxy (nginx) aanbevolen
- SSL/TLS encryptie verplicht
- Process manager (PM2) voor Node.js

### 2. Environment Configuratie
- Environment variables voor configuratie
- Separate config voor development/production
- Database backup strategie

### 3. Update Strategie
- Rolling updates mogelijk
- Database migrations ondersteund
- Zero-downtime deployment

## Onderhoud

### 1. Regular Maintenance
- Database cleanup (oude logs/content)
- Storage cleanup (onbruikte bestanden)
- Performance monitoring

### 2. Backup Strategie
- Database backups
- Content backups
- Configuration backups

### 3. Update Procedure
- Dependency updates
- Security patches
- Feature updates

## Toekomstige Uitbreidingen

### 1. Geplande Features
- User authentication systeem
- Advanced analytics dashboard
- Content approval workflow
- Multi-language support

### 2. Mogelijke Integraties
- Social media feeds
- Weather API integratie
- Booking system integratie
- Mobile app companion

### 3. Performance Verbeteringen
- Redis caching layer
- CDN integratie
- Database query optimalisatie
- Image/video optimization

## Conclusie

Dit narrowcasting systeem biedt een robuuste, schaalbare oplossing voor SnowWorld's digitale signage behoeften. De architectuur is ontworpen met betrouwbaarheid, performance en gebruiksgemak in het achterhoofd, waardoor het systeem eenvoudig te onderhouden en uit te breiden is voor toekomstige vereisten.

Het systeem maakt gebruik van moderne webtechnologieën en volgt best practices voor security, performance en schaalbaarheid. Met real-time updates, zone-specifieke content distributie en een intuïtieve admin interface, biedt het alle functionaliteit die nodig is voor een professioneel narrowcasting systeem.