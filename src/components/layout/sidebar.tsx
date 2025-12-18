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
import { Wifi, KeyRound, Save, Bot } from 'lucide-react';

type Config = {
  deviceId: string;
  apiKey: string;
};

type AppSidebarProps = {
  config: Config;
  onConfigChange: (newConfig: Partial<Config>) => void;
};

const AppSidebar: FC<AppSidebarProps> = ({ config, onConfigChange }) => {
  const { toast } = useToast();

  const handleSave = () => {
    onConfigChange(config);
    toast({
      title: "Configuration Saved",
      description: "Your settings have been successfully saved.",
    });
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
