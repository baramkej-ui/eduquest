'use client';
import { useMemo } from 'react';
import { ProblemCard } from '@/components/problems/problem-card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Problem } from '@/types/problem';
import { Skeleton } from '@/components/ui/skeleton';

function ProblemList({ topic }: { topic: string }) {
  const firestore = useFirestore();
  const problemsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'problems'), where('topic', '==', topic))
        : null,
    [firestore, topic]
  );
  const { data: problems, isLoading } = useCollection<Problem>(problemsQuery);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {problems?.map((p) => (
        <ProblemCard key={p.id} problem={p} />
      ))}
       {problems?.length === 0 && (
          <p className="text-muted-foreground col-span-full">
            No {topic} problems found.
          </p>
        )}
    </div>
  );
}


export default function LevelTestPage() {
  const topics = ['grammar', 'vocabulary', 'reading'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Level Test Problems
        </h1>
        <p className="text-muted-foreground">
          Manage and review level test problems.
        </p>
      </div>
      <Tabs defaultValue="grammar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          {topics.map((topic) => (
            <TabsTrigger key={topic} value={topic} className="capitalize">
              {topic}
            </TabsTrigger>
          ))}
        </TabsList>
        {topics.map((topic) => (
          <TabsContent key={topic} value={topic} className="mt-6">
            <ProblemList topic={topic} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
