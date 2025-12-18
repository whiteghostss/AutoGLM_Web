import type { ReactNode } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'agent';
  content: ReactNode;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};
