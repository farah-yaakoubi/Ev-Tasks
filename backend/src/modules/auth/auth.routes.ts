import { Router, type Request } from 'express';
import { InvalidCredentialsError, AuthService } from './auth.service.js';
import { PrismaAuthRepository } from './prisma-auth.repository.js';
import { writeFile, unlink } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { prisma } from '../../database/client.js';
import { prepareMediaStorage } from '../../server/storage/media-storage.js';

const cookieName = 'ev_session';
const maxAgeSeconds = 7 * 24 * 60 * 60;
const auth = new AuthService(new PrismaAuthRepository());
export const authRoutes = Router();

function readSessionToken(request: Request): string | null {
  const cookies = request.headers.cookie?.split(';') ?? [];
  const entry = cookies.map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`));
  return entry ? decodeURIComponent(entry.slice(cookieName.length + 1)) : null;
}

function setSessionCookie(token: string, secure: boolean) {
  return `${cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure ? '; Secure' : ''}`;
}

function clearSessionCookie(secure: boolean) {
  return `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? '; Secure' : ''}`;
}

const safeUser = (user: { id: string; email: string; name: string; title: string; role: string; teamId: string; avatarPath?: string | null }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  title: user.title,
  role: user.role === 'DIRECTOR' ? 'directeur' : 'collaborateur',
  teamId: user.teamId,
  avatarDataUrl: user.avatarPath ? `/uploads/${encodeURIComponent(user.avatarPath)}` : undefined,
});

authRoutes.post('/api/auth/login', async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!email || !password || email.length > 254 || password.length > 1024) {
    response.status(400).json({ error: 'Saisissez une adresse e-mail et un mot de passe valides.' });
    return;
  }

  try {
    const result = await auth.login(email, password);
    response.setHeader('Set-Cookie', setSessionCookie(result.token, process.env.NODE_ENV === 'production'));
    response.setHeader('Cache-Control', 'no-store');
    response.json({ user: safeUser(result.user), expiresAt: result.expiresAt.toISOString() });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      response.status(401).json({ error: error.message });
      return;
    }
    response.status(503).json({ error: 'Le service de connexion est temporairement indisponible.' });
  }
});

authRoutes.get('/api/auth/session', async (request, response) => {
  const token = readSessionToken(request);
  if (!token) {
    response.status(401).json({ error: 'Session absente.' });
    return;
  }
  try {
    const session = await auth.getSession(token);
    if (!session) {
      response.setHeader('Set-Cookie', clearSessionCookie(process.env.NODE_ENV === 'production'));
      response.status(401).json({ error: 'Session expirée.' });
      return;
    }
    response.setHeader('Cache-Control', 'no-store');
    response.json({ user: safeUser(session.account) });
  } catch {
    response.status(503).json({ error: 'Le service de session est temporairement indisponible.' });
  }
});

authRoutes.post('/api/auth/logout', async (request, response) => {
  const token = readSessionToken(request);
  if (token) {
    try { await auth.logout(token); } catch { /* Le cookie est tout de même supprimé côté navigateur. */ }
  }
  response.setHeader('Set-Cookie', clearSessionCookie(process.env.NODE_ENV === 'production'));
  response.status(204).end();
});

authRoutes.put('/api/auth/avatar', async (request, response) => {
  const token = readSessionToken(request);
  if (!token) {
    response.status(401).json({ error: 'Session absente.' });
    return;
  }
  const session = await auth.getSession(token);
  if (!session) {
    response.status(401).json({ error: 'Session expirée.' });
    return;
  }
  const dataUrl = typeof request.body?.avatarDataUrl === 'string' ? request.body.avatarDataUrl : '';
  const match = /^data:image\/(jpeg|png|gif);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    response.status(400).json({ error: 'Format d’image invalide.' });
    return;
  }
  try {
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 10 * 1024 * 1024) {
      response.status(400).json({ error: 'La photo doit faire moins de 10 Mo.' });
      return;
    }
    const storagePath = prepareMediaStorage();
    const filename = `avatar-${session.account.id}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
    await writeFile(resolve(storagePath, filename), buffer);
    await prisma.user.update({ where: { id: session.account.id }, data: { avatarPath: filename } });
    response.json({ avatarDataUrl: `/uploads/${encodeURIComponent(filename)}` });
  } catch {
    response.status(503).json({ error: 'Impossible d’enregistrer la photo.' });
  }
});

authRoutes.delete('/api/auth/avatar', async (request, response) => {
  const token = readSessionToken(request);
  if (!token) {
    response.status(401).json({ error: 'Session absente.' });
    return;
  }
  const session = await auth.getSession(token);
  if (!session) {
    response.status(401).json({ error: 'Session expirée.' });
    return;
  }
  try {
    const account = await prisma.user.findUnique({ where: { id: session.account.id }, select: { avatarPath: true } });
    if (account?.avatarPath) {
      await unlink(resolve(prepareMediaStorage(), basename(account.avatarPath))).catch(() => undefined);
    }
    await prisma.user.update({ where: { id: session.account.id }, data: { avatarPath: null } });
    response.status(204).end();
  } catch {
    response.status(503).json({ error: 'Impossible de supprimer la photo.' });
  }
});
