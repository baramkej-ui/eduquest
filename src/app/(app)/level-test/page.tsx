'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Hourglass } from 'lucide-react';
import { ProblemList } from './problem-list';
import { ProblemForm } from './problem-form';
import { useState } from 'react';
import { testTypes } from '@/types/test';
import type { Test } from '@/types/test';

export default function LevelTestPage() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    testTopic?: string;
  }>({ open: false });

  // Use static data from types/test.ts
  const tests: Test[] = testTypes.map(tt => ({ ...tt, totalTime: 25 })); // Assuming a default time for now

  const getTestTime = (topic: string) => {
    return tests?.find((t) => t.id === topic)?.totalTime || 0;
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
