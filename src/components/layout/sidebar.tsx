"use client";

import type { FC } from 'react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast"
import { Wifi, KeyRound, Save, Bot, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type Config = {
  deviceId: string;
  apiKey: string;
  theme: 'light' | 'dark';
};

type AppSidebarProps = {
  config: Config;
  onConfigChange: (newConfig: Partial<Config>) => void;
};

const AppSidebar: FC<AppSidebarProps> = ({ config, onConfigChange }) => {
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

  return (
    <>
      <SidebarHeader className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" />
          <h1 className="text-lg font-semibold font-headline">AutoGLM Studio</h1>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-4">
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
              <KeyRound size={18} />
              API Keys
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="apiKey">Genkit API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => onConfigChange({ apiKey: e.target.value })}
                placeholder="Enter your API key"
              />
              <p className="text-xs text-muted-foreground">Your key is stored locally in your browser.</p>
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
