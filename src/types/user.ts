export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
}
