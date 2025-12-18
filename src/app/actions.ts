'use server';

import { translateToAgentCommands } from '@/ai/flows/translate-to-agent-commands';
import { summarizeAgentErrorReports } from '@/ai/flows/summarize-agent-error-reports';
import { summarizeText } from '@/ai/flows/summarize-text';
import { ZodError } from 'zod';

// Mock function to simulate executing ADB commands
async function executeAdbCommands(commands: string, deviceId: string): Promise<string> {
  console.log(`Executing commands on ${deviceId}:\n${commands}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (commands.toLowerCase().includes('error_test')) {
    return `Error Report on device ${deviceId}:
    - Task: Test Error Condition
    - Status: Failed
    - Details: Failed to execute command. Device with ID '${deviceId}' not found or offline. Please check the connection and device ID.
    - Timestamp: ${new Date().toISOString()}
    `;
  }
  if (commands.trim() === '') {
    return `Execution Report on device ${deviceId}:
    - Task: No Operation
    - Status: Success
    - Details: No commands were provided to execute.
    - Timestamp: ${new Date().toISOString()}
    `;
  }

  return `
    Execution Report on device ${deviceId}:
    - Task: Interpreted from commands.
    - Status: Success
    - Details: All commands executed successfully.
    - Output:
      - Opened settings app.
      - Toggled Wi-Fi off.
      - Returned to home screen.
    - Timestamp: ${new Date().toISOString()}
  `;
}


export async function processUserCommand(instruction: string, deviceId: string): Promise<string> {
  if (!instruction) {
    return "Please provide an instruction.";
  }
  if (!deviceId) {
    return "Device ID is not configured. Please set it in the sidebar.";
  }

  try {
    const { commands } = await translateToAgentCommands({ instruction });
    const report = await executeAdbCommands(commands, deviceId);
    const { summary } = await summarizeAgentErrorReports({ reports: report });

    return summary;
  } catch (error) {
    console.error("Error processing user command:", error);
    if (error instanceof ZodError) {
      return "There was an issue with the data format from the AI model. Please try again.";
    }
    return "I'm sorry, I encountered an error trying to process your request. Please check the server console for more details.";
  }
}

export async function summarizeTitle(text: string): Promise<string> {
  try {
    const { summary } = await summarizeText({ text });
    return summary;
  } catch (error) {
    console.error("Error summarizing title:", error);
    return "New Chat";
  }
}
