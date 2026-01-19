class ScheduleManager {
  constructor(databaseManager, socketIO) {
    this.db = databaseManager;
    this.io = socketIO;
    this.activeSchedules = new Map();
  }

  async addSchedule(scheduleData) {
    try {
      // Validate content exists
      const content = await this.db.getContentById(scheduleData.contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Validate time range
      const startTime = new Date(scheduleData.startTime);
      const endTime = new Date(scheduleData.endTime);
      
      if (startTime >= endTime) {
        throw new Error('End time must be after start time');
      }

      if (startTime < new Date()) {
        throw new Error('Start time cannot be in the past');
      }

      // Check for overlapping schedules with higher priority
      const overlapping = await this.checkOverlappingSchedules(
        scheduleData.zone, 
        scheduleData.startTime, 
        scheduleData.endTime,
        scheduleData.priority
      );

      if (overlapping.length > 0) {
        console.warn('Schedule overlaps with higher priority content:', overlapping);
      }

      const schedule = await this.db.addSchedule(scheduleData);
      await this.db.addLog('schedule', 'Schedule created', { 
        scheduleId: schedule.id, 
        zone: schedule.zone,
        contentId: schedule.contentId 
      });

      // Update active schedules cache
      this.updateActiveSchedules(scheduleData.zone);

      return schedule;
    } catch (error) {
      console.error('Error adding schedule:', error);
      throw error;
    }
  }

  async checkOverlappingSchedules(zone, startTime, endTime, priority) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, c.title, c.type FROM schedule s
        JOIN content c ON s.contentId = c.id
        WHERE s.zone = ? 
        AND s.startTime < ? 
        AND s.endTime > ? 
        AND s.priority > ?
        AND s.isActive = 1
      `;

      this.db.db.all(query, [zone, endTime, startTime, priority], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getActiveSchedule(zone) {
    try {
      const now = new Date().toISOString();
      
      // Check cache first
      if (this.activeSchedules.has(zone)) {
        const cached = this.activeSchedules.get(zone);
        if (cached.timestamp > now) {
          return cached.schedule;
        }
      }

      // Get from database
      const schedule = await this.db.getActiveSchedule(zone);
      
      // Cache result for 1 minute
      this.activeSchedules.set(zone, {
        schedule: schedule,
        timestamp: new Date(Date.now() + 60000).toISOString()
      });

      return schedule;
    } catch (error) {
      console.error('Error getting active schedule:', error);
      throw error;
    }
  }

  async updateActiveSchedules(zone) {
    try {
      const schedule = await this.getActiveSchedule(zone);
      
      // Emit update to clients in this zone
      this.io.to(zone).emit('scheduleUpdate', {
        zone: zone,
        schedule: schedule,
        timestamp: new Date().toISOString()
      });

      // Also emit to admin clients
      this.io.to('admin').emit('scheduleUpdate', {
        zone: zone,
        schedule: schedule,
        timestamp: new Date().toISOString()
      });

      await this.db.addLog('schedule', 'Active schedule updated', { zone, count: schedule.length });
    } catch (error) {
      console.error('Error updating active schedules:', error);
    }
  }

  async deleteSchedule(scheduleId) {
    try {
      // Get schedule info before deletion for logging
      const schedule = await this.getScheduleById(scheduleId);
      
      await this.db.db.run('DELETE FROM schedule WHERE id = ?', [scheduleId]);
      
      if (schedule) {
        await this.db.addLog('schedule', 'Schedule deleted', { 
          scheduleId, 
          zone: schedule.zone,
          contentId: schedule.contentId 
        });
        
        // Update active schedules for the zone
        this.updateActiveSchedules(schedule.zone);
      }

      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  async getScheduleById(scheduleId) {
    return new Promise((resolve, reject) => {
      this.db.db.get('SELECT * FROM schedule WHERE id = ?', [scheduleId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUpcomingSchedules(zone, limit = 10) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const query = `
        SELECT s.*, c.title, c.type FROM schedule s
        JOIN content c ON s.contentId = c.id
        WHERE s.zone = ? 
        AND s.startTime > ? 
        AND s.isActive = 1
        ORDER BY s.startTime ASC
        LIMIT ?
      `;

      this.db.db.all(query, [zone, now, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getScheduleStats() {
    try {
      const totalSchedules = await new Promise((resolve, reject) => {
        this.db.db.get('SELECT COUNT(*) as count FROM schedule WHERE isActive = 1', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });

      const activeSchedules = await new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        this.db.db.get(
          'SELECT COUNT(*) as count FROM schedule WHERE startTime <= ? AND endTime >= ? AND isActive = 1',
          [now, now],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          }
        );
      });

      const upcomingSchedules = await new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        this.db.db.get(
          'SELECT COUNT(*) as count FROM schedule WHERE startTime > ? AND isActive = 1',
          [now],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          }
        );
      });

      return {
        total: totalSchedules,
        active: activeSchedules,
        upcoming: upcomingSchedules
      };
    } catch (error) {
      console.error('Error getting schedule stats:', error);
      throw error;
    }
  }

  // Start schedule monitoring
  startScheduleMonitoring() {
    // Check every minute for schedule updates
    setInterval(() => {
      this.checkScheduleUpdates();
    }, 60000);

    // Initial check
    this.checkScheduleUpdates();
  }

  async checkScheduleUpdates() {
    try {
      const zones = await this.db.getZones();
      
      for (const zone of zones) {
        await this.updateActiveSchedules(zone.id);
      }
    } catch (error) {
      console.error('Error in schedule monitoring:', error);
    }
  }
}

module.exports = ScheduleManager;