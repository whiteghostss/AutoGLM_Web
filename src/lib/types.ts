import type { ReactNode } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'agent';
  content: ReactNode;
};
