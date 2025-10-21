'use client';

import LoginForm from '@/components/auth/login-form';
import Image from 'next/image';
import { BookOpenCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import GlobalLoader from '@/components/layout/global-loader';
import type { User as AppUser } from '@/types/user';

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find((img) => img.id === 'login-bg');
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

  // 보호 로직: layout과 동일 조건으로 체크 (로딩 후 실행)
  useEffect(() => {
    if (!isLoading && firebaseUser && appUser) {
      if (appUser.role === 'admin') {
        // admin이면 dashboard로
        router.replace('/dashboard');
      } else {
        // 비admin이면 signOut 후 폼 재표시 (보안)
        if (auth) {
          signOut(auth);
        }
      }
    }
  }, [isLoading, firebaseUser, appUser, router, auth]);

  // 1. 로딩 중: GlobalLoader
  if (isLoading && firebaseUser) { // firebaseUser가 있을 때만 로딩 표시 (로그인 시도 중)
    return <GlobalLoader />;
  }

  // 2. 인증된 사용자지만 admin 아니면: 이미 useEffect에서 signOut 처리됨. 폼으로 fallback.
  // 이 페이지는 로그인하지 않은 사용자 또는 로그아웃된 사용자를 위한 페이지입니다.

  // 3. 기본: 로그인 폼 표시 (인증 없음 또는 signOut 후)
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpenCheck className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline">EduQuest</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginForm 
            onSuccess={() => {
              router.push('/dashboard');
            }}
          />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            data-ai-hint={loginBg.imageHint}
            width="1200"
            height="1800"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
