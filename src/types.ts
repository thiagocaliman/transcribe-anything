export interface TranscriptionSettings {
  model: 'tiny' | 'small' | 'medium' | 'large' | 'large-v2' | 'large-v3';
  language: string;
  task: 'transcribe' | 'translate';
  device: 'auto' | 'cpu' | 'cuda' | 'insane' | 'mlx';
  outputFormat: string[];
  initialPrompt?: string;
  batchSize?: number;
  huggingFaceToken?: string;
}

export interface TranscriptionJob {
  id: string;
  file: File | string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  settings: TranscriptionSettings;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface TranscriptionResult {
  text: string;
  srt: string;
  vtt: string;
  json: any;
  speakers?: any[];
  outputDir: string;
}