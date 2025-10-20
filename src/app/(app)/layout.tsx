'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { BookOpenCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as AppUser } from '@/types/user';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (firebaseUser) {
        // Since this is an admin-only app, we can assume the role is 'admin'.
        // In a multi-role app, you'd fetch this from Firestore.
        setAppUser({ ...firebaseUser, role: 'admin' });
      } else {
        setAppUser(null);
      }
      setLoading(false);
    }
  }, [firebaseUser, isUserLoading]);

  useEffect(() => {
    if (!loading && !appUser) {
      router.push('/');
    }
  }, [appUser, loading, router]);
  
  if (loading || isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <BookOpenCheck className="h-10 w-10 animate-pulse text-primary" />
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your admin space...
          </p>
        </div>
      </div>
    );
  }

  if (!appUser) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={appUser} />
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
