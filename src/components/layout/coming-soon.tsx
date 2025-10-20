import { Construction } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Construction className="w-16 h-16 mb-4 text-primary" />
      <h1 className="text-4xl font-bold tracking-tight font-headline">
        Coming Soon...
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        This feature is currently under construction.
      </p>
    </div>
  );
}
