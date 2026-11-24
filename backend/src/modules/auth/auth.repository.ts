export interface AuthAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  title: string;
  role: 'DIRECTOR' | 'COLLABORATOR';
  teamId: string;
  isActive: boolean;
  avatarPath?: string | null;
}

export interface SessionAccount extends Omit<AuthAccount, 'passwordHash' | 'isActive'> {}

export interface AuthRepository {
  findAccountByEmail(email: string): Promise<AuthAccount | null>;
  createSession(accountId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findSession(tokenHash: string, now: Date): Promise<{ id: string; account: SessionAccount } | null>;
  revokeSession(tokenHash: string, revokedAt: Date): Promise<void>;
}
