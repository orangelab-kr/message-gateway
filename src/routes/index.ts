import { Router } from 'express';
import {
  AccessKeyMiddleware,
  clusterInfo,
  getSendRouter,
  OPCODE,
  Wrapper,
} from '..';

export * from './send';

export function getRouter(): Router {
  const router = Router();

  router.use('/send', AccessKeyMiddleware(), getSendRouter());
  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        ...clusterInfo,
      });
    })
  );

  return router;
}
