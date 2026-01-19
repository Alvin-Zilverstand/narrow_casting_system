class ContentManager {
  constructor(databaseManager) {
    this.db = databaseManager;
  }

  async addContent(contentData) {
    try {
      const content = await this.db.addContent(contentData);
      await this.db.addLog('content', 'Content added', { contentId: content.id, type: content.type });
      return content;
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  }

  async getContent(zone = null, type = null) {
    try {
      return await this.db.getContent(zone, type);
    } catch (error) {
      console.error('Error getting content:', error);
      throw error;
    }
  }

  async getContentById(id) {
    try {
      return await this.db.getContentById(id);
    } catch (error) {
      console.error('Error getting content by ID:', error);
      throw error;
    }
  }

  async deleteContent(id) {
    try {
      const result = await this.db.deleteContent(id);
      if (result) {
        await this.db.addLog('content', 'Content deleted', { contentId: id });
      }
      return result;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  async updateContent(id, updates) {
    try {
      // Get current content
      const currentContent = await this.db.getContentById(id);
      if (!currentContent) {
        throw new Error('Content not found');
      }

      // Update in database (you would need to add this method to DatabaseManager)
      // For now, we'll just log it
      await this.db.addLog('content', 'Content updated', { contentId: id, updates });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async getContentStats() {
    try {
      const content = await this.db.getContent();
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

  validateContentType(mimeType) {
    const allowedTypes = {
      'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'video': ['video/mp4', 'video/webm', 'video/ogg'],
      'livestream': ['application/x-mpegURL', 'application/vnd.apple.mpegurl']
    };

    for (const [type, mimeTypes] of Object.entries(allowedTypes)) {
      if (mimeTypes.includes(mimeType)) {
        return type;
      }
    }

    return null;
  }

  getContentDuration(type, fileSize) {
    // Default durations in seconds
    const defaultDurations = {
      'image': 10,
      'video': 30,
      'livestream': 3600 // 1 hour for livestreams
    };

    // For videos, estimate duration based on file size (rough approximation)
    if (type === 'video') {
      // Assume ~1MB per 5 seconds for compressed video
      const estimatedSeconds = Math.floor(fileSize / (1024 * 1024) * 5);
      return Math.min(Math.max(estimatedSeconds, 10), 300); // Min 10s, Max 5min
    }

    return defaultDurations[type] || 10;
  }
}

module.exports = ContentManager;