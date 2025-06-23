# Transcribe Anything - Local Web App

A modern web application that provides a user-friendly interface for the powerful `transcribe-anything` Python package. This app runs entirely on your local machine, ensuring privacy and security for your audio/video transcriptions.

## Features

### 🎯 Core Functionality
- **File Upload**: Drag & drop or browse for audio/video files
- **URL Support**: Paste YouTube URLs or other media links
- **Multiple Formats**: Supports MP4, MP3, WAV, M4A, and more
- **Real-time Progress**: Live transcription progress updates
- **Multiple Outputs**: Generate TXT, SRT, VTT, and JSON files

### 🚀 AI-Powered Transcription
- **Multiple Models**: Choose from Tiny to Large-v3 Whisper models
- **Language Support**: Auto-detect or specify from 50+ languages
- **Device Optimization**: Auto-select CPU, CUDA, or Apple MLX
- **Speaker Diarization**: Identify different speakers (with HuggingFace token)
- **Custom Prompts**: Improve accuracy with domain-specific vocabulary

### 🎨 Modern Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: WebSocket-powered progress tracking
- **Intuitive Controls**: Clean, modern UI with Tailwind CSS
- **Results Viewer**: Built-in viewer for all output formats

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.10+ with pip
- FFmpeg (automatically handled by transcribe-anything)

### Installation

1. **Clone or download this project**
```bash
git clone <repository-url>
cd transcribe-anything-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the application**
```bash
npm run build
```

4. **Start the server**
```bash
npm run server
```

5. **Open your browser**
Navigate to `http://localhost:3001`

The app will automatically install `transcribe-anything` if it's not already available.

### Development Mode

For development with hot reload:

```bash
# Terminal 1 - Start the backend server
npm run server

# Terminal 2 - Start the frontend dev server
npm run dev
```

Then open `http://localhost:3000` for the development interface.

## Usage Guide

### Basic Transcription

1. **Upload Media**: 
   - Drag & drop a file onto the upload area
   - Click to browse and select a file
   - Or paste a YouTube/media URL

2. **Configure Settings** (optional):
   - Click the settings icon to adjust model, language, device
   - Choose output formats (TXT, SRT, VTT, JSON)
   - Set custom prompts for better accuracy

3. **Start Transcription**:
   - Click "Start Transcription"
   - Monitor real-time progress
   - View results when complete

### Advanced Features

#### Speaker Diarization
To identify different speakers in your audio:

1. Get a HuggingFace token from [huggingface.co](https://huggingface.co)
2. Accept the user agreement for `pyannote.audio` models
3. Enter your token in Advanced Settings
4. The app will generate a `speaker.json` file with speaker-separated text

#### Custom Vocabulary
Improve transcription accuracy for technical terms:

1. Open Settings
2. Add an "Initial Prompt" with relevant vocabulary
3. Example: "The speaker discusses AI, machine learning, neural networks, and PyTorch"

#### Device Optimization
- **Auto**: Automatically selects the best available device
- **CPU**: Compatible with all systems (slower)
- **CUDA**: NVIDIA GPU acceleration (Windows/Linux)
- **Insane**: Fastest NVIDIA processing with batching
- **MLX**: Apple Silicon acceleration (Mac M1/M2/M3)

## Supported Formats

### Input Formats
- **Video**: MP4, AVI, MOV, MKV, WebM
- **Audio**: MP3, WAV, M4A, FLAC, OGG
- **URLs**: YouTube, Vimeo, and other yt-dlp supported sites

### Output Formats
- **TXT**: Plain text transcription
- **SRT**: SubRip subtitle format
- **VTT**: WebVTT subtitle format
- **JSON**: Detailed transcription data with timestamps
- **Speaker JSON**: Speaker-separated transcription (with diarization)

## Configuration

### Environment Variables
```bash
PORT=3001                    # Server port (default: 3001)
UPLOAD_LIMIT=500MB          # Max file upload size
TEMP_DIR=/custom/temp       # Custom temporary directory
```

### Model Selection Guide
- **Tiny**: Fastest, least accurate (~1GB VRAM)
- **Small**: Good balance of speed/accuracy (~2GB VRAM)
- **Medium**: Better accuracy (~5GB VRAM)
- **Large**: Best accuracy (~10GB VRAM)
- **Large-v3**: Latest model with improvements

## Troubleshooting

### Common Issues

**"transcribe-anything not found"**
- The app will try to install it automatically
- Manual install: `pip install transcribe-anything`

**GPU not detected**
- Ensure NVIDIA drivers are installed
- Try switching to CPU device in settings

**Out of memory errors**
- Use a smaller model (tiny/small)
- Reduce batch size in advanced settings
- Switch to CPU processing

**Upload fails**
- Check file size (500MB limit by default)
- Ensure file format is supported
- Try converting to MP3/MP4 first

### Performance Tips

1. **For fastest processing**: Use "insane" device with large-v3 model
2. **For compatibility**: Use CPU device with small model
3. **For large files**: Reduce batch size or use smaller model
4. **For accuracy**: Use custom prompts with domain vocabulary

## Technical Details

### Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + WebSocket for real-time updates
- **Processing**: Python transcribe-anything package
- **Build Tool**: Vite for fast development and building

### File Processing Flow
1. File uploaded to temporary directory
2. transcribe-anything spawned as child process
3. Progress updates sent via WebSocket
4. Results read from output directory
5. Files served through web interface

### Security Features
- Local processing only (no data sent to external servers)
- Temporary file cleanup
- File size limits
- Input validation

## Contributing

This project welcomes contributions! Areas for improvement:

- Additional output formats
- Batch processing interface
- Advanced audio preprocessing
- Integration with cloud storage
- Mobile app version

## License

This project is open source. The underlying `transcribe-anything` package is also open source with its own license terms.

## Credits

Built on top of the excellent [transcribe-anything](https://github.com/zackees/transcribe-anything) package by zackees, which provides the core AI transcription capabilities using OpenAI's Whisper models.