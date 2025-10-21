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

  // 사용자가 로그인했고, Firestore 문서가 있으며, 역할이 admin인 경우
  if (firebaseUser && appUser && appUser.role === 'admin') {
    return <AppLayout user={appUser}>{children}</AppLayout>;
  }

  // 그 외 모든 경우 (비로그인, 로딩 실패, 권한 없음 등)
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
