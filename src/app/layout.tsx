'use client';

import './globals.css';
import { Inter, Space_Grotesk, Source_Code_Pro } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import GlobalLoader from '@/components/layout/global-loader';
import AppLayout from '@/app/(app)/layout';
import AuthLayout from './(auth)/layout';
import type { User as AppUser } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontCode = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
});

function RootContent({ children }: { children: React.ReactNode }) {
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
    // This effect handles cases where a user's role might change while they are active.
    // If a logged-in user is found, but they are not an admin, they will be logged out.
    if (!isLoading && firebaseUser && appUser && appUser.role !== 'admin') {
      if (auth) {
        signOut(auth);
      }
    }
  }, [isLoading, firebaseUser, appUser, auth, router]);
  
  if (isLoading) {
    return <GlobalLoader />;
  }

  // If user is logged in and has admin role, show the main app layout.
  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AppLayout>{children}</AppLayout>;
  }

  // For all other cases (not logged in, user doc not found, not an admin),
  // show the authentication layout (login, signup pages).
  return <AuthLayout>{children}</AuthLayout>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontSans.variable,
          fontHeadline.variable,
          fontCode.variable
        )}
      >
        <FirebaseClientProvider>
          <RootContent>{children}</RootContent>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
