export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  description: string;
  imageUrl: string;
}

export type Page = 'home' | 'chat' | 'psychologists' | 'request-help';
