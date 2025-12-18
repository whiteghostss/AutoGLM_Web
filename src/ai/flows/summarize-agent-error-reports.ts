'use server';
/**
 * @fileOverview Summarizes agent feedback reports to provide a quick understanding of task outcomes and errors.
 *
 * - summarizeAgentErrorReports - A function that summarizes agent feedback reports.
 * - SummarizeAgentErrorReportsInput - The input type for the summarizeAgentErrorReports function.
 * - SummarizeAgentErrorReportsOutput - The return type for the summarizeAgentErrorReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAgentErrorReportsInputSchema = z.object({
  reports: z.string().describe('The agent feedback reports to summarize.'),
});
export type SummarizeAgentErrorReportsInput = z.infer<typeof SummarizeAgentErrorReportsInputSchema>;

const SummarizeAgentErrorReportsOutputSchema = z.object({
  summary: z.string().describe('A summary of the agent feedback reports.'),
});
export type SummarizeAgentErrorReportsOutput = z.infer<typeof SummarizeAgentErrorReportsOutputSchema>;

export async function summarizeAgentErrorReports(input: SummarizeAgentErrorReportsInput): Promise<SummarizeAgentErrorReportsOutput> {
  return summarizeAgentErrorReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAgentErrorReportsPrompt',
  input: {schema: SummarizeAgentErrorReportsInputSchema},
  output: {schema: SummarizeAgentErrorReportsOutputSchema},
  prompt: `You are an expert at summarizing agent feedback reports.

  Please provide a concise summary of the following reports, highlighting the key outcomes and any errors encountered:

  Reports: {{{reports}}}
  `,
});

const summarizeAgentErrorReportsFlow = ai.defineFlow(
  {
    name: 'summarizeAgentErrorReportsFlow',
    inputSchema: SummarizeAgentErrorReportsInputSchema,
    outputSchema: SummarizeAgentErrorReportsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
