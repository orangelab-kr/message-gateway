import express from 'express';
import { Database, getRouter, logger } from '.';

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
