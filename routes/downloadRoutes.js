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

// Direct APK download endpoint - Track downloads
router.get('/download/apk', async (req, res) => {
  const fs = require('fs');
  
  // Try multiple possible APK filenames (check collaborativesuccess.apk first since it exists)
  const possiblePaths = [
    path.join(__dirname, '../public/downloads/collaborativesuccess.apk'),
    path.join(__dirname, '../public/downloads/app-release.apk'),
    path.join(__dirname, '../public/downloads/CollaborativeSuccess.apk')
  ];
  
  let apkPath = null;
  
  // Log current directory for debugging
  console.log('Current __dirname:', __dirname);
  console.log('Checking for APK files...');
  
  // Find which APK file exists
  for (const possiblePath of possiblePaths) {
    try {
      const exists = fs.existsSync(possiblePath);
      console.log(`Checking: ${possiblePath} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      if (exists) {
        apkPath = possiblePath;
        console.log(`✅ Found APK at: ${apkPath}`);
        // Check file size
        const stats = fs.statSync(apkPath);
        console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        break;
      }
    } catch (error) {
      console.error(`Error checking path ${possiblePath}:`, error.message);
    }
  }
  
  if (!apkPath) {
    console.error('❌ APK file not found. Checked paths:', possiblePaths);
    // List files in downloads directory for debugging
    let filesList = 'No files found';
    try {
      const downloadsDir = path.join(__dirname, '../public/downloads');
      const files = fs.readdirSync(downloadsDir);
      filesList = files.join(', ');
      console.log('Files in downloads directory:', files);
    } catch (err) {
      console.error('Error reading downloads directory:', err.message);
      filesList = `Error: ${err.message}`;
    }
    
    // Fallback to Expo direct link if file not found on server
    const expoDirectLink = 'https://expo.dev/artifacts/eas/v36BvoUzhrV38HhYjDzNXs.apk';
    console.log('⚠️ APK not found on server, redirecting to Expo direct link');
    return res.redirect(expoDirectLink);
  }
  
  // Set proper headers for file download
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="DiscordServerMonitor-v1.0.0.apk"');
  
  // Send the file
  const fileStream = fs.createReadStream(apkPath);
  fileStream.on('error', (err) => {
    console.error('Error reading APK file:', err);
    if (!res.headersSent) {
      res.status(404).render('error', { error: 'APK file not found. Please contact support.' });
    }
  });
  
  fileStream.pipe(res);
});

module.exports = router;

