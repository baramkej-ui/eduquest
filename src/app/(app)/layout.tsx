'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { User as AppUser } from '@/types/user';

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

  // 1. Firestore Document Reference 메모이제이션
  const userDocRef = useMemoFirebase(
    () =>
      firestore && firebaseUser
        ? doc(firestore, 'users', firebaseUser.uid)
        : null,
    [firestore, firebaseUser]
  );

  // 2. Firestore로부터 App User 데이터 가져오기
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);
  
  // 3. 통합 로딩 상태 계산
  // isUserLoading: Firebase Auth 인증 상태 로딩
  // isAppUserLoading: Firestore 프로필 정보 로딩
  const isLoading = isUserLoading || (firebaseUser && isAppUserLoading);

  useEffect(() => {
    // 로딩이 진행 중일 때는 아무 작업도 하지 않고 기다립니다.
    if (isLoading) {
      return;
    }

    // 로딩이 완료된 후, 인증 상태 및 권한을 확인합니다.
    const isAuthenticatedAdmin = !!firebaseUser && !!appUser && appUser.role === 'admin';

    if (!isAuthenticatedAdmin) {
      // 관리자로 인증되지 않은 경우 (로그인 안 됨, 프로필 없음, 또는 역할이 admin이 아님)
      // 로그아웃 처리 후 로그인 페이지로 리디렉션합니다.
      if (auth && auth.currentUser) {
          signOut(auth).catch(err => console.error("Sign out failed on redirect:", err));
      }
      router.replace('/'); 
    }
    // 관리자로 인증된 경우에는 아무것도 하지 않고, 아래 렌더링 로직이 UI를 보여줍니다.

  }, [isLoading, firebaseUser, appUser, auth, router]);


  // 5. 렌더링 로직

  // Case 1: 데이터 로딩 중이거나, 리디렉션이 처리되기 전에는 항상 로더를 표시합니다.
  // 이 부분이 경쟁 상태를 방지하는 핵심입니다.
  if (isLoading) {
    return <GlobalLoader />;
  }

  // Case 2: 모든 검증(로딩 완료, 인증 성공, 관리자 권한 확인)을 통과한 경우
  // appUser가 존재하고, 역할이 'admin'인 것이 보장됩니다.
  if (appUser && appUser.role === 'admin') {
    return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
  }

  // Case 3: 검증 실패 후 리디렉션 대기 중
  // useEffect에서 `router.replace('/')`가 호출되었지만, 리디렉션이 완료될 때까지 잠시
  // 이 코드가 실행될 수 있습니다. 이때 UI 깜빡임을 방지하기 위해 로더를 표시합니다.
  return <GlobalLoader />;
}
