'use client';

import { useMemo } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import type { User } from '@/providers/auth-provider';

// This component can be extended to fetch and calculate real progress
function StudentProgress({ userId }: { userId: string }) {
  // Mock data for now
  const progress = Math.floor(Math.random() * 100);
  const accuracy = Math.floor(Math.random() * 40) + 60;
  const lastActivity = `${Math.floor(Math.random() * 59) + 1} minutes ago`;

  return (
    <>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-24" />
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge
          variant={
            accuracy > 80
              ? 'default'
              : accuracy > 60
              ? 'outline'
              : 'destructive'
          }
        >
          {accuracy}%
        </Badge>
      </TableCell>
      <TableCell className="text-right">{lastActivity}</TableCell>
    </>
  );
}

export default function StudentsPage() {
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), where('role', '==', 'student'))
        : null,
    [firestore]
  );

  const { data: students, isLoading } = useCollection<
    Omit<User, 'role' | 'uid'>
  >(studentsQuery);

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
          Students Overview
        </h1>
        <p className="text-muted-foreground">
          Track the progress of your students.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>
            A list of all students in your class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Student</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
                <TableHead className="text-right">Last Active</TableHead>
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-12 mx-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                students?.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={getAvatar(index)}
                            alt={student.displayName || 'student'}
                          />
                          <AvatarFallback>
                            {student.displayName?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <StudentProgress userId={student.id} />
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
