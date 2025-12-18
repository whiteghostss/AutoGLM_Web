import { config } from 'dotenv';
config();

import '@/ai/flows/translate-to-agent-commands.ts';
import '@/ai/flows/summarize-agent-error-reports.ts';
import '@/ai/flows/summarize-text.ts';
