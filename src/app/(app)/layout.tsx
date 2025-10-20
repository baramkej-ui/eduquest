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
    // If auth state is still loading, or we have an auth user but are still fetching their
    // firestore profile, we don't do anything yet. The loading screen will be shown.
    if (isUserLoading || (firebaseUser && isAppUserLoading)) {
      return;
    }

    // After all loading is complete, if there is no firebase user, they are not logged in.
    // Redirect to the login page.
    if (!firebaseUser) {
      router.push('/');
      return;
    }

    // If we have a firebase user and their firestore profile (`appUser`),
    // check their role.
    if (appUser) {
      if (appUser.role !== 'admin') {
        // If the user is not an admin, log them out and redirect.
        if (auth) {
          signOut(auth).then(() => {
            router.push('/');
          });
        }
      }
      // If the user is an admin, they can stay.
    } else if (firebaseUser && !isAppUserLoading) {
        // Edge case: Firebase auth user exists, but Firestore doc doesn't.
        // This could happen if doc creation failed. Log them out.
        if (auth) {
          signOut(auth).then(() => {
            router.push('/');
          });
        }
    }
  }, [firebaseUser, isUserLoading, appUser, isAppUserLoading, auth, router]);

  // Combined loading state:
  // 1. Initial Firebase Auth check is running.
  // 2. We have a Firebase user, but we are still waiting for their profile from Firestore.
  const isLoading = isUserLoading || (firebaseUser && isAppUserLoading);

  if (isLoading) {
    return <GlobalLoader />;
  }

  // At this point, loading is complete.
  // If we don't have a firebaseUser, a redirect to '/' is already in progress.
  // If we have a firebaseUser but no appUser (or they aren't an admin), a logout/redirect
  // is in progress. Showing the loader prevents a layout flash during the redirect.
  if (!firebaseUser || !appUser || appUser.role !== 'admin') {
    return <GlobalLoader />;
  }
  
  // All checks passed, user is an authenticated admin.
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
