'use client';

import './globals.css';
import { Inter, Space_Grotesk, Source_Code_Pro } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import GlobalLoader from '@/components/layout/global-loader';
import AppLayout from '@/app/(app)/layout';
import AuthLayout from './(auth)/layout';
import type { User as AppUser } from '@/types/user';
import LoginPage from './(auth)/login/page';

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

  const userDocRef = useMemoFirebase(
    () =>
      firestore && firebaseUser
        ? doc(firestore, 'users', firebaseUser.uid)
        : null,
    [firestore, firebaseUser]
  );

  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);
  const isLoading = isUserLoading || isAppUserLoading;

  if (isLoading) {
    return <GlobalLoader />;
  }

  // If user is logged in AND is an admin, show the main app layout.
  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AppLayout>{children}</AppLayout>;
  }

  // For all other cases (not logged in, user doc not found, not an admin),
  // show the authentication layout (which will contain the login page).
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
