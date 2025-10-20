'use client';

import { BookOpenCheck, Loader2 } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <BookOpenCheck className="h-10 w-10 animate-pulse text-primary" />
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </p>
      </div>
    </div>
  );
}
