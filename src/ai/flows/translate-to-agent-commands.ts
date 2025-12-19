'use server';

/**
 * @fileOverview Translates natural language instructions into specific commands for a phone agent.
 *
 * - translateToAgentCommands - A function that translates natural language instructions to agent commands.
 * - TranslateToAgentCommandsInput - The input type for the translateToAgentCommands function.
 * - TranslateToAgentCommandsOutput - The return type for the translateToAgentCommands function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const TranslateToAgentCommandsInputSchema = z.object({
  instruction: z
    .string()
    .describe('The natural language instruction to translate into agent commands.'),
});
export type TranslateToAgentCommandsInput = z.infer<
  typeof TranslateToAgentCommandsInputSchema
>;

const TranslateToAgentCommandsOutputSchema = z.object({
  commands: z
    .string()
    .describe('The agent commands translated from the natural language instruction.'),
});
export type TranslateToAgentCommandsOutput = z.infer<
  typeof TranslateToAgentCommandsOutputSchema
>;

export async function translateToAgentCommands(
  input: TranslateToAgentCommandsInput
): Promise<TranslateToAgentCommandsOutput> {
  return translateToAgentCommandsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateToAgentCommandsPrompt',
  input: {schema: TranslateToAgentCommandsInputSchema},
  output: {schema: TranslateToAgentCommandsOutputSchema},
  prompt: `Translate the following natural language instruction into specific commands that a phone agent can understand and execute. The agent is controlled through ADB and thus the commands should be ADB commands.

Instruction: {{{instruction}}}`,
});

const translateToAgentCommandsFlow = ai.defineFlow(
  {
    name: 'translateToAgentCommandsFlow',
    inputSchema: TranslateToAgentCommandsInputSchema,
    outputSchema: TranslateToAgentCommandsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
