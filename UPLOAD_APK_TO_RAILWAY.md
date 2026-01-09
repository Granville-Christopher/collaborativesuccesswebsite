# How to Upload APK to Railway

## Problem
Railway times out when trying to upload large APK files (100MB+) via `railway up`.

## Solution Options

### Option 1: Upload via Railway CLI (Recommended)
After deploying your code, upload the APK file separately:

```bash
# 1. Deploy your code first (without APK)
railway up

# 2. Once deployed, upload the APK file
railway run --service <your-service-id> -- sh -c "mkdir -p /app/public/downloads && echo 'Upload APK manually'"
```

Or use Railway's file upload feature in the dashboard.

### Option 2: Use Railway Volumes
1. Create a Railway volume in your project dashboard
2. Mount it to `/app/public/downloads`
3. Upload the APK file to the volume

### Option 3: Use External Storage (Best for Production)
Use a CDN or object storage service:
- **Cloudflare R2** (Free tier available)
- **AWS S3**
- **DigitalOcean Spaces**
- **GitHub Releases** (Free, public)

Then update the download route to redirect to the external URL.

### Option 4: Use Git LFS (Git Large File Storage)
If using Git for deployment:

```bash
# Install Git LFS
git lfs install

# Track APK files
git lfs track "*.apk"

# Add and commit
git add .gitattributes
git add public/downloads/*.apk
git commit -m "Add APK with LFS"
git push
```

**Note:** Railway may not support Git LFS, so this might not work.

## Recommended: Manual Upload After Deployment

1. **Deploy code without APK:**
   - Keep APK in `.railwayignore` for now
   - Deploy your code: `railway up`

2. **Upload APK via Railway Dashboard:**
   - Go to Railway dashboard
   - Open your service
   - Use the "Files" or "Volumes" tab
   - Upload `collaborativesuccess.apk` to `/app/public/downloads/`

3. **Or use Railway CLI to copy file:**
   ```bash
   railway run --service <service-id> -- sh
   # Then in the shell:
   # You'll need to use Railway's file upload or volume feature
   ```

## Quick Fix: Use External URL

For now, you can use the Expo direct link in the download page, and we'll set up proper file hosting later.

