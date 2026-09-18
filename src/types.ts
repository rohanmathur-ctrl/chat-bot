export type ModelType = 'Nexus-1 Neural Core' | 'Nexus DeepMind (Reasoning)' | 'Nexus Code (Polyglot)';

export interface ArchitectureNode {
  id: string;
  name: string;
  type: 'gateway' | 'broker' | 'workers' | 'db' | 'cache';
  confidence: number;
  status: 'operational' | 'analyzed' | 'optimal';
  throughput: string;
  p99Latency: string;
  subnet: string;
  description: string;
  diagnostics: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  content: string;
  thoughtTime?: string;
  thoughts?: string[];
  type?: 'text' | 'code' | 'voice' | 'vision-ocr';
  isStreaming?: boolean;
  codeArtifact?: {
    filename: string;
    language: string;
    code: string;
    testSuitePassed?: boolean;
    testsCount?: number;
  };
  voiceSession?: {
    duration: string;
    speaker: string;
    model: string;
    transcriptSnippet: string;
  };
  visionIngest?: {
    filename: string;
    size: string;
    status: string;
    detectedNodes: ArchitectureNode[];
    openApiSpec: string;
    imageUrl?: string;
  };
}

export type RightPanelTab = 'inspector' | 'vitest' | 'json';

export interface AuthUser {
  email: string;
  name: string;
  token: string;
  createdAt: string;
}
