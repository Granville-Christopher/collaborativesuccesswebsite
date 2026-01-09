const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  ip_address: String,
  user_agent: String,
  referer: String,
  downloaded_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'downloads',
  timestamps: false
});

// Index for faster queries
downloadSchema.index({ downloaded_at: -1 });

module.exports = mongoose.model('Download', downloadSchema);

