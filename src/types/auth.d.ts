
export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'coach';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}
