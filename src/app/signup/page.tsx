import SignupForm from '@/components/auth/signup-form';
import Image from 'next/image';
import { BookOpenCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SignupPage() {
  const signupBg = PlaceHolderImages.find((img) => img.id === 'signup-bg');

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
              Create an account to start your learning journey
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {signupBg && (
          <Image
            src={signupBg.imageUrl}
            alt={signupBg.description}
            data-ai-hint={signupBg.imageHint}
            width="1200"
            height="1800"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
