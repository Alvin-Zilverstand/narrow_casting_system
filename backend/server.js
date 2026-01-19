const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');

const DatabaseManager = require('./database/DatabaseManager');
const ContentManager = require('./services/ContentManager');
const ScheduleManager = require('./services/ScheduleManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(__dirname, '../public/uploads/images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(__dirname, '../public/uploads/videos');
    } else {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Initialize managers
const dbManager = new DatabaseManager();
const contentManager = new ContentManager(dbManager);
const scheduleManager = new ScheduleManager(dbManager, io);

// Initialize database
dbManager.initialize();

// API Routes

// Content Management
app.post('/api/content/upload', upload.single('content'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const contentData = {
      id: uuidv4(),
      type: req.body.type,
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.mimetype.startsWith('image/') ? 'images' : 'videos'}/${req.file.filename}`,
      zone: req.body.zone || 'all',
      duration: parseInt(req.body.duration) || 10,
      createdAt: new Date().toISOString()
    };

    const content = await contentManager.addContent(contentData);
    
    // Emit real-time update
    io.emit('contentUpdated', {
      type: 'content_added',
      content: content
    });

    res.json({ success: true, content });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/content', async (req, res) => {
  try {
    const { zone, type } = req.query;
    const content = await contentManager.getContent(zone, type);
    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
});

app.delete('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await contentManager.getContentById(id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete physical file
    await fs.remove(content.path);
    
    // Delete from database
    await contentManager.deleteContent(id);
    
    // Emit real-time update
    io.emit('contentUpdated', {
      type: 'content_deleted',
      contentId: id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Schedule Management
app.post('/api/schedule', async (req, res) => {
  try {
    const scheduleData = {
      id: uuidv4(),
      contentId: req.body.contentId,
      zone: req.body.zone,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      priority: req.body.priority || 1,
      createdAt: new Date().toISOString()
    };

    const schedule = await scheduleManager.addSchedule(scheduleData);
    
    io.emit('scheduleUpdated', {
      type: 'schedule_added',
      schedule: schedule
    });

    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Schedule creation error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

app.get('/api/schedule/:zone', async (req, res) => {
  try {
    const { zone } = req.params;
    const schedule = await scheduleManager.getActiveSchedule(zone);
    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});

app.get('/api/zones', (req, res) => {
  const zones = [
    { id: 'reception', name: 'Receptie', description: 'Hoofdingang en receptie' },
    { id: 'restaurant', name: 'Restaurant', description: 'Eetgelegenheid' },
    { id: 'skislope', name: 'Skibaan', description: 'Hoofdskibaan' },
    { id: 'lockers', name: 'Kluisjes', description: 'Kleedkamers en kluisjes' },
    { id: 'shop', name: 'Winkel', description: 'Ski-uitrusting winkel' },
    { id: 'all', name: 'Alle zones', description: 'Toon op alle schermen' }
  ];
  res.json(zones);
});

// Weather widget data
app.get('/api/weather', (req, res) => {
  // Mock weather data - in real implementation, integrate with weather API
  const weatherData = {
    temperature: -5,
    snowCondition: 'Frisse sneeuw',
    slopeCondition: 'Perfect',
    humidity: 65,
    windSpeed: 8,
    lastUpdated: new Date().toISOString()
  };
  res.json(weatherData);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('joinZone', (zone) => {
    socket.join(zone);
    console.log(`Client ${socket.id} joined zone: ${zone}`);
  });
  
  socket.on('leaveZone', (zone) => {
    socket.leave(zone);
    console.log(`Client ${socket.id} left zone: ${zone}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`SnowWorld Narrowcasting Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});