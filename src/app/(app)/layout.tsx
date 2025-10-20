'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import type { User as AppUser } from '@/types/user';
import { doc } from 'firebase/firestore';
import { useAuth } from '@/firebase';

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
    // 로딩 중이거나, 이미 유효한 사용자가 있는 경우는 아무것도 하지 않음.
    if (isLoading || (firebaseUser && appUser?.role === 'admin')) {
      return;
    }

    // 로딩이 끝났지만, 인증되지 않았거나 관리자가 아닌 경우
    if (!isLoading) {
      if (auth) {
        signOut(auth);
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);

  // 두 데이터가 모두 로드될 때까지는 무조건 로더를 표시
  if (isLoading) {
    return <GlobalLoader />;
  }

  // 모든 검증(로딩 완료, 사용자 존재, 관리자 역할)을 통과한 경우에만 대시보드 UI를 렌더링
  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
  }

  // 위 조건에 해당하지 않는 경우 (리디렉션이 처리되기 전)에도 로더를 표시
  return <GlobalLoader />;
}
