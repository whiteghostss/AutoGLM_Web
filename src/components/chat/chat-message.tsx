"use client";

import type { FC } from 'react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

const ChatMessage: FC<{ message: Message }> = ({ message }) => {
  const isAgent = message.role === 'agent';
  return (
    <div className={cn('flex items-start gap-4 w-full max-w-3xl mx-auto', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && (
        <Avatar className="w-8 h-8 border bg-background">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xl rounded-lg px-4 py-3 text-sm shadow-sm',
          isAgent
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {typeof message.content === 'string' ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
            message.content
        )}
      </div>
      {!isAgent && (
        <Avatar className="w-8 h-8 border bg-background">
          <AvatarFallback>
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
