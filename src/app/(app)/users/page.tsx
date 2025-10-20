'use client';

import { useMemo } from 'react';
import { useCollection, WithId } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import type { User as AppUser } from '@/types/user';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function UsersPage() {
  const firestore = useFirestore();
  const { user: firebaseUser } = useUser();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isCurrentUserLoading, setIsCurrentUserLoading] = useState(true);

  useEffect(() => {
    if (firestore && firebaseUser) {
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setCurrentUser(docSnap.data() as AppUser);
        }
        setIsCurrentUserLoading(false);
      });
    } else {
      setIsCurrentUserLoading(false);
    }
  }, [firestore, firebaseUser]);
  
  const isAdmin = currentUser?.role === 'admin';

  const usersQuery = useMemoFirebase(
    () =>
      firestore && isAdmin
        ? query(collection(firestore, 'users'))
        : null,
    [firestore, isAdmin]
  );

  const { data: users, isLoading: areUsersLoading } = useCollection<AppUser>(usersQuery);
  
  const isLoading = isCurrentUserLoading || areUsersLoading;

  const getAvatar = (index: number) => {
    const avatarId = `student-avatar-${(index % 4) + 1}`;
    return (
      PlaceHolderImages.find((i) => i.id === avatarId)?.imageUrl ||
      'https://picsum.photos/seed/default/100/100'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          User Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Roster</CardTitle>
          <CardDescription>
            A list of all registered users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">UID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[200px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-32 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && !isAdmin && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    You do not have permission to view users.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && isAdmin &&
                users?.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={getAvatar(index)}
                            alt={user.displayName || 'user'}
                          />
                          <AvatarFallback>
                            {user.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                     <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{user.id}</TableCell>
                  </TableRow>
                ))}
                 {!isLoading && isAdmin && users?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No users found.
                        </TableCell>
                    </TableRow>
                 )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
