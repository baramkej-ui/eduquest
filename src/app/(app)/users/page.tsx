'use client';

import { useMemo, useState } from 'react';
import { useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAppUser } from '@/app/(app)/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User as AppUser, UserRole } from '@/types/user';
import type { WithId } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { UserForm, UserFormProps } from './user-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteUserDialog } from './delete-user-dialog';

type DialogState = 
  | { open: false }
  | { open: true; mode: 'add' }
  | { open: true; mode: 'edit'; user: WithId<AppUser> };

type DeleteDialogState =
  | { open: false }
  | { open: true; user: WithId<AppUser> };

function UserList({ users, role }: { users: WithId<AppUser>[], role: UserRole }) {
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({ open: false });

  const firestore = useFirestore();

  const getAvatar = (index: number) => {
    const avatarId = `student-avatar-${(index % 4) + 1}`;
    return (
      PlaceHolderImages.find((i) => i.id === avatarId)?.imageUrl ||
      'https://picsum.photos/seed/default/100/100'
    );
  };

  const handleDelete = (user: WithId<AppUser>) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.id);
    deleteDocumentNonBlocking(userDocRef);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
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
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setDialogState({ open: true, mode: 'edit', user })}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDeleteDialogState({ open: true, user })} className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                No {role}s found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
       {dialogState.open && (
         <UserForm
           key={dialogState.mode === 'edit' ? dialogState.user.id : 'add'}
           mode={dialogState.mode}
           user={dialogState.mode === 'edit' ? dialogState.user : undefined}
           onOpenChange={(open) => !open && setDialogState({ open: false })}
         />
       )}
       {deleteDialogState.open && (
          <DeleteUserDialog
            user={deleteDialogState.user}
            onConfirm={() => {
              handleDelete(deleteDialogState.user);
              setDeleteDialogState({ open: false });
            }}
            onOpenChange={(open) => !open && setDeleteDialogState({ open: false })}
          />
       )}
    </>
  );
}


export default function UsersPage() {
  const roles: UserRole[] = ['admin', 'teacher', 'student'];
  const firestore = useFirestore();
  const currentUser = useAppUser();
  const isAdmin = currentUser?.role === 'admin';
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });


  const usersQuery = useMemoFirebase(
    () => (firestore && isAdmin ? query(collection(firestore, 'users')) : null),
    [firestore, isAdmin]
  );
  
  const { data: allUsers, isLoading } = useCollection<WithId<AppUser>>(usersQuery);
  
  const usersByRole = useMemo(() => {
    const grouped: Record<UserRole, WithId<AppUser>[]> = {
      admin: [],
      teacher: [],
      student: [],
    };
    if (allUsers) {
      for (const user of allUsers) {
        if (user.role && grouped[user.role]) {
          grouped[user.role].push(user);
        }
      }
    }
    return grouped;
  }, [allUsers]);

  if (!isAdmin && !isLoading) {
    return (
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            User Management
          </h1>
          <p className="text-muted-foreground">
            View and manage users by their role.
          </p>
        </div>
        <Card className="text-center text-muted-foreground py-10">
          You do not have permission to view users.
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            User Management
          </h1>
          <p className="text-muted-foreground">
            View and manage users by their role.
          </p>
        </div>
        <Button onClick={() => setDialogState({ open: true, mode: 'add' })}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              {roles.map((role) => (
                <TabsTrigger key={role} value={role} className="capitalize flex items-center gap-2">
                  <span>{role}</span>
                  {isLoading ? (
                    <Skeleton className="h-5 w-5 rounded-full" />
                  ) : (
                    <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="rounded-full">
                      {usersByRole[role].length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
             {isLoading ? (
               <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
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
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              roles.map((role) => (
                <TabsContent key={role} value={role} className="mt-6">
                  <UserList users={usersByRole[role]} role={role} />
                </TabsContent>
              ))
            )}
          </Tabs>
        </CardContent>
      </Card>
      {dialogState.open && dialogState.mode === 'add' && (
        <UserForm 
          mode="add"
          onOpenChange={(open) => !open && setDialogState({ open: false })}
        />
      )}
    </div>
  );
}
