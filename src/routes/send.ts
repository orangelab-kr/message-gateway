import { Router } from 'express';
import { OPCODE, Provider, Wrapper } from '..';

export function getSendRouter() {
  const router = Router();

  router.post(
    '/',
    Wrapper(async (req, res) => {
      await Provider.sendMessage(req.body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
