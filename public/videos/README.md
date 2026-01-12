# Video Assets

## Background Video Setup

Place your background video file here for the ad page.

### Requirements:
- **File Name**: `background.mp4`
- **Recommended Resolution**: 1920x1080 (Full HD) or higher
- **Format**: MP4 (H.264 codec recommended for best compatibility)
- **Duration**: 10-30 seconds (will loop automatically)
- **File Size**: Keep under 10MB for fast loading

### Video Specifications:
- **Aspect Ratio**: 16:9 (landscape)
- **Frame Rate**: 24fps, 30fps, or 60fps
- **Quality**: High quality recommended (1080p or 4K)
- **Content**: Should showcase Discord servers, community, or tech aesthetic

### Quick Conversion:
If you have a video in another format, use FFmpeg:
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k -pix_fmt yuv420p -movflags +faststart background.mp4
```

### Fallback:
If no video is provided, the page will display with the gradient overlay only.

