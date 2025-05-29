# Voice to Text Converter

A web application that converts audio and video files to text, supporting both Hindi and English languages.

## Features

- Drag and drop interface for easy file upload
- Support for both audio and video files
- Automatic language detection (Hindi/English)
- Copy converted text to clipboard
- Download converted text as a file
- Modern and responsive design

## How to Use

1. Open `index.html` in a modern web browser (Chrome recommended)
2. Drag and drop your audio/video file onto the upload area, or click "Choose File"
3. Wait for the file to be processed
4. Click "Convert to Text" to start the conversion
5. Once complete, the converted text will appear in the result area
6. Use the "Copy Text" or "Download Text" buttons to save your results

## Supported File Types

- Audio files (MP3, WAV, OGG, etc.)
- Video files (MP4, WebM, etc.)

## Language Support

- English (en-US)
- Hindi (hi-IN)

## Browser Compatibility

This application uses the Web Speech API, which is currently best supported in:
- Google Chrome
- Microsoft Edge
- Opera

## Note

For best results:
- Use clear audio recordings
- Ensure good audio quality
- Keep background noise to a minimum
- For Hindi files, include "hindi" or "हिंदी" in the filename for proper language detection

## Technical Details

The application uses:
- HTML5 for structure
- CSS3 for styling
- JavaScript for functionality
- Web Speech API for speech recognition
- File API for handling uploads 