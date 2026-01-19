const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/snowworld.db');
    this.db = null;
  }

  initialize() {
    // Ensure database directory exists
    const fs = require('fs-extra');
    fs.ensureDirSync(path.dirname(this.dbPath));
    
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return;
      }
      console.log('Connected to SQLite database');
      this.createTables();
    });
  }

  createTables() {
    const contentTable = `
      CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        path TEXT NOT NULL,
        url TEXT NOT NULL,
        zone TEXT DEFAULT 'all',
        duration INTEGER DEFAULT 10,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      )
    `;

    const scheduleTable = `
      CREATE TABLE IF NOT EXISTS schedule (
        id TEXT PRIMARY KEY,
        contentId TEXT NOT NULL,
        zone TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (contentId) REFERENCES content (id) ON DELETE CASCADE
      )
    `;

    const zonesTable = `
      CREATE TABLE IF NOT EXISTS zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        displayOrder INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1
      )
    `;

    const logsTable = `
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        timestamp TEXT NOT NULL
      )
    `;

    this.db.serialize(() => {
      this.db.run(contentTable);
      this.db.run(scheduleTable);
      this.db.run(zonesTable);
      this.db.run(logsTable);
      
      // Insert default zones
      const defaultZones = [
        { id: 'reception', name: 'Receptie', description: 'Hoofdingang en receptie', displayOrder: 1 },
        { id: 'restaurant', name: 'Restaurant', description: 'Eetgelegenheid', displayOrder: 2 },
        { id: 'skislope', name: 'Skibaan', description: 'Hoofdskibaan', displayOrder: 3 },
        { id: 'lockers', name: 'Kluisjes', description: 'Kleedkamers en kluisjes', displayOrder: 4 },
        { id: 'shop', name: 'Winkel', description: 'Ski-uitrusting winkel', displayOrder: 5 },
        { id: 'all', name: 'Alle zones', description: 'Toon op alle schermen', displayOrder: 0 }
      ];

      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO zones (id, name, description, displayOrder) 
        VALUES (?, ?, ?, ?)
      `);

      defaultZones.forEach(zone => {
        stmt.run(zone.id, zone.name, zone.description, zone.displayOrder);
      });

      stmt.finalize();
      
      console.log('Database tables created successfully');
    });
  }

  // Content methods
  async addContent(contentData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO content (id, type, title, filename, originalName, mimeType, size, path, url, zone, duration, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        contentData.id,
        contentData.type,
        contentData.title,
        contentData.filename,
        contentData.originalName,
        contentData.mimeType,
        contentData.size,
        contentData.path,
        contentData.url,
        contentData.zone,
        contentData.duration,
        contentData.createdAt,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(contentData);
          }
        }
      );

      stmt.finalize();
    });
  }

  async getContent(zone = null, type = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM content WHERE isActive = 1';
      const params = [];

      if (zone && zone !== 'all') {
        query += ' AND (zone = ? OR zone = "all")';
        params.push(zone);
      }

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      query += ' ORDER BY createdAt DESC';

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getContentById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM content WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async deleteContent(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM content WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Schedule methods
  async addSchedule(scheduleData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO schedule (id, contentId, zone, startTime, endTime, priority, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        scheduleData.id,
        scheduleData.contentId,
        scheduleData.zone,
        scheduleData.startTime,
        scheduleData.endTime,
        scheduleData.priority,
        scheduleData.createdAt,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(scheduleData);
          }
        }
      );

      stmt.finalize();
    });
  }

  async getActiveSchedule(zone) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = `
        SELECT s.*, c.* FROM schedule s
        JOIN content c ON s.contentId = c.id
        WHERE s.zone = ? 
        AND s.startTime <= ? 
        AND s.endTime >= ? 
        AND s.isActive = 1 
        AND c.isActive = 1
        ORDER BY s.priority DESC, s.createdAt ASC
      `;

      this.db.all(query, [zone, now, now], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getZones() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM zones WHERE isActive = 1 ORDER BY displayOrder', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Logging
  async addLog(type, message, data = null) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO logs (id, type, message, data, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `);

      const logData = {
        id: require('uuid').v4(),
        type,
        message,
        data: data ? JSON.stringify(data) : null,
        timestamp: new Date().toISOString()
      };

      stmt.run(
        logData.id,
        logData.type,
        logData.message,
        logData.data,
        logData.timestamp,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(logData);
          }
        }
      );

      stmt.finalize();
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = DatabaseManager;