import './config.js';
import { prisma } from './prisma.js';
import { app } from './app.js';
import { prepareMediaStorage } from './storage/media-storage.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';
const storagePath = prepareMediaStorage();
const server = app.listen(port, host, () => {
  console.log(`EV TASKS API listening on http://${host}:${port}`);
  console.log(`Media storage directory: ${storagePath}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
