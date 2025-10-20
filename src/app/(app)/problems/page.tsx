import { ProblemCard } from '@/components/problems/problem-card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const problems = {
  grammar: [
    {
      id: 'g1',
      type: 'multiple-choice',
      question: 'He ___ to the store every day.',
      options: ['go', 'goes', 'is going', 'went'],
      answer: 'goes',
    },
    {
      id: 'g2',
      type: 'fill-in-the-blank',
      question: 'I have ___ my homework.',
      answer: 'done',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      type: 'definition',
      question: 'What is the definition of "ubiquitous"?',
      answer: 'present, appearing, or found everywhere.',
    },
     {
      id: 'v2',
      type: 'multiple-choice',
      question: 'Which word is a synonym for "happy"?',
      options: ['sad', 'joyful', 'angry', 'tired'],
      answer: 'joyful',
    },
  ],
  reading: [
    {
      id: 'r1',
      type: 'comprehension',
      passage:
        'The quick brown fox jumps over the lazy dog. This sentence is a pangram.',
      question: 'What is special about the sentence?',
      answer: 'It contains all letters of the alphabet.',
    },
  ],
};

export default function ProblemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Practice Problems
        </h1>
        <p className="text-muted-foreground">
          Test your knowledge and improve your English skills.
        </p>
      </div>
      <Tabs defaultValue="grammar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
        </TabsList>
        <TabsContent value="grammar" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {problems.grammar.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="vocabulary" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {problems.vocabulary.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reading" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {problems.reading.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
