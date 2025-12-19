'use server';

/**
 * 后端 PhoneAgent HTTP 服务地址。
 * 默认指向本机 8001 端口，可以通过环境变量覆盖：
 *   PHONE_AGENT_SERVER_URL="http://your-host:8001"
 */
const PHONE_AGENT_SERVER_URL =
  process.env.PHONE_AGENT_SERVER_URL || 'http://127.0.0.1:8001';

type PhoneAgentResponse = {
  result: string;
};

type DeviceInfo = {
  device_id: string;
  status: string;
  connection_type: string;
  model?: string | null;
};

type DevicesResponse = {
  devices: DeviceInfo[];
};

export async function processUserCommand(
  instruction: string,
  deviceId: string,
): Promise<string> {
  if (!instruction) {
    return 'Please provide an instruction.';
  }
  if (!deviceId) {
    return 'Device ID is not configured. Please set it in the sidebar.';
  }

  try {
    const res = await fetch(`${PHONE_AGENT_SERVER_URL}/api/phone-agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction,
        device_id: deviceId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('PhoneAgent HTTP error:', res.status, text);
      return `Phone agent request failed: ${res.status} ${text}`;
    }

    const data = (await res.json()) as PhoneAgentResponse;
    return data.result ?? 'No result returned from phone agent.';
  } catch (error: any) {
    console.error('Error calling phone agent server:', error);
    return (
      error?.message ||
      'Unexpected error while calling phone agent server. Please check the server logs.'
    );
  }
}

// 获取可用设备列表
export async function getAvailableDevices(): Promise<DeviceInfo[]> {
  try {
    const res = await fetch(`${PHONE_AGENT_SERVER_URL}/api/phone-agent/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to fetch devices:', res.status, text);
      return [];
    }

    const data = (await res.json()) as DevicesResponse;
    return data.devices || [];
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

// 简单的本地摘要逻辑，用于聊天标题
export async function summarizeTitle(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'New Chat';
  }
  // 取前 40 个字符作为标题
  const title = trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed;
  return title;
}

