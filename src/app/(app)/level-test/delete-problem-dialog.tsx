'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { WithId } from '@/firebase/firestore/use-collection';
import type { Problem } from '@/types/problem';

interface DeleteProblemDialogProps {
  problem: WithId<Problem>;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProblemDialog({
  problem,
  onConfirm,
  onOpenChange,
}: DeleteProblemDialogProps) {
  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            problem: <strong className="text-foreground">"{problem.questionText}"</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
