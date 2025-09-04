'use server';

/**
 * @fileOverview A customer support chatbot for answering questions about internet plans and coverage.
 *
 * - customerSupportChatbot - A function that handles the chatbot conversation.
 * - CustomerSupportChatbotInput - The input type for the customerSupportChatbot function.
 * - CustomerSupportChatbotOutput - The return type for the customerSupportChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerSupportChatbotInputSchema = z.object({
  query: z.string().describe('The user query.'),
});
export type CustomerSupportChatbotInput = z.infer<typeof CustomerSupportChatbotInputSchema>;

const CustomerSupportChatbotOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type CustomerSupportChatbotOutput = z.infer<typeof CustomerSupportChatbotOutputSchema>;

export async function customerSupportChatbot(input: CustomerSupportChatbotInput): Promise<CustomerSupportChatbotOutput> {
  return customerSupportChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerSupportChatbotPrompt',
  input: {schema: CustomerSupportChatbotInputSchema},
  output: {schema: CustomerSupportChatbotOutputSchema},
  prompt: `You are a customer support chatbot for Velpro Telecom, an internet service provider.

  Answer the following question about our internet plans and coverage:

  Question: {{{query}}}

  Keep your answers concise and friendly.
  If the question is not about internet plans or coverage, respond with that you are only able to answer questions about internet plans or coverage.
  Do not ask for clarification. Do not ask for personally identifiable information.
  Do not make up answers.
  `,
});

const customerSupportChatbotFlow = ai.defineFlow(
  {
    name: 'customerSupportChatbotFlow',
    inputSchema: CustomerSupportChatbotInputSchema,
    outputSchema: CustomerSupportChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
