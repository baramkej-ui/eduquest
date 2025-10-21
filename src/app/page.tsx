'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import GlobalLoader from '@/components/layout/global-loader';

export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // 사용자가 로그인 되어 있으면 대시보드로 리디렉션
        router.replace('/dashboard');
      } else {
        // 사용자가 로그인 되어 있지 않으면 로그인 페이지로 리디렉션
        router.replace('/login');
      }
    }
  }, [isUserLoading, user, router]);

  // 리디렉션이 일어나는 동안 로더를 표시
  return <GlobalLoader />;
}
