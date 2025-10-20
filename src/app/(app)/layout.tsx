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
    // If auth state is still loading, do nothing.
    if (isUserLoading) {
      return;
    }

    // After auth loading is complete, if there is no user, redirect to login.
    if (!firebaseUser) {
      router.push('/');
    }
  }, [firebaseUser, isUserLoading, router]);

  // Combined loading state:
  // 1. Initial Firebase Auth check is running.
  // 2. We have a Firebase user, but we are still waiting for their profile from Firestore.
  const isLoading = isUserLoading || (firebaseUser && isAppUserLoading);

  if (isLoading) {
    return <GlobalLoader />;
  }

  // If loading is complete and we still don't have a user, a redirect is in progress.
  // Showing the loader prevents a flash of the layout.
  // Also, if a Firebase user exists but their Firestore profile doesn't (e.g., deleted from DB),
  // we treat it as an invalid state and show loader while redirecting (which useEffect handles).
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
