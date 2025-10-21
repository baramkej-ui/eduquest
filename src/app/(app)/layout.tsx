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
    // This can happen during initial renders or if context is missing.
    // The component using this hook should handle the null case gracefully.
    return null; 
  }
  return context;
};

// This is the main layout for the authenticated part of the app.
// It assumes that the user is already authenticated and authorized as an admin.
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
  // The root layout already confirmed the user is an admin.
  // Here, we just need to fetch the user's data again to pass down to components.
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

  // This should theoretically not be reached if the root layout is working correctly,
  // but it's a good fallback.
  if (!appUser) {
    // Render a loader or a minimal state while appUser is being fetched or is null
    // This prevents passing null to AuthenticatedLayout which expects a valid user
    return <GlobalLoader />;
  }
  
  return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
}
