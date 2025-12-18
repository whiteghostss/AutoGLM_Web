"use client";

import { useState, useEffect, useCallback } from 'react';

type Config = {
  deviceId: string;
  apiKey: string;
  theme: 'light' | 'dark';
};

const CONFIG_STORAGE_KEY = 'autoglym-studio-config';

export function useConfig() {
  const [config, setConfig] = useState<Config>({
    deviceId: 'zerotier-device-id',
    apiKey: '',
    theme: 'light',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        const newConfig = {
          ...{ theme: 'light' }, // default theme
          ...parsedConfig,
        }
        setConfig(newConfig);
        if (newConfig.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (error) {
      console.error("Failed to load config from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveConfig = useCallback((newConfig: Partial<Config>) => {
    setConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, ...newConfig };
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
        if (newConfig.theme) {
            if (newConfig.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
      } catch (error) {
        console.error("Failed to save config to localStorage", error);
      }
      return updatedConfig;
    });
  }, []);

  return { config, saveConfig, isLoaded };
}
