import { createHash, randomBytes } from 'node:crypto';
import { verifyPassword } from './password.js';
import type { AuthRepository, SessionAccount } from './auth.repository.js';

const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');

export class InvalidCredentialsError extends Error {}

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async login(emailInput: string, password: string) {
    const email = emailInput.trim().toLowerCase();
    const account = await this.repository.findAccountByEmail(email);
    if (!account || !account.isActive || !(await verifyPassword(password, account.passwordHash))) {
      throw new InvalidCredentialsError('Adresse e-mail ou mot de passe incorrect.');
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + sessionLifetimeMs);
    await this.repository.createSession(account.id, digest(token), expiresAt);
    const { passwordHash: _passwordHash, isActive: _isActive, ...user } = account;
    return { token, expiresAt, user };
  }

  async getSession(token: string): Promise<{ id: string; account: SessionAccount } | null> {
    return this.repository.findSession(digest(token), new Date());
  }

  async logout(token: string): Promise<void> {
    await this.repository.revokeSession(digest(token), new Date());
  }
}
