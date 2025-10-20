'use client';

import { useMemo } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAppUser } from '@/app/(app)/layout';
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

export default function UsersPage() {
  const firestore = useFirestore();
  const currentUser = useAppUser();
  const isAdmin = currentUser?.role === 'admin';

  const usersQuery = useMemoFirebase(
    () =>
      firestore && isAdmin
        ? query(collection(firestore, 'users'), where('role', '==', 'admin'))
        : null,
    [firestore, isAdmin]
  );

  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);
  
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
          Administrator Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all administrators in the system.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Administrator Roster</CardTitle>
          <CardDescription>
            A list of all registered administrators.
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
                            No administrators found.
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
