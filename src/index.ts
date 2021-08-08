import { Prisma } from '@prisma/client';
import express from 'express';
import { logger } from '.';
import { Template } from './controllers';
import { Provider } from './controllers/providers';
import { getRouter } from './routes';
import { Database } from './tools';

export * from './routes';
export * from './tools';

async function main() {
  const app = express();
  Database.initPrisma();
  logger.info('[System] 시스템을 활성화하고 있습니다.');
  app.use('/v1/message', getRouter());
  app.listen(process.env.WEB_PORT, () => {
    logger.info('[System] 시스템이 준비되었습니다.');
  });
}

main();
