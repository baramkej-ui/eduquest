'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/types/user';


const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Firebase not initialized. Please try again later.',
      });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // After successful sign-in, check the user's role from Firestore.
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const appUser = userDoc.data() as AppUser;
        if (appUser.role === 'admin') {
          // If the user is an admin, proceed to the dashboard.
          toast({
            title: 'Login Successful',
            description: `Welcome back! Redirecting you to the dashboard.`,
          });
          router.push('/dashboard');
        } else {
          // If the user is not an admin, deny access.
          await signOut(auth); // Sign the user out.
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have permission to access this area.',
          });
        }
      } else {
        // This case should ideally not happen if user docs are created on signup.
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'User profile not found.',
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
