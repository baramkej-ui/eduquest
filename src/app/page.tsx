'use client';

import LoginForm from '@/components/auth/login-form';
import Image from 'next/image';
import { BookOpenCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import GlobalLoader from '@/components/layout/global-loader';

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find((img) => img.id === 'login-bg');
  const { isUserLoading } = useUser();
  const router = useRouter();

  // 사용자의 인증 상태를 확인하는 동안 로더를 표시합니다.
  if (isUserLoading) {
    return <GlobalLoader />;
  }

  // 이 페이지는 로그인하지 않은 사용자에게만 보입니다.
  // 로그인한 사용자에 대한 리디렉션은 (app)/layout.tsx에서 처리합니다.
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
              // 로그인 성공 시 대시보드로 리디렉션하여 
              // (app)/layout.tsx의 보호 로직을 트리거합니다.
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
