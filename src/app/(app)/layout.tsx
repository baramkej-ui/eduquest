'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
    // Wait until both Firebase Auth and Firestore loading are complete.
    if (!isUserLoading && !isAppUserLoading) {
      // If there's no Firebase user after loading, redirect to login.
      if (!firebaseUser) {
        router.push('/');
      }
      // If there's a Firebase user but no corresponding Firestore document,
      // something is wrong (or they are a new user not yet in the DB).
      // For this app, we'll redirect them. A more robust app might go to a profile setup page.
      else if (!appUser) {
        // This case could happen if the user record in Firestore is deleted
        // but the auth record still exists.
        router.push('/');
      }
    }
  }, [firebaseUser, appUser, isUserLoading, isAppUserLoading, router]);

  // Show a global loader while either Firebase Auth is initializing or
  // we are fetching the user's profile from Firestore.
  if (isUserLoading || isAppUserLoading) {
    return <GlobalLoader />;
  }

  // If after all loading, there's no appUser, it means a redirect is in progress.
  // Rendering the loader prevents a brief flash of the layout.
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
