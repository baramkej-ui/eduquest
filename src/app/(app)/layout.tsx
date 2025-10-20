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

const AppUserContext = createContext<AppUser | null>(null);

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

  // This effect handles redirection *after* loading is complete and auth state is determined.
  useEffect(() => {
    // Don't do anything while loading.
    if (isLoading) {
      return;
    }

    // If loading is done, and there's no firebase user, or no app user, or the user is not an admin,
    // then sign them out and redirect to login.
    if (!firebaseUser || !appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth); // Ensure any partial login state is cleared
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);


  // 1. While loading, show a global loader.
  if (isLoading) {
    return <GlobalLoader />;
  }

  // 2. After loading, if the user is a valid admin, render the layout.
  if (firebaseUser && appUser && appUser.role === 'admin') {
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

  // 3. If not loading and not a valid admin, show a loader until the useEffect above redirects.
  // This prevents a flash of the dashboard or other content.
  return <GlobalLoader />;
}
