const express = require('express');
const multer = require('multer');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Configure multer for file uploads
const upload = multer({
  dest: path.join(os.tmpdir(), 'transcribe-uploads'),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Store active transcription jobs
const activeJobs = new Map();

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Check if transcribe-anything is installed
function checkTranscribeAnything() {
  return new Promise((resolve) => {
    const child = spawn('transcribe-anything', ['--help'], { stdio: 'pipe' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

// Install transcribe-anything if not present
async function ensureTranscribeAnything() {
  const isInstalled = await checkTranscribeAnything();
  
  if (!isInstalled) {
    console.log('Installing transcribe-anything...');
    return new Promise((resolve, reject) => {
      const child = spawn('pip', ['install', 'transcribe-anything'], { 
        stdio: 'inherit' 
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('transcribe-anything installed successfully');
          resolve();
        } else {
          reject(new Error('Failed to install transcribe-anything'));
        }
      });
    });
  }
}

// Transcription endpoint
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    const { settings } = req.body;
    const parsedSettings = JSON.parse(settings);
    const jobId = Date.now().toString();
    
    // Create output directory
    const outputDir = path.join(os.tmpdir(), `transcribe-output-${jobId}`);
    fs.mkdirSync(outputDir, { recursive: true });
    
    let inputPath;
    let isUrl = false;
    
    if (req.body.url) {
      // URL input
      inputPath = req.body.url;
      isUrl = true;
    } else if (req.file) {
      // File upload
      inputPath = req.file.path;
    } else {
      return res.status(400).json({ error: 'No file or URL provided' });
    }
    
    // Build transcribe-anything command
    const args = [
      inputPath,
      '--output_dir', outputDir,
      '--model', parsedSettings.model,
      '--task', parsedSettings.task
    ];
    
    if (parsedSettings.language !== 'auto') {
      args.push('--language', parsedSettings.language);
    }
    
    if (parsedSettings.device !== 'auto') {
      args.push('--device', parsedSettings.device);
    }
    
    if (parsedSettings.initialPrompt) {
      args.push('--initial_prompt', parsedSettings.initialPrompt);
    }
    
    if (parsedSettings.batchSize) {
      args.push('--batch-size', parsedSettings.batchSize.toString());
    }
    
    if (parsedSettings.huggingFaceToken) {
      args.push('--hf_token', parsedSettings.huggingFaceToken);
    }
    
    console.log('Starting transcription:', args);
    
    // Start transcription process
    const child = spawn('transcribe-anything', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    activeJobs.set(jobId, { child, outputDir, inputPath });
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 10, 90);
      broadcast({
        type: 'progress',
        jobId,
        progress: Math.round(progress)
      });
    }, 1000);
    
    child.stdout.on('data', (data) => {
      console.log('stdout:', data.toString());
    });
    
    child.stderr.on('data', (data) => {
      console.log('stderr:', data.toString());
    });
    
    child.on('close', (code) => {
      clearInterval(progressInterval);
      activeJobs.delete(jobId);
      
      if (code === 0) {
        // Read output files
        try {
          const results = readTranscriptionResults(outputDir);
          
          broadcast({
            type: 'complete',
            jobId,
            results
          });
        } catch (error) {
          broadcast({
            type: 'error',
            jobId,
            message: 'Failed to read transcription results'
          });
        }
      } else {
        broadcast({
          type: 'error',
          jobId,
          message: `Transcription failed with code ${code}`
        });
      }
      
      // Cleanup
      if (!isUrl && req.file) {
        fs.unlink(req.file.path, () => {});
      }
    });
    
    child.on('error', (error) => {
      clearInterval(progressInterval);
      activeJobs.delete(jobId);
      
      broadcast({
        type: 'error',
        jobId,
        message: error.message
      });
    });
    
    res.json({ jobId, status: 'started' });
    
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read transcription results from output directory
function readTranscriptionResults(outputDir) {
  const results = {
    text: '',
    srt: '',
    vtt: '',
    json: null,
    speakers: null,
    outputDir
  };
  
  try {
    // Read text file
    const txtPath = path.join(outputDir, 'out.txt');
    if (fs.existsSync(txtPath)) {
      results.text = fs.readFileSync(txtPath, 'utf8');
    }
    
    // Read SRT file
    const srtPath = path.join(outputDir, 'out.srt');
    if (fs.existsSync(srtPath)) {
      results.srt = fs.readFileSync(srtPath, 'utf8');
    }
    
    // Read VTT file
    const vttPath = path.join(outputDir, 'out.vtt');
    if (fs.existsSync(vttPath)) {
      results.vtt = fs.readFileSync(vttPath, 'utf8');
    }
    
    // Read JSON file
    const jsonPath = path.join(outputDir, 'out.json');
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      results.json = JSON.parse(jsonContent);
    }
    
    // Read speaker data if available
    const speakerPath = path.join(outputDir, 'speaker.json');
    if (fs.existsSync(speakerPath)) {
      const speakerContent = fs.readFileSync(speakerPath, 'utf8');
      results.speakers = JSON.parse(speakerContent);
    }
    
  } catch (error) {
    console.error('Error reading results:', error);
  }
  
  return results;
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isInstalled = await checkTranscribeAnything();
  res.json({ 
    status: 'ok', 
    transcribeAnythingInstalled: isInstalled,
    platform: os.platform(),
    arch: os.arch()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;

// Initialize server
async function startServer() {
  try {
    await ensureTranscribeAnything();
    
    server.listen(PORT, () => {
      console.log(`🚀 Transcribe Anything Web App running on http://localhost:${PORT}`);
      console.log(`📁 Upload directory: ${path.join(os.tmpdir(), 'transcribe-uploads')}`);
      console.log(`📄 Output directory: ${path.join(os.tmpdir(), 'transcribe-output-*')}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.log('Please install transcribe-anything manually: pip install transcribe-anything');
    process.exit(1);
  }
}

startServer();