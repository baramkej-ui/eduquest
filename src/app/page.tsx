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
  const auth = useAuth();  // signOut 필요 시 사용
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

  // 보호 로직은 layout에서 동일 체크로 유지하되, page.tsx에선 리디렉션 로직 제거
  // 로그인 성공 시 onSuccess로 리디렉션 처리
  
  // 1. 로딩 중: GlobalLoader
  if (isLoading) {
    return <GlobalLoader />;
  }

  // 2. 인증된 사용자이지만 admin 여부 확인 및 필요 시 signOut은 layout에서 이미 처리됨
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
              // 로그인 성공 시 대시보드로 직접 리디렉션
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
