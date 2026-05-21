export interface DbUser {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DbUser;
  headers: Headers & {
    authorization?: string;
  };
}
