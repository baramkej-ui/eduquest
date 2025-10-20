export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string | null;
  nationality?: (typeof nationalities)[number];
}

export const nationalities = [
  'S. Korea',
  'Japan',
  'China',
  'Taiwan',
  'Mongol',
  'Thailand',
  'Turkiye',
  'Saudi Arabia',
] as const;
