'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import GlobalLoader from '@/components/layout/global-loader';

/**
 * This is the entrypoint of the app.
 * It checks the auth state and redirects the user to the appropriate page.
 */
export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // User is logged in, redirect to the dashboard.
        router.replace('/dashboard');
      } else {
        // User is not logged in, redirect to the login page.
        router.replace('/login');
      }
    }
  }, [isUserLoading, user, router]);

  // Show a global loader while we determine the user's auth state.
  return <GlobalLoader />;
}
