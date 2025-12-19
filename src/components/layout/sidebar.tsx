"use client";

import type { FC } from 'react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useToast } from "../../hooks/use-toast"
import { Wifi, KeyRound, Save, Bot, Sun, Moon, History, PlusSquare, MessageSquare, RefreshCw } from 'lucide-react';
import { Switch } from '../ui/switch';
import type { Chat } from '../../lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAvailableDevices } from '../../app/actions';
import { useState, useEffect } from 'react';

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

type DeviceInfo = {
  device_id: string;
  status: string;
  connection_type: string;
  model?: string | null;
};

const AppSidebar: FC<AppSidebarProps> = ({ config, onConfigChange, onNewChat, chatHistory, onSwitchChat }) => {
  const { toast } = useToast();
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

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

  const loadDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const devices = await getAvailableDevices();
      setAvailableDevices(devices);
      if (devices.length === 0) {
        toast({
          title: "No devices found",
          description: "No ADB devices are currently connected.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
      toast({
        title: "Error",
        description: "Failed to load device list. Please check if the backend server is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    // Load devices on mount
    loadDevices();
  }, []);

  const handleDeviceSelect = (deviceId: string) => {
    if (deviceId === '__manual__') {
      onConfigChange({ deviceId: '' });
    } else {
      onConfigChange({ deviceId });
      toast({
        title: "Device selected",
        description: `Selected device: ${deviceId}`,
      });
    }
  };

  const isManualInput = !availableDevices.some(d => d.device_id === config.deviceId) && config.deviceId !== '';

  const getDeviceDisplayName = (device: DeviceInfo) => {
    const statusIcon = device.status === 'device' ? '✓' : '✗';
    const typeLabel = device.connection_type === 'usb' ? 'USB' : 
                     device.connection_type === 'wifi' ? 'WiFi' : 
                     device.connection_type === 'remote' ? 'Remote' : '';
    const modelInfo = device.model ? ` (${device.model})` : '';
    return `${statusIcon} ${device.device_id} [${typeLabel}]${modelInfo}`;
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
              <div className="flex items-center justify-between">
                <Label htmlFor="deviceId">Device ID</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDevices}
                  disabled={isLoadingDevices}
                  className="h-7 px-2"
                >
                  <RefreshCw size={14} className={isLoadingDevices ? "animate-spin" : ""} />
                </Button>
              </div>
              {availableDevices.length > 0 ? (
                <Select
                  value={isManualInput ? '__manual__' : config.deviceId}
                  onValueChange={handleDeviceSelect}
                >
                  <SelectTrigger id="deviceId">
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.map((device) => (
                      <SelectItem key={device.device_id} value={device.device_id}>
                        {getDeviceDisplayName(device)}
                      </SelectItem>
                    ))}
                    <SelectItem value="__manual__">Manual Input...</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              {(availableDevices.length === 0 || isManualInput || config.deviceId === '') && (
                <Input
                  id="deviceId"
                  value={config.deviceId}
                  onChange={(e) => onConfigChange({ deviceId: e.target.value })}
                  placeholder="e.g., 10.173.181.1:5555 or emulator-5554"
                />
              )}
              <p className="text-xs text-muted-foreground">
                {availableDevices.length > 0 
                  ? "Select a device from the list above or enter manually."
                  : "Enter ADB device ID (e.g., IP:port or device serial)."}
              </p>
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
