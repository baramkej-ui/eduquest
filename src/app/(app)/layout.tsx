'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { signOut, type User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { User as AppUser } from '@/types/user';
import { doc } from 'firebase/firestore';

const AppUserContext = createContext<AppUser | null>(null);

export const useAppUser = () => useContext(AppUserContext);

/**
 * 이 내부 레이아웃 컴포넌트는 모든 인증 및 권한 부여가 확인된 후에만 렌더링됩니다.
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
    // 로딩이 모두 끝난 후에만 리디렉션 로직을 실행합니다.
    if (isLoading) {
      return;
    }

    // 로딩 완료 후, 유효한 관리자가 아니면 로그아웃 및 리디렉션합니다.
    if (!firebaseUser || !appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth);
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);

  // 1. 모든 데이터(인증, 프로필)가 로드될 때까지 로더를 표시합니다.
  if (isLoading) {
    return <GlobalLoader />;
  }

  // 2. 로딩이 완료되고, 사용자가 유효한 관리자일 경우에만 인증된 레이아웃을 렌더링합니다.
  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
  }

  // 3. 로딩이 완료되었지만 유효한 관리자가 아닌 경우(useEffect가 리디렉션을 처리하기 전),
  // 깨진 UI가 렌더링되는 것을 방지하기 위해 로더를 계속 표시합니다.
  return <GlobalLoader />;
}
