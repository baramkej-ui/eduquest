'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import type { User as AppUser } from '@/types/user';

const AppUserContext = createContext<AppUser | null>(null);

export const useAppUser = () => useContext(AppUserContext);

/**
 * This inner layout component is rendered only after authentication and authorization are confirmed.
 * It receives the validated appUser object as a prop and sets up the context and UI.
 */
function AuthenticatedLayout({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return (
    <AppUserContext.Provider value={user}>
      <SidebarProvider>
        <AppSidebar user={user} />
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () =>
      firestore && firebaseUser
        ? doc(firestore, 'users', firebaseUser.uid)
        : null,
    [firestore, firebaseUser]
  );

  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const isLoading = isUserLoading || isAppUserLoading;

  // This effect handles redirection for unauthenticated or unauthorized users.
  // It only runs when loading is complete.
  useEffect(() => {
    // Don't do anything while loading.
    if (isLoading) {
      return;
    }

    // If loading is done, and the user is not a valid admin, sign them out and redirect.
    if (!firebaseUser || !appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth); // Ensure any partial login state is cleared
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);

  // 1. While loading, show a global loader.
  // This prevents any UI flash or redirection logic from running prematurely.
  if (isLoading) {
    return <GlobalLoader />;
  }

  // 2. After loading, if the user is a valid admin, render the authenticated layout.
  // We explicitly check all conditions are met before rendering the children.
  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
  }

  // 3. If loading is complete but the user is not a valid admin,
  // show the loader until the useEffect above completes the redirection.
  // This acts as a fallback to prevent rendering a broken UI.
  return <GlobalLoader />;
}
