'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { User as AppUser } from '@/types/user';
import { doc } from 'firebase/firestore';

const AppUserContext = createContext<AppUser | null>(null);

export const useAppUser = () => useContext(AppUserContext);

/**
 * 이 컴포넌트는 모든 인증 및 권한 부여가 확인된 후에만 렌더링됩니다.
 * 검증된 appUser 객체를 prop으로 받아 컨텍스트와 UI를 설정합니다.
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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!firebaseUser || !appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth);
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);

  if (isLoading) {
    return <GlobalLoader />;
  }

  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
  }

  return <GlobalLoader />;
}
