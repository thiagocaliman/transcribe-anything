import React, { useState, useRef } from 'react';
import { Upload, File, Globe, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setSelectedFile(urlInput);
      onFileSelect(urlInput);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports MP4, MP3, WAV, M4A and more
            </p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Or paste a YouTube/URL:
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {typeof selectedFile === 'string' ? (
                <Globe className="h-4 w-4 text-blue-600" />
              ) : (
                <File className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                {typeof selectedFile === 'string' 
                  ? 'URL: ' + selectedFile.substring(0, 50) + (selectedFile.length > 50 ? '...' : '')
                  : selectedFile.name
                }
              </p>
              <p className="text-xs text-blue-600">
                {typeof selectedFile === 'string' 
                  ? 'Remote URL' 
                  : `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`
                }
              </p>
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;