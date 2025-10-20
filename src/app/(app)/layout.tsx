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
    // Wait until both Firebase Auth and Firestore loading are complete.
    if (!isUserLoading && !isAppUserLoading) {
      // If there's no Firebase user or no corresponding Firestore document after loading,
      // redirect to the login page.
      if (!firebaseUser || !appUser) {
        router.push('/');
      }
    }
  }, [firebaseUser, appUser, isUserLoading, isAppUserLoading, router]);

  // While either Firebase Auth is initializing or we are fetching the user's profile from Firestore,
  // show a global loader.
  if (isUserLoading || isAppUserLoading) {
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