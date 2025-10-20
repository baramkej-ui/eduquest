import type { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User extends FirebaseUser {
  role: UserRole;
}
