"use client";

import { useState, useEffect, useCallback } from 'react';

type Config = {
  deviceId: string;
  apiKey: string;
};

const CONFIG_STORAGE_KEY = 'autoglym-studio-config';

export function useConfig() {
  const [config, setConfig] = useState<Config>({
    deviceId: 'zerotier-device-id',
    apiKey: '',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
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
      } catch (error) {
        console.error("Failed to save config to localStorage", error);
      }
      return updatedConfig;
    });
  }, []);

  return { config, saveConfig, isLoaded };
}
