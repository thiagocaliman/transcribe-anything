import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Download, Settings, Mic, FileText, Video, Globe, Cpu, Zap, Brain } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TranscriptionSettings from './components/TranscriptionSettings';
import TranscriptionProgress from './components/TranscriptionProgress';
import ResultsDisplay from './components/ResultsDisplay';
import { TranscriptionJob, TranscriptionSettings as SettingsType } from './types';

function App() {
  const [currentJob, setCurrentJob] = useState<TranscriptionJob | null>(null);
  const [settings, setSettings] = useState<SettingsType>({
    model: 'small',
    language: 'auto',
    task: 'transcribe',
    device: 'auto',
    outputFormat: ['srt', 'txt', 'vtt']
  });
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = (file: File | string) => {
    const job: TranscriptionJob = {
      id: Date.now().toString(),
      file: file,
      status: 'pending',
      progress: 0,
      settings: { ...settings }
    };
    setCurrentJob(job);
    setResults(null);
  };

  const handleStartTranscription = async () => {
    if (!currentJob) return;

    setCurrentJob(prev => prev ? { ...prev, status: 'processing', progress: 0 } : null);

    try {
      const formData = new FormData();
      
      if (typeof currentJob.file === 'string') {
        formData.append('url', currentJob.file);
      } else {
        formData.append('file', currentJob.file);
      }
      
      formData.append('settings', JSON.stringify(currentJob.settings));

      // Start transcription
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      // Setup WebSocket for progress updates
      const ws = new WebSocket(`ws://localhost:3001/ws`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setCurrentJob(prev => prev ? { ...prev, progress: data.progress } : null);
        } else if (data.type === 'complete') {
          setCurrentJob(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
          setResults(data.results);
          ws.close();
        } else if (data.type === 'error') {
          setCurrentJob(prev => prev ? { ...prev, status: 'error', error: data.message } : null);
          ws.close();
        }
      };

      const jobData = await response.json();
      
    } catch (error) {
      setCurrentJob(prev => prev ? { 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Transcribe Anything</h1>
                <p className="text-sm text-gray-500">Local AI-powered transcription</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Cpu className="h-4 w-4" />
                  <span>Local Processing</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <Brain className="h-4 w-4" />
                  <span>AI Powered</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-500" />
                Upload Media
              </h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-500" />
                  Settings
                </h2>
                <TranscriptionSettings 
                  settings={settings} 
                  onChange={setSettings} 
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleStartTranscription}
                  disabled={!currentJob || currentJob.status === 'processing'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {currentJob?.status === 'processing' ? 'Processing...' : 'Start Transcription'}
                </button>
                
                {results && (
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Download className="h-5 w-5 mr-2" />
                    Download Results
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Job Status */}
            {currentJob && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-500" />
                  Transcription Progress
                </h2>
                <TranscriptionProgress job={currentJob} />
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Transcription Results
                </h2>
                <ResultsDisplay results={results} />
              </div>
            )}

            {/* Welcome Message */}
            {!currentJob && !results && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Mic className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Welcome to Transcribe Anything
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upload an audio or video file, or paste a YouTube URL to get started with AI-powered transcription.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                      <Video className="h-4 w-4 mr-2 text-gray-600" />
                      <span>Video Files</span>
                    </div>
                    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                      <Mic className="h-4 w-4 mr-2 text-gray-600" />
                      <span>Audio Files</span>
                    </div>
                    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                      <Globe className="h-4 w-4 mr-2 text-gray-600" />
                      <span>YouTube URLs</span>
                    </div>
                    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                      <Brain className="h-4 w-4 mr-2 text-gray-600" />
                      <span>AI Powered</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;