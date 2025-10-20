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

const students = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: PlaceHolderImages.find((i) => i.id === 'student-avatar-1')
      ?.imageUrl,
    progress: 75,
    lastActivity: '2 hours ago',
    accuracy: 88,
  },
  {
    name: 'Bob Williams',
    email: 'bob@example.com',
    avatar: PlaceHolderImages.find((i) => i.id === 'student-avatar-2')
      ?.imageUrl,
    progress: 45,
    lastActivity: '1 day ago',
    accuracy: 65,
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatar: PlaceHolderImages.find((i) => i.id === 'student-avatar-3')
      ?.imageUrl,
    progress: 92,
    lastActivity: '30 minutes ago',
    accuracy: 95,
  },
  {
    name: 'Diana Miller',
    email: 'diana@example.com',
    avatar: PlaceHolderImages.find((i) => i.id === 'student-avatar-4')
      ?.imageUrl,
    progress: 20,
    lastActivity: '3 days ago',
    accuracy: 50,
  },
];

export default function StudentsPage() {
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
              {students.map((student) => (
                <TableRow key={student.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="w-24" />
                      <span className="text-sm text-muted-foreground">
                        {student.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        student.accuracy > 80
                          ? 'default'
                          : student.accuracy > 60
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {student.accuracy}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {student.lastActivity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
