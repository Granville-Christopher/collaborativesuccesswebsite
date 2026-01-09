const express = require('express');
const router = express.Router();
const path = require('path');
const Download = require('../models/Download');

// Download page (public, no auth required)
router.get('/download', (req, res) => {
  res.render('download', {
    title: 'Download App',
    version: '1.0.0',
    releaseDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  });
});

// Direct APK download endpoint - Track downloads
router.get('/download/apk', async (req, res) => {
  // Try multiple possible APK filenames (check collaborativesuccess.apk first since it exists)
  const possiblePaths = [
    path.join(__dirname, '../public/downloads/collaborativesuccess.apk'),
    path.join(__dirname, '../public/downloads/app-release.apk'),
    path.join(__dirname, '../public/downloads/CollaborativeSuccess.apk')
  ];
  
  let apkPath = null;
  const fs = require('fs');
  
  // Find which APK file exists
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      apkPath = possiblePath;
      break;
    }
  }
  
  if (!apkPath) {
    return res.status(404).render('error', { error: 'APK file not found. Please contact support.' });
  }
  
  // Track download
  try {
    await Download.create({
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent') || 'Unknown',
      referer: req.get('referer') || 'Direct',
      downloaded_at: new Date()
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    // Don't fail the download if tracking fails
  }
  
  res.download(apkPath, 'DiscordServerMonitor-v1.0.0.apk', (err) => {
    if (err) {
      console.error('Error downloading APK:', err);
      res.status(404).render('error', { error: 'APK file not found. Please contact support.' });
    }
  });
});

module.exports = router;

