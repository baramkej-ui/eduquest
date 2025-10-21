'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Test } from '@/types/test';
import { PlusCircle, Hourglass, ListOrdered } from 'lucide-react';
import { ProblemList } from './problem-list';
import { ProblemForm } from './problem-form';
import { useState } from 'react';
import { testTypes } from '@/types/test';
import { Skeleton } from '@/components/ui/skeleton';

export default function LevelTestPage() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    testTopic?: string;
  }>({ open: false });

  const firestore = useFirestore();
  const testsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'tests')) : null),
    [firestore]
  );
  const { data: tests, isLoading: testsLoading } =
    useCollection<Test>(testsQuery);

  const getTestTime = (topic: string) => {
    return tests?.find((t) => t.id === topic)?.totalTime || 0;
  };

  const getProblemCount = (topic: string) => {
    // This is a placeholder. A real implementation might get this from a query or another data source.
    // For now, we will get it from the ProblemList component.
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Level Test Management
          </h1>
          <p className="text-muted-foreground">
            Manage questions for each test type.
          </p>
        </div>
      </div>

      {testsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {testTypes.map((testType) => (
            <AccordionItem
              key={testType.id}
              value={testType.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <testType.icon className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <h3 className="text-xl font-semibold font-headline">
                        {testType.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage {testType.title} problems.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground pr-4">
                    <div className="flex items-center gap-2">
                      <Hourglass className="h-4 w-4" />
                      <span>{getTestTime(testType.id)} mins</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t p-6">
                <ProblemList testTopic={testType.id} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {dialogState.open && (
        <ProblemForm
          mode="add"
          testTopic={dialogState.testTopic!}
          onOpenChange={(open) => {
            if (!open) setDialogState({ open: false });
          }}
        />
      )}
    </div>
  );
}
