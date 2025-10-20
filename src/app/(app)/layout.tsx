'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as AppUser } from '@/types/user';
import GlobalLoader from '@/components/layout/global-loader';
import { doc } from 'firebase/firestore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null),
    [firestore, firebaseUser]
  );
  
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);
  
  useEffect(() => {
    // Wait until the initial user loading from Firebase Auth is complete.
    if (isUserLoading) {
      return;
    }

    // If there's no authenticated user, redirect to login.
    if (!firebaseUser) {
      router.push('/');
      return;
    }

    // If we are still loading the app-specific user data from Firestore, do nothing yet.
    if (isAppUserLoading) {
      return;
    }

    // If after loading, there is still no app user, it might be a new user
    // or data hasn't been created yet. For this app, we assume it's an error
    // or they shouldn't be here, so we redirect.
    // A more robust app might redirect to a profile creation page.
    if (!appUser) {
      router.push('/');
    }

  }, [firebaseUser, appUser, isUserLoading, isAppUserLoading, router]);

  // Show a global loader while either Firebase Auth is initializing or
  // we are fetching the user's profile from Firestore.
  if (isUserLoading || isAppUserLoading) {
    return <GlobalLoader />;
  }

  // If after all loading, there's no appUser, it means the redirect is in progress
  // or something went wrong. Returning null prevents rendering the layout.
  if (!appUser) {
    return <GlobalLoader />;
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
