import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const scryptAsync = (password: string, salt: Buffer) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
});

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt);
  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, saltHex, keyHex] = encoded.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !keyHex || !/^[a-f\d]+$/i.test(saltHex) || !/^[a-f\d]+$/i.test(keyHex)) return false;
  const expected = Buffer.from(keyHex, 'hex');
  if (expected.length !== 64) return false;
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(actual, expected);
}
