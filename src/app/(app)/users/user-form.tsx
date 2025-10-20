'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  useFirestore,
  updateDocumentNonBlocking,
  useAuth,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { WithId } from '@/firebase/firestore/use-collection';
import type { User as AppUser, UserRole } from '@/types/user';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const formSchema = z
  .object({
    displayName: z.string().min(2, { message: 'Display name is required' }),
    email: z.string().email(),
    role: z.enum(['admin', 'teacher', 'student']),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    nationality: z.string().min(2, { message: 'Nationality is required' }),
  })
  .refine(
    (data) => {
      // Password check is only required in 'add' mode
      if (formSchema.mode === 'add') {
        return data.password && data.password.length >= 6;
      }
      return true;
    },
    {
      message: 'Password must be at least 6 characters.',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
       // Password check is only required in 'add' mode
      if (formSchema.mode === 'add') {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

// Add a static property to hold the mode
formSchema.mode = 'add' as 'add' | 'edit';


export type UserFormProps = {
  onOpenChange: (open: boolean) => void;
} & (
  | { mode: 'add'; user?: never }
  | { mode: 'edit'; user: WithId<AppUser> }
);

export function UserForm({ mode, user, onOpenChange }: UserFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();
  
  // Set the mode for the schema dynamically
  formSchema.mode = mode;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      role: user?.role || 'student',
      nationality: user?.nationality || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !auth) return;
    setLoading(true);

    try {
      if (mode === 'add') {
        if (!values.password) {
          throw new Error('Password is required to create a new user.');
        }
        
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const newAuthUser = userCredential.user;

        // 2. Create user document in Firestore
        const usersCollection = collection(firestore, 'users');
        const userDocRef = doc(usersCollection, newAuthUser.uid);
        
        const newUser: Omit<AppUser, 'id'> = {
          displayName: values.displayName,
          email: values.email,
          role: values.role,
          nationality: values.nationality,
        };

        setDocumentNonBlocking(userDocRef, newUser);
        
        toast({ title: 'User Added', description: `${values.displayName} has been added.` });

      } else if (mode === 'edit' && user) {
        const userDocRef = doc(firestore, 'users', user.id);
        // For edits, we don't update password or email here.
        // That would require separate, more secure flows.
        const updatedData = {
          displayName: values.displayName,
          role: values.role,
          nationality: values.nationality,
        };
        updateDocumentNonBlocking(userDocRef, updatedData);
        toast({ title: 'User Updated', description: `${values.displayName}'s information has been updated.` });
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `Failed to ${mode} user`,
        description: error.code === 'auth/email-already-in-use' 
          ? 'This email is already in use by another account.'
          : error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Enter the details for the new user.'
              : `Editing information for ${user?.displayName}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} disabled={mode === 'edit'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'add' && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
             <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. South Korean" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Add User' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
