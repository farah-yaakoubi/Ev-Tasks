import { mkdirSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../../../', import.meta.url));

export function prepareMediaStorage() {
  const configuredPath = process.env.STORAGE_DIR ?? './var/media';
  const storagePath = isAbsolute(configuredPath) ? configuredPath : resolve(workspaceRoot, configuredPath);
  mkdirSync(storagePath, { recursive: true });
  return storagePath;
}
