import React from 'react';
import { TranscriptionJob } from '../types';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

interface TranscriptionProgressProps {
  job: TranscriptionJob;
}

const TranscriptionProgress: React.FC<TranscriptionProgressProps> = ({ job }) => {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'pending':
        return 'text-gray-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getProgressBarColor = () => {
    switch (job.status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Job Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-gray-900">
              {typeof job.file === 'string' ? 'URL Transcription' : job.file.name}
            </p>
            <p className={`text-sm ${getStatusColor()}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              {job.status === 'processing' && ` (${job.progress}%)`}
            </p>
          </div>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          <p>Model: {job.settings.model}</p>
          <p>Device: {job.settings.device}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{job.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {job.status === 'error' && job.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {job.error}
          </p>
        </div>
      )}

      {/* Settings Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-gray-500">Language:</p>
          <p className="font-medium">{job.settings.language === 'auto' ? 'Auto-detect' : job.settings.language}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500">Task:</p>
          <p className="font-medium">{job.settings.task}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500">Output:</p>
          <p className="font-medium">{job.settings.outputFormat.join(', ')}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500">Batch Size:</p>
          <p className="font-medium">{job.settings.batchSize || 'Default'}</p>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionProgress;