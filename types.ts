export enum View {
  HOME = 'HOME',
  ANALYZER = 'ANALYZER',
  KNOWLEDGE = 'KNOWLEDGE',
  DESIGNER = 'DESIGNER',
  ORAL_TRADITION = 'ORAL_TRADITION',
  TRANSCRIBE = 'TRANSCRIBE',
  LEARNING = 'LEARNING',
  ABOUT = 'ABOUT'
}

export interface LogEntry {
  id: string;
  type: 'image' | 'text' | 'design' | 'audio';
  content: string;
  timestamp: number;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  aiCuratorNote?: string;
  timestamp: Date;
}