"use client";

import { useState, useRef, useEffect, FC } from 'react';
import type { Message } from '@/lib/types';
import ChatInput from './chat-input';
import ChatMessage from './chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processUserCommand } from '@/app/actions';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const ChatInterface: FC<{ deviceId: string; onNewChat: () => void; messages: Message[]; setMessages: (messages: Message[]) => void; }> = ({ deviceId, onNewChat, messages, setMessages }) => {
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableNode = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableNode) {
        scrollableNode.scrollTo({
          top: scrollableNode.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);
  
  const processCommand = async (userInput: string) => {
    setIsLoading(true);
    try {
      const agentResponse = await processUserCommand(userInput, deviceId);
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: agentResponse,
      };
      setMessages(prev => [...prev.slice(0, -1), agentMessage]);
    } catch (error) {
       const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: 'Sorry, an unexpected error occurred. Please check the console.',
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process command.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
    };
    
    setMessages(prev => [...prev, userMessage, {
      id: crypto.randomUUID(),
      role: 'agent',
      content: (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )
    }]);

    await processCommand(userInput);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessages = [...messages];
    updatedMessages[messageIndex].content = newContent;

    // Remove subsequent messages and add loading indicator
    const resubmittedMessages = updatedMessages.slice(0, messageIndex + 1);
     setMessages([...resubmittedMessages, {
      id: crypto.randomUUID(),
      role: 'agent',
      content: (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )
    }]);

    processCommand(newContent);
  };

  const handleRetry = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;

    const userInput = messages[messageIndex].content as string;
    
    const subsequentMessages = messages.slice(0, messageIndex + 1);

    setMessages([...subsequentMessages, {
      id: crypto.randomUUID(),
      role: 'agent',
      content: (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )
    }]);

    processCommand(userInput);
  }
  
  return (
    <div className="flex flex-col h-screen bg-card">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-8 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
                <Bot size={48} className="text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold font-headline">Welcome to AutoGLM Studio</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Start by typing a command for the phone agent below. For example, "Open the settings and turn off Wi-Fi".
                </p>
              </div>
            ) : (
              messages.map(message => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onEdit={handleEditMessage}
                  onRetry={handleRetry}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t bg-card">
        <div className="p-4 max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
