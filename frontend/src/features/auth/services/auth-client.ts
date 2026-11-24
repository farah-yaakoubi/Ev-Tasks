export interface SessionUser {
  id: string;
  email: string;
  name: string;
  title: string;
  role: 'directeur' | 'collaborateur';
  teamId: string;
  avatarDataUrl?: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Le serveur d’authentification n’est pas démarré ou n’est pas encore relié à MySQL. Utilisez la démonstration en attendant.');
  }
  const body = await response.json().catch(() => ({})) as { error?: string; user?: SessionUser };
  if (!response.ok) throw new Error(body.error || 'La connexion au serveur a échoué.');
  if (!body.user) throw new Error('Le serveur n’a pas renvoyé de session valide. Utilisez la démonstration en attendant.');
  return body as T;
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await readResponse<{ user: SessionUser }>(response);
  return result.user;
}

export async function restoreSession(): Promise<SessionUser | null> {
  try {
    const response = await fetch('/api/auth/session', { credentials: 'include', headers: { Accept: 'application/json' } });
    if (response.status === 401) return null;
    const result = await readResponse<{ user: SessionUser }>(response);
    return result.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
}

export async function uploadAvatar(avatarDataUrl: string): Promise<string> {
  const response = await fetch('/api/auth/avatar', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ avatarDataUrl }),
  });
  const body = await response.json().catch(() => ({})) as { avatarDataUrl?: string; error?: string };
  if (!response.ok || !body.avatarDataUrl) throw new Error(body.error || 'Impossible d’enregistrer la photo.');
  return body.avatarDataUrl;
}

export async function deleteAvatar(): Promise<void> {
  await fetch('/api/auth/avatar', { method: 'DELETE', credentials: 'include' }).catch(() => undefined);
}
