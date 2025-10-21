'use client';
import { useState } from 'react';
import { useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Problem } from '@/types/problem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProblemForm } from './problem-form';
import { DeleteProblemDialog } from './delete-problem-dialog';
import type { WithId } from '@/firebase/firestore/use-collection';

type DialogState = 
  | { open: false }
  | { open: true; mode: 'add' }
  | { open: true; mode: 'edit'; problem: WithId<Problem> };

type DeleteDialogState =
  | { open: false }
  | { open: true; problem: WithId<Problem> };

export function ProblemList({ testTopic }: { testTopic: string }) {
  const firestore = useFirestore();
  const problemsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, `tests/${testTopic}/problems`))
        : null,
    [firestore, testTopic]
  );
  const { data: problems, isLoading } = useCollection<Problem>(problemsQuery);
  
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({ open: false });

  const handleDelete = (problem: WithId<Problem>) => {
    if (!firestore) return;
    const problemDocRef = doc(firestore, `tests/${testTopic}/problems`, problem.id);
    deleteDocumentNonBlocking(problemDocRef);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <div className="rounded-md border">
          <div className="p-4">
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="p-4 border-t">
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <Button onClick={() => setDialogState({ open: true, mode: 'add' })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Problem
        </Button>
      <div className="rounded-md border">
        {problems?.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
                No problems found for this test. Add one to get started.
            </p>
        )}
        {problems && problems.length > 0 && (
             <ul className="divide-y">
                {problems?.map((p, index) => (
                    <li key={p.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-muted-foreground">{index + 1}.</span>
                            <p className="text-sm">{p.questionText}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, mode: 'edit', problem: p })}>
                                Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setDeleteDialogState({ open: true, problem: p })} className="text-destructive">
                                Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                ))}
            </ul>
        )}
      </div>

       {dialogState.open && (
         <ProblemForm
           key={dialogState.mode === 'edit' ? dialogState.problem.id : 'add'}
           mode={dialogState.mode}
           problem={dialogState.mode === 'edit' ? dialogState.problem : undefined}
           testTopic={testTopic}
           onOpenChange={(open) => !open && setDialogState({ open: false })}
         />
       )}
       {deleteDialogState.open && (
          <DeleteProblemDialog
            problem={deleteDialogState.problem}
            onConfirm={() => {
              handleDelete(deleteDialogState.problem);
              setDeleteDialogState({ open: false });
            }}
            onOpenChange={(open) => !open && setDeleteDialogState({ open: false })}
          />
       )}
    </div>
  );
}
