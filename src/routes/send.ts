import { Router } from 'express';
import { Provider } from '../controllers';
import { OPCODE, Wrapper } from '../tools';

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
