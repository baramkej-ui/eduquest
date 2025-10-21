'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUserType } from '@/types/user';
import { createContext, useContext } from 'react';
import GlobalLoader from '@/components/layout/global-loader';

// 1. Create a context to hold the app user.
const AppUserContext = createContext<AppUserType | null>(null);

// 2. Create a hook to easily access the context.
export const useAppUser = () => {
  const context = useContext(AppUserContext);
  if (context === undefined) {
    // This should not happen if used within AppLayout
    return null; 
  }
  return context;
};

function AuthenticatedLayout({
  user,
  children,
}: {
  user: AppUserType;
  children: React.ReactNode;
}) {
  return (
    <AppUserContext.Provider value={user}>
      <SidebarProvider>
        <AppSidebar />
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


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () =>
      firestore && firebaseUser
        ? doc(firestore, 'users', firebaseUser.uid)
        : null,
    [firestore, firebaseUser]
  );
  
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUserType>(userDocRef);

  const isLoading = isUserLoading || isAppUserLoading;

  if (isLoading) {
    return <GlobalLoader />;
  }

  if (!appUser) {
    // This case should be handled by the root layout redirecting to /login,
    // but as a fallback, we can show a loader or an error.
    return <GlobalLoader />;
  }
  
  return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
}
