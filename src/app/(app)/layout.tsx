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

  // Derive states based on loading and data
  const isLoading = isUserLoading || isAppUserLoading;
  const isLoggedIn = !isLoading && !!firebaseUser;
  const isAdmin = isLoggedIn && !!appUser && appUser.role === 'admin';

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      return;
    }

    // If loading is finished, but user is not logged in, redirect to login
    if (!firebaseUser) {
      router.push('/');
      return;
    }

    // If user is logged in, but is not an admin (no profile or wrong role)
    if (firebaseUser && (!appUser || appUser.role !== 'admin')) {
      if (auth) {
        signOut(auth).then(() => {
          router.push('/');
        });
      }
      return;
    }

  }, [isLoading, firebaseUser, appUser, auth, router]);

  // Show a global loader while loading
  // Or if a redirect is in progress (isLoggedIn is false, or isAdmin is false after login attempt)
  if (isLoading || !isLoggedIn || !isAdmin) {
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
