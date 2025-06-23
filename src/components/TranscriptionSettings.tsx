import React from 'react';
import { TranscriptionSettings as SettingsType } from '../types';

interface TranscriptionSettingsProps {
  settings: SettingsType;
  onChange: (settings: SettingsType) => void;
}

const TranscriptionSettings: React.FC<TranscriptionSettingsProps> = ({ settings, onChange }) => {
  const updateSetting = (key: keyof SettingsType, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const toggleOutputFormat = (format: string) => {
    const current = settings.outputFormat;
    const updated = current.includes(format)
      ? current.filter(f => f !== format)
      : [...current, format];
    updateSetting('outputFormat', updated);
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Size
        </label>
        <select
          value={settings.model}
          onChange={(e) => updateSetting('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="tiny">Tiny (fastest, least accurate)</option>
          <option value="small">Small (balanced)</option>
          <option value="medium">Medium (good quality)</option>
          <option value="large">Large (best quality)</option>
          <option value="large-v2">Large v2</option>
          <option value="large-v3">Large v3 (latest)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Larger models are more accurate but slower
        </p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="auto">Auto-detect</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {/* Task */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="transcribe"
              checked={settings.task === 'transcribe'}
              onChange={(e) => updateSetting('task', e.target.value)}
              className="mr-2"
            />
            Transcribe
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="translate"
              checked={settings.task === 'translate'}
              onChange={(e) => updateSetting('task', e.target.value)}
              className="mr-2"
            />
            Translate to English
          </label>
        </div>
      </div>

      {/* Device */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Processing Device
        </label>
        <select
          value={settings.device}
          onChange={(e) => updateSetting('device', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="auto">Auto (recommended)</option>
          <option value="cpu">CPU (slower, compatible)</option>
          <option value="cuda">CUDA (NVIDIA GPU)</option>
          <option value="insane">Insane (fastest NVIDIA)</option>
          <option value="mlx">MLX (Apple Silicon)</option>
        </select>
      </div>

      {/* Output Formats */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Formats
        </label>
        <div className="space-y-2">
          {['txt', 'srt', 'vtt', 'json'].map((format) => (
            <label key={format} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.outputFormat.includes(format)}
                onChange={() => toggleOutputFormat(format)}
                className="mr-2"
              />
              <span className="text-sm">{format.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Initial Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Initial Prompt (optional)
        </label>
        <textarea
          value={settings.initialPrompt || ''}
          onChange={(e) => updateSetting('initialPrompt', e.target.value)}
          placeholder="Provide context or vocabulary hints..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Help improve accuracy with domain-specific terms
        </p>
      </div>

      {/* Advanced Settings */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Advanced Settings
        </summary>
        <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Size
            </label>
            <input
              type="number"
              value={settings.batchSize || 24}
              onChange={(e) => updateSetting('batchSize', parseInt(e.target.value))}
              min="1"
              max="64"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HuggingFace Token (for speaker diarization)
            </label>
            <input
              type="password"
              value={settings.huggingFaceToken || ''}
              onChange={(e) => updateSetting('huggingFaceToken', e.target.value)}
              placeholder="hf_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </details>
    </div>
  );
};

export default TranscriptionSettings;