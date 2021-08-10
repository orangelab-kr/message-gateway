import express from 'express';
import morgan from 'morgan';
import os from 'os';
import {
  AccessKeyMiddleware,
  getSendRouter,
  InternalError,
  logger,
  OPCODE,
  Wrapper,
} from '..';

export * from './send';

export function getRouter() {
  const router = express();

  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/send', AccessKeyMiddleware(), getSendRouter());
  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        mode: process.env.NODE_ENV,
        cluster: hostname,
      });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', 404);
    })
  );

  return router;
}
