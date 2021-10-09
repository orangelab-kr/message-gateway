import { Router } from 'express';
import { Provider, RESULT, Wrapper } from '..';

export function getSendRouter(): Router {
  const router = Router();

  router.post(
    '/',
    Wrapper(async (req) => {
      await Provider.sendMessage(req.body);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
