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
        // User is logged in, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // User is not logged in, redirect to login page
        router.replace('/login');
      }
    }
  }, [isUserLoading, user, router]);

  // Show a loader while redirecting
  return <GlobalLoader />;
}
