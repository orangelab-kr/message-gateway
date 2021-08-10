import { AccessKey, Callback, InternalError, OPCODE, Wrapper } from '..';

export function AccessKeyMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      'x-message-gateway-access-key-id': accessKeyId,
      'x-message-gateway-secret-access-key': secretAccessKey,
    } = req.headers;

    if (
      typeof accessKeyId !== 'string' ||
      typeof secretAccessKey !== 'string'
    ) {
      throw new InternalError(
        '액세스 키가 올바르지 않습니다.',
        OPCODE.INVALID_ACCESS_KEY
      );
    }

    const accessKey = await AccessKey.getAccessKeyOrThrow(
      accessKeyId,
      secretAccessKey
    );

    req.loggined = { accessKey };
    next();
  });
}
