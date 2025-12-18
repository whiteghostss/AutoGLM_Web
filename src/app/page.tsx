"use client";

import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import ChatInterface from '@/components/chat/chat-interface';
import { useConfig } from '@/hooks/use-config';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { config, saveConfig, isLoaded } = useConfig();

  return (
    <main>
      <SidebarProvider>
        <Sidebar>
          {isLoaded ? (
            <AppSidebar config={config} onConfigChange={saveConfig} />
          ) : (
            <SidebarSkeleton />
          )}
        </Sidebar>
        <SidebarInset>
          <ChatInterface deviceId={isLoaded ? config.deviceId : ''} />
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
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </SidebarContent>
    <SidebarFooter className="p-4">
      <Skeleton className="h-9 w-full" />
    </SidebarFooter>
  </>
);
