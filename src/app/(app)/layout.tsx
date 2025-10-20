'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as AppUser } from '@/types/user';
import GlobalLoader from '@/components/layout/global-loader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (firebaseUser) {
        // Since this is an admin-only app, we can assume the role is 'admin'.
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
    return <GlobalLoader />;
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
