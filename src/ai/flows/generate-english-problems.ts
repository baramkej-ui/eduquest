'use server';

/**
 * @fileOverview Generates English problems based on specified difficulty and topic.
 *
 * - generateEnglishProblems - A function that generates English problems.
 * - GenerateEnglishProblemsInput - The input type for the generateEnglishProblems function.
 * - GenerateEnglishProblemsOutput - The return type for the generateEnglishProblems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEnglishProblemsInputSchema = z.object({
  difficulty: z
    .string()
    .describe("The difficulty level of the problems (e.g., 'easy', 'medium', 'hard')."),
  topic: z.string().describe('The topic of the problems (e.g., grammar, vocabulary, reading comprehension).'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateEnglishProblemsInput = z.infer<typeof GenerateEnglishProblemsInputSchema>;

const GenerateEnglishProblemsOutputSchema = z.object({
  problems: z.array(z.string()).describe('An array of generated English problems.'),
});
export type GenerateEnglishProblemsOutput = z.infer<typeof GenerateEnglishProblemsOutputSchema>;

export async function generateEnglishProblems(
  input: GenerateEnglishProblemsInput
): Promise<GenerateEnglishProblemsOutput> {
  return generateEnglishProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnglishProblemsPrompt',
  input: {schema: GenerateEnglishProblemsInputSchema},
  output: {schema: GenerateEnglishProblemsOutputSchema},
  prompt: `You are an expert English teacher. Generate {{numberOfQuestions}} English problems based on the following criteria:

Difficulty: {{{difficulty}}}
Topic: {{{topic}}}

Format each problem as a string in an array. Make sure the problems are diverse.  Do not add solutions.

For example:
[
  "What is the capital of England?",
  "Choose the correct verb: I _____ to the store yesterday.",
  "Write a short paragraph about your favorite hobby.",
]
`,
});

const generateEnglishProblemsFlow = ai.defineFlow(
  {
    name: 'generateEnglishProblemsFlow',
    inputSchema: GenerateEnglishProblemsInputSchema,
    outputSchema: GenerateEnglishProblemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
