'use client';

import { getAuth } from 'firebase/auth';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import GlobalLoader from '@/components/layout/global-loader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
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
    // 로딩 중이면 아무것도 하지 않음
    if (isLoading) {
      return;
    }

    // 로그인된 사용자의 ID 토큰을 강제로 새로고침하여 최신 커스텀 클레임을 가져옵니다.
    if (firebaseUser) {
      firebaseUser.getIdToken(true).catch((error) => {
        console.error('Error refreshing ID token:', error);
      });
    }

    // 로딩 완료 후, 인증되지 않았거나 앱 사용자 정보가 없거나 역할이 'admin'이 아니면 로그아웃 처리
    if (!firebaseUser || !appUser || appUser.role !== 'admin') {
      if (auth) {
        signOut(auth);
      }
      router.push('/');
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);

  // 모든 데이터가 로드될 때까지 로더 표시
  if (isLoading || !appUser) {
    return <GlobalLoader />;
  }

  // 검증 통과: firebaseUser 존재, appUser 존재, role === 'admin'
  if (firebaseUser && appUser.role === 'admin') {
    return <AuthenticatedLayout user={appUser}>{children}</AuthenticatedLayout>;
  }

  // 그 외의 경우 (예: 권한 없는 사용자가 접근 시도) 로그인 페이지로 리디렉션될 때까지 로더 표시
  return <GlobalLoader />;
}
