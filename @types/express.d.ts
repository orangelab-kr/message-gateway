import { AccessKeyModel } from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      loggined: {
        accessKey?: AccessKeyModel;
      };
    }
  }
}
