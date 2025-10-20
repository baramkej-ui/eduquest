'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useFirestore, useMemoFirebase, useAuth, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, createContext, useContext, useMemo } from 'react';
import type { User as AppUser } from '@/types/user';
import GlobalLoader from '@/components/layout/global-loader';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Create a context to hold the app user data
const AppUserContext = createContext<AppUser | null>(null);

// Custom hook to access the app user data
export const useAppUser = () => useContext(AppUserContext);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null),
    [firestore, firebaseUser]
  );
  
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);
  
  const isLoading = isUserLoading || isAppUserLoading;

  useEffect(() => {
    // Wait until all loading is complete before making any decisions.
    if (isLoading) {
      return;
    }

    // After loading, if there's no Firebase user, or no app user profile,
    // or the user is not an admin, then sign out and redirect to login.
    if (!firebaseUser || !appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth); // Ensure any partial login state is cleared
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);

  // While loading, or if the user is not a fully authenticated admin yet, show the loader.
  // This prevents rendering the dashboard layout prematurely.
  if (isLoading || !firebaseUser || !appUser || appUser.role !== 'admin') {
    return <GlobalLoader />;
  }

  // All checks passed, render the authenticated admin layout.
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
