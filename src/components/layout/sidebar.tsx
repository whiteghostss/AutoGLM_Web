"use client";

import type { FC } from 'react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast"
import { Wifi, KeyRound, Save, Bot, Sun, Moon, History, PlusSquare, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Chat } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

type Config = {
  deviceId: string;
  apiKey: string;
  qwenApiKey: string;
  theme: 'light' | 'dark';
  useQwen3: boolean;
};

type AppSidebarProps = {
  config: Config;
  onConfigChange: (newConfig: Partial<Config>) => void;
  onNewChat: () => void;
  chatHistory: Chat[];
  onSwitchChat: (chatId: string) => void;
};

const AppSidebar: FC<AppSidebarProps> = ({ config, onConfigChange, onNewChat, chatHistory, onSwitchChat }) => {
  const { toast } = useToast();

  const handleSave = () => {
    // onConfigChange is already called when inputs change, but we keep this for explicit save action
    toast({
      title: "Configuration Saved",
      description: "Your settings have been successfully saved.",
    });
  };

  const handleThemeChange = (isDark: boolean) => {
    onConfigChange({ theme: isDark ? 'dark' : 'light' });
  };
  
  const handleQwen3Change = (useQwen3: boolean) => {
    onConfigChange({ useQwen3 });
    if(useQwen3 && !config.qwenApiKey) {
        onConfigChange({ qwenApiKey: 'sk-b4d710d02b0f49b1908ff05a08263918' });
    }
  };

  return (
    <>
      <SidebarHeader className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" />
          <h1 className="text-lg font-semibold font-headline">AutoGLM Studio</h1>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-4 flex flex-col">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Wifi size={18} />
              Agent Connection
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input
                id="deviceId"
                value={config.deviceId}
                onChange={(e) => onConfigChange({ deviceId: e.target.value })}
                placeholder="e.g., zerotier-device-id"
              />
              <p className="text-xs text-muted-foreground">ADB over ZeroTier device ID.</p>
            </div>
          </div>
          <div className="space-y-3">
             <h2 className="font-semibold text-base flex items-center gap-2">
                <History size={18} />
                History
             </h2>
             <Button variant="outline" className="w-full" onClick={onNewChat}>
                <PlusSquare size={16} /> New Chat
             </Button>
             <ScrollArea className="h-24">
              <SidebarMenu>
                  {chatHistory.slice(0, 5).map(chat => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton onClick={() => onSwitchChat(chat.id)} variant="ghost" className="w-full justify-start">
                        <MessageSquare />
                        <span className="truncate">{chat.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
             </ScrollArea>
             {chatHistory.length > 5 && (
              <Button variant="link" className="w-full">View all history</Button>
             )}
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <KeyRound size={18} />
              API Keys
            </h2>
             <div className="space-y-1.5">
              <Label htmlFor="qwenApiKey">Qwen API Key</Label>
              <Input
                id="qwenApiKey"
                type="password"
                value={config.qwenApiKey}
                onChange={(e) => onConfigChange({ qwenApiKey: e.target.value })}
                placeholder="Enter your Qwen API key"
              />
            </div>
          </div>
           <div className="space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              Appearance
            </h2>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  {config.theme === 'light' ? <Sun size={18}/> : <Moon size={18} />}
                  <Label htmlFor="theme-switch">
                    {config.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </Label>
                </div>
              <Switch
                id="theme-switch"
                checked={config.theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Bot size={18} />
                  <Label htmlFor="qwen3-switch">
                    QWen3
                  </Label>
                </div>
              <Switch
                id="qwen3-switch"
                checked={config.useQwen3}
                onCheckedChange={handleQwen3Change}
              />
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button onClick={handleSave} className="w-full">
          <Save size={16} />
          Save Configuration
        </Button>
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
