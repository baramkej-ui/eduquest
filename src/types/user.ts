export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
  nationality?: string;
}
