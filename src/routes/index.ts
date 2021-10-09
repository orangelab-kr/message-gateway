import { Router } from 'express';
import {
  AccessKeyMiddleware,
  clusterInfo,
  getSendRouter,
  RESULT,
  Wrapper,
} from '..';

export * from './send';

export function getRouter(): Router {
  const router = Router();

  router.use('/send', AccessKeyMiddleware(), getSendRouter());
  router.get(
    '/',
    Wrapper(async (_req, res) => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  return router;
}
