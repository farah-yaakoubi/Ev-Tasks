import { prisma } from '../../database/client.js';
import type { AuthRepository, SessionAccount } from './auth.repository.js';

export class PrismaAuthRepository implements AuthRepository {
  async findAccountByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, name: true, title: true, role: true, teamId: true, isActive: true, avatarPath: true },
    });
  }

  async createSession(accountId: string, tokenHash: string, expiresAt: Date) {
    await prisma.authSession.create({ data: { userId: accountId, tokenHash, expiresAt } });
  }

  async findSession(tokenHash: string, now: Date) {
    const session = await prisma.authSession.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: now } },
      select: { id: true, user: { select: { id: true, email: true, name: true, title: true, role: true, teamId: true, avatarPath: true } } },
    });
    if (!session) return null;
    const account: SessionAccount = { ...session.user, role: session.user.role };
    return { id: session.id, account };
  }

  async revokeSession(tokenHash: string, revokedAt: Date) {
    await prisma.authSession.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt } });
  }
}
