# Downloads Directory

Place your APK files here.

## File Naming Convention

- `app-release.apk` - Main APK file (used by download page)
- `app-v1.0.0.apk` - Versioned APK files

## How to Update

1. Build your APK using EAS:
   ```bash
   cd ../mobile-app
   npx eas build --platform android --profile production
   ```

2. Download the APK from Expo dashboard

3. Rename it to `app-release.apk` and place it in this directory

4. Update the version number in `views/download.ejs` if needed

## File Size

APK files are typically 20-50MB. Make sure your hosting provider allows files of this size.

