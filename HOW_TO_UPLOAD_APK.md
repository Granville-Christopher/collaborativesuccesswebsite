# How to Upload APK to Website

## Quick Steps

1. **Build your APK using EAS:**
   ```bash
   cd ../mobile-app
   npx eas build --platform android --profile production
   ```

2. **Download the APK:**
   - Go to https://expo.dev/accounts/[your-account]/projects/collaborative-success/builds
   - Find your latest build
   - Download the APK file

3. **Place the APK in the website:**
   - Copy the downloaded APK file
   - Rename it to `app-release.apk`
   - Place it in: `website/public/downloads/app-release.apk`

4. **Update version (optional):**
   - Edit `website/views/download.ejs` if you want to update the version number shown

5. **Deploy/Restart:**
   - If using Railway or similar, the file will be automatically deployed
   - If running locally, restart your server

## File Location

The APK file should be placed at:
```
website/public/downloads/app-release.apk
```

## Download URL

Once uploaded, users can download at:
- **Download Page:** `https://your-domain.com/download`
- **Direct Download:** `https://your-domain.com/download/apk`

## Notes

- The download is automatically tracked in the database
- File size limit: Make sure your hosting provider allows files up to ~100MB
- The filename shown to users is: `DiscordServerMonitor-v1.0.0.apk`

## Alternative: Using GitHub Releases

If you prefer to host the APK on GitHub Releases:

1. Create a GitHub release
2. Upload the APK to the release
3. Update `website/routes/downloadRoutes.js` to redirect to the GitHub release URL
4. Or update `website/views/download.ejs` to link directly to GitHub

