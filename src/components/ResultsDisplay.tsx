import React, { useState } from 'react';
import { Download, Copy, Eye, FileText, Users } from 'lucide-react';

interface ResultsDisplayProps {
  results: {
    text: string;
    srt: string;
    vtt: string;
    json: any;
    speakers?: any[];
    outputDir: string;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'srt' | 'vtt' | 'json' | 'speakers'>('text');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'text':
        return results.text;
      case 'srt':
        return results.srt;
      case 'vtt':
        return results.vtt;
      case 'json':
        return JSON.stringify(results.json, null, 2);
      case 'speakers':
        return results.speakers ? JSON.stringify(results.speakers, null, 2) : 'No speaker data available';
      default:
        return '';
    }
  };

  const getFileExtension = () => {
    switch (activeTab) {
      case 'text':
        return 'txt';
      case 'srt':
        return 'srt';
      case 'vtt':
        return 'vtt';
      case 'json':
        return 'json';
      case 'speakers':
        return 'json';
      default:
        return 'txt';
    }
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'srt', label: 'SRT', icon: FileText },
    { id: 'vtt', label: 'VTT', icon: FileText },
    { id: 'json', label: 'JSON', icon: FileText },
    ...(results.speakers ? [{ id: 'speakers', label: 'Speakers', icon: Users }] : [])
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(getActiveContent())}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button
            onClick={() => downloadFile(
              getActiveContent(),
              `transcription.${getFileExtension()}`,
              'text/plain'
            )}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {getActiveContent().length} characters
        </div>
      </div>

      {/* Content Display */}
      <div className="relative">
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
          {getActiveContent()}
        </pre>
        
        {activeTab === 'text' && (
          <div className="absolute top-2 right-2">
            <button className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50">
              <Eye className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Words</p>
          <p className="font-semibold">{results.text.split(' ').length}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Characters</p>
          <p className="font-semibold">{results.text.length}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Lines (SRT)</p>
          <p className="font-semibold">{results.srt.split('\n\n').length}</p>
        </div>
        {results.speakers && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500">Speakers</p>
            <p className="font-semibold">{results.speakers.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;