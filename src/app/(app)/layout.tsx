'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useFirestore, useMemoFirebase, useAuth, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, createContext, useContext } from 'react';
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
  
  useEffect(() => {
    // Wait until both Firebase Auth and Firestore profile loading are complete.
    if (isUserLoading || isAppUserLoading) {
      return;
    }

    // After loading, if there's no Firebase user, they are not logged in. Redirect.
    if (!firebaseUser) {
      router.push('/');
      return;
    }

    // If a Firebase user exists but their Firestore document (`appUser`) doesn't,
    // or if their role is not 'admin', they are not authorized.
    if (!appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth).then(() => {
          router.push('/');
        });
      }
      return;
    }

    // All checks passed, the user is an authenticated admin.
  }, [firebaseUser, appUser, isUserLoading, isAppUserLoading, auth, router]);

  // Show a global loader while either auth state or user profile is loading.
  const isLoading = isUserLoading || isAppUserLoading;

  if (isLoading) {
    return <GlobalLoader />;
  }

  // If loading is complete but authentication checks failed (and a redirect is in progress),
  // continue showing the loader to prevent a flash of the unauthorized layout.
  if (!firebaseUser || !appUser || appUser.role !== 'admin') {
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
