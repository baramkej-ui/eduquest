import { LucideIcon, PenSquare, BookOpen, Mic, Ear } from 'lucide-react';

export type Test = {
  id: string;
  title: string;
  totalTime: number; // in minutes
  icon: LucideIcon;
};

export const testTypes: {
  id: 'writing' | 'reading' | 'speaking' | 'listening';
  title: string;
  icon: LucideIcon;
}[] = [
  { id: 'writing', title: 'Writing', icon: PenSquare },
  { id: 'reading', title: 'Reading', icon: BookOpen },
  { id: 'speaking', title: 'Speaking', icon: Mic },
  { id: 'listening', title: 'Listening', icon: Ear },
];
