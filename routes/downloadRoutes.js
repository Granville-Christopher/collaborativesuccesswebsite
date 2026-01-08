const express = require('express');
const router = express.Router();
const path = require('path');

// Download page (public, no auth required)
router.get('/download', (req, res) => {
  res.render('download', {
    title: 'Download App',
    version: '1.0.0',
    releaseDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  });
});

// Direct APK download endpoint
router.get('/download/apk', (req, res) => {
  const apkPath = path.join(__dirname, '../public/downloads/app-release.apk');
  res.download(apkPath, 'DiscordServerMonitor-v1.0.0.apk', (err) => {
    if (err) {
      console.error('Error downloading APK:', err);
      res.status(404).render('error', { error: 'APK file not found. Please contact support.' });
    }
  });
});

module.exports = router;

