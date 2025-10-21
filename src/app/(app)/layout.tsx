'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import type { User as AppUser } from '@/types/user';

const AppUserContext = createContext<AppUser | null>(null);

export const useAppUser = () => useContext(AppUserContext);

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

function RedirectToLogin() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This component's only job is to sign out and redirect.
    if (auth) {
      signOut(auth);
    }
    router.replace('/');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render a loader while the redirect is happening.
  return <GlobalLoader />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () =>
      firestore && firebaseUser
        ? doc(firestore, 'users', firebaseUser.uid)
        : null,
    [firestore, firebaseUser]
  );

  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const isLoading = isUserLoading || isAppUserLoading;

  // 1. While any data is loading, show a global loader.
  if (isLoading) {
    return <GlobalLoader />;
  }

  // 2. After loading, if the user is not authenticated OR not an admin,
  // render the RedirectToLogin component which will handle sign-out and redirection.
  if (!firebaseUser || !appUser || appUser.role !== 'admin') {
    return <RedirectToLogin />;
  }
  
  // 3. If all checks pass, render the main authenticated layout.
  return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
}
