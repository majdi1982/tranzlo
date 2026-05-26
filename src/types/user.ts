export interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  registration: string;
  status: boolean;
  prefs: Record<string, unknown>;
}

export interface Session {
  $id: string;
  userId: string;
  expire: string;
  provider: string;
}
