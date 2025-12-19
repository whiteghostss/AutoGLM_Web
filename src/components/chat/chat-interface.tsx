"use client";

import { useState, useRef, useEffect, FC } from 'react';
import type { Message, Chat } from '../../lib/types';
import ChatInput from './chat-input';
import ChatMessage from './chat-message';
import { ScrollArea } from '../ui/scroll-area';
import { Bot, Plus } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { SidebarTrigger } from '../ui/sidebar';

interface ChatInterfaceProps {
  chat: Chat;
  setChat: (chat: Chat) => void;
  deviceId: string;
  onNewChat: () => void;
  processUserCommand: (instruction: string, deviceId: string) => Promise<string>;
  summarizeTitle: (text: string) => Promise<string>;
}


const ChatInterface: FC<ChatInterfaceProps> = ({ chat, setChat, deviceId, onNewChat, processUserCommand, summarizeTitle }) => {
  const { messages, title } = chat;
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const setMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    const updatedMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages;
    setChat({ ...chat, messages: updatedMessages });
  };
  
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

  const runAgent = async (userInput: string) => {
    setIsLoading(true);

    if(chat.messages.length === 1) { // First user message
      const newTitle = await summarizeTitle(userInput);
      setChat(prev => ({...prev, title: newTitle}));
    }

    try {
      const agentResponse = await processUserCommand(userInput, deviceId);
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: agentResponse,
      };
      setMessages(prev => [...prev.slice(0, -1), agentMessage]);
    } catch (error: any) {
       const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: error.message || 'Sorry, an unexpected error occurred. Please check the console.',
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

  const handleSendMessage = async (userInput: string, file?: File) => {
    if ((!userInput.trim() && !file) || isLoading) return;
    
    let combinedInput = userInput;

    // Handle file upload if present
    if (file) {
      // You can implement file handling logic here, e.g., upload to a server
      console.log('File to upload:', file.name);
      toast({
        title: 'File ready',
        description: `${file.name} is ready to be sent.`,
      });
      // For now, let's just append the file name to the message
      combinedInput = `${userInput}\n\n[File: ${file.name}]`;
    }
    
    if(!combinedInput.trim()) return;


    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: combinedInput,
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

    await runAgent(combinedInput);
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

    runAgent(newContent);
  };

  const handleRetry = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const messageToRetry = messages[messageIndex];
    
    const role = messageToRetry.role;
    let userInput = '';

    if (role === 'user') {
      userInput = messageToRetry.content as string;
    } else { // 'agent', retry the last user prompt
      const lastUserMessage = [...messages].slice(0, messageIndex).reverse().find(m => m.role === 'user');
      if (!lastUserMessage) return;
      userInput = lastUserMessage.content as string;
    }
    
    const subsequentMessages = messages.slice(0, messageIndex);

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

    runAgent(userInput);
  }
  
  return (
    <div className="flex flex-col h-screen bg-card">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-lg font-semibold truncate">{title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <Plus size={20} />
          <span className="sr-only">New Chat</span>
        </Button>
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-8 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-220px)] text-center">
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
      <div className="border-t bg-card shrink-0">
        <div className="p-4 max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
