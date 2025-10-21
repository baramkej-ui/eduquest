'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { WithId } from '@/firebase/firestore/use-collection';
import type { Problem, ProblemType } from '@/types/problem';
import { Textarea } from '@/components/ui/textarea';

const problemTypes: ProblemType[] = [
  'multiple-choice',
  'fill-in-the-blank',
  'passage-comprehension',
  'audio-comprehension',
  'short-answer',
  'essay',
];

const formSchema = z.object({
  questionText: z.string().min(10, { message: 'Question text is required.' }),
  problemType: z.enum(problemTypes),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correctAnswer: z.string().min(1, { message: 'Correct answer is required.' }),
  possibleAnswers: z.string().optional(),
  passage: z.string().optional(),
});

type ProblemFormProps = {
  testTopic: string;
  onOpenChange: (open: boolean) => void;
} & (
  | { mode: 'add'; problem?: never }
  | { mode: 'edit'; problem: WithId<Problem> }
);

export function ProblemForm({
  mode,
  problem,
  testTopic,
  onOpenChange,
}: ProblemFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: problem?.questionText || '',
      problemType: problem?.problemType || 'multiple-choice',
      difficulty: problem?.difficulty || 'medium',
      correctAnswer: problem?.correctAnswer || '',
      possibleAnswers: problem?.possibleAnswers?.join(', ') || '',
      passage: problem?.passage || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setLoading(true);

    try {
      const collectionPath = `tests/${testTopic}/problems`;
      const problemData: Omit<Problem, 'id'> = {
        ...values,
        topic: testTopic,
        possibleAnswers: values.possibleAnswers
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (mode === 'add') {
        const problemsCollection = collection(firestore, collectionPath);
        addDocumentNonBlocking(problemsCollection, problemData);
        toast({
          title: 'Problem Added',
          description: 'The new problem has been saved.',
        });
      } else if (mode === 'edit' && problem) {
        const problemDocRef = doc(firestore, collectionPath, problem.id);
        updateDocumentNonBlocking(problemDocRef, problemData);
        toast({
          title: 'Problem Updated',
          description: 'The problem has been successfully updated.',
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Failed to ${mode} problem`,
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Problem' : 'Edit Problem'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the test problem.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., What is the past tense of 'run'?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="passage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passage (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter a reading passage if applicable." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="problemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {problemTypes.map(type => <SelectItem key={type} value={type}>{type.replace(/-/g, ' ')}</SelectItem>)}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
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
            </div>
            <FormField
              control={form.control}
              name="correctAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl><Input placeholder="The correct answer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="possibleAnswers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Possible Answers (Optional, comma-separated)</FormLabel>
                  <FormControl><Input placeholder="Answer 1, Answer 2, Answer 3" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Add Problem' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
