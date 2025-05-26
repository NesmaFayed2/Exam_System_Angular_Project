export interface User {
  id: number;
  email: string;
  role: 'admin' | 'student';
  password?: string;
}
