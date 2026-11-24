import '../server/config.js';
import { prisma } from '../database/client.js';
import { hashPassword } from '../modules/auth/password.js';

const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;
const name = process.env.INITIAL_ADMIN_NAME?.trim();
const title = process.env.INITIAL_ADMIN_TITLE?.trim() || 'Directeur';
const teamName = process.env.INITIAL_TEAM_NAME?.trim() || 'Direction Marketing';

if (!email || !password || !name) {
  throw new Error('Configurez INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD et INITIAL_ADMIN_NAME dans .env.');
}
if (password.length < 12) throw new Error('INITIAL_ADMIN_PASSWORD doit contenir au moins 12 caractères.');

try {
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw new Error('Un compte existe déjà avec cette adresse e-mail. Aucun mot de passe n’a été modifié.');
  }
  const team = await prisma.team.upsert({ where: { name: teamName }, update: {}, create: { name: teamName } });
  await prisma.user.create({ data: { email, passwordHash: await hashPassword(password), name, title, role: 'DIRECTOR', teamId: team.id } });
  console.log(`Compte directeur créé pour ${email}.`);
} finally {
  await prisma.$disconnect();
}
