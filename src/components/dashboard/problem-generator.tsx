'use client';

import { generateEnglishProblems } from '@/ai/flows/generate-english-problems';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Problem } from '@/types/problem';

const formSchema = z.object({
  topic: z.string().min(2, { message: 'Topic is required.' }),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numberOfQuestions: z.coerce.number().min(1).max(10),
});

export function ProblemGenerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedProblems, setGeneratedProblems] = useState<string[]>([]);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: 'grammar',
      difficulty: 'easy',
      numberOfQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setGeneratedProblems([]);
    try {
      const result = await generateEnglishProblems(values);
      if (result && result.problems) {
        setGeneratedProblems(result.problems);

        if (firestore) {
          const problemsCollection = collection(firestore, 'problems');
          result.problems.forEach((problemText) => {
            const newProblem: Omit<Problem, 'id'> = {
              topic: values.topic,
              difficulty: values.difficulty,
              questionText: problemText,
              // These are placeholders, a more robust solution would
              // be another AI call to get answers and options
              correctAnswer: 'TBD',
              possibleAnswers: [],
              type: 'fill-in-the-blank' 
            };
            addDocumentNonBlocking(problemsCollection, newProblem);
          });
        }

        toast({
          title: 'Problems Generated & Saved',
          description: `Successfully generated and saved ${result.problems.length} problems.`,
        });
      } else {
        throw new Error('AI did not return any problems.');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Problem Generator
            </CardTitle>
            <CardDescription>
              Use AI to generate new English problems and save them to Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                     <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              Generate & Save
            </Button>
          </CardFooter>
        </form>
      </Form>
      {generatedProblems.length > 0 && (
        <>
          <Separator />
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold">Generated Problems (also saved to Firestore):</h3>
            <ul className="space-y-3 list-decimal list-inside rounded-lg bg-muted/50 p-4">
              {generatedProblems.map((problem, index) => (
                <li key={index} className="text-sm">
                  {problem}
                </li>
              ))}
            </ul>
          </CardContent>
        </>
      )}
    </Card>
  );
}
