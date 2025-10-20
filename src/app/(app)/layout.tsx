'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, createContext, useContext } from 'react';
import type { User as AppUser } from '@/types/user';
import GlobalLoader from '@/components/layout/global-loader';
import { doc } from 'firebase/firestore';

// Create a context to hold the app user data
const AppUserContext = createContext<AppUser | null>(null);

// Custom hook to access the app user data
export const useAppUser = () => useContext(AppUserContext);

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
    // Wait until initial auth check is complete.
    if (isUserLoading) {
      return;
    }

    // If auth check is done and there's no firebase user, redirect to login.
    if (!firebaseUser) {
      router.push('/');
      return;
    }

    // If there is a firebase user, but we are still waiting for the appUser profile from Firestore,
    // don't do anything yet. The loader below will handle the UI.
    if (isAppUserLoading) {
      return;
    }

    // If all loading is complete, and we have a firebaseUser but no appUser profile,
    // it's an invalid state (e.g., deleted user), so redirect to login.
    if (firebaseUser && !appUser) {
      router.push('/');
    }
  }, [firebaseUser, appUser, isUserLoading, isAppUserLoading, router]);

  // Show a global loader if:
  // 1. We are checking the initial Firebase auth state.
  // 2. We have a Firebase user but are still fetching their profile from Firestore.
  const isLoading = isUserLoading || (firebaseUser && isAppUserLoading);

  if (isLoading) {
    return <GlobalLoader />;
  }

  // If after all loading, there's still no authenticated user or app profile,
  // it means a redirect is in progress or authentication failed.
  // Rendering the loader prevents a brief flash of the layout.
  if (!firebaseUser || !appUser) {
    return <GlobalLoader />;
  }
  
  // All checks passed, user is authenticated and has a profile.
  return (
    <AppUserContext.Provider value={appUser}>
      <SidebarProvider>
        <AppSidebar user={appUser} />
        <SidebarInset className="flex flex-col">
          <AppHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppUserContext.Provider>
  );
}
