"use client";

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import ChatInterface from '@/components/chat/chat-interface';
import { useConfig } from '@/hooks/use-config';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import type { Message, Chat } from '@/lib/types';
import { processUserCommand, summarizeTitle } from '@/app/actions';


export default function Home() {
  const { config, saveConfig, isLoaded } = useConfig();
  const [activeChat, setActiveChat] = useState<Chat>({ id: 'new-chat', title: 'New Chat', messages: [] });
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);

  const handleNewChat = () => {
    // Save the current chat if it has messages
    if (activeChat.messages.length > 0 && activeChat.id === 'new-chat') {
      const newChat = { ...activeChat, id: crypto.randomUUID(), title: activeChat.title };
      setChatHistory(prev => [newChat, ...prev]);
    } else if (activeChat.messages.length > 0) {
      // Update existing chat in history
      setChatHistory(prev => prev.map(chat => chat.id === activeChat.id ? activeChat : chat));
    }
    setActiveChat({ id: 'new-chat', title: 'New Chat', messages: [] });
  };

  const switchChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
    }
  }

  return (
    <main>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          {isLoaded ? (
            <AppSidebar 
              config={config} 
              onConfigChange={saveConfig} 
              onNewChat={handleNewChat}
              chatHistory={chatHistory}
              onSwitchChat={switchChat}
            />
          ) : (
            <SidebarSkeleton />
          )}
        </Sidebar>
        <SidebarInset>
            <ChatInterface 
              key={activeChat.id}
              chat={activeChat}
              setChat={setActiveChat}
              deviceId={isLoaded ? config.deviceId : ''} 
              onNewChat={handleNewChat}
              processUserCommand={processUserCommand}
              summarizeTitle={summarizeTitle}
            />
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}

const SidebarSkeleton = () => (
  <>
    <SidebarHeader className="p-4">
      <Skeleton className="h-8 w-40" />
    </SidebarHeader>
    <SidebarContent className="p-4 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
        </div>
      </div>
       <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
       <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-12 w-full" />
      </div>
    </SidebarContent>
    <SidebarFooter className="p-4">
      <Skeleton className="h-9 w-full" />
    </SidebarFooter>
  </>
);
