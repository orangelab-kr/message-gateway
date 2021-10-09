import { AccessKey, RESULT, Wrapper, WrapperCallback } from '..';

export function AccessKeyMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      'x-message-gateway-access-key-id': accessKeyId,
      'x-message-gateway-secret-access-key': secretAccessKey,
    } = req.headers;

    if (
      typeof accessKeyId !== 'string' ||
      typeof secretAccessKey !== 'string'
    ) {
      throw RESULT.CANNOT_FIND_ACCESS_KEY();
    }

    const accessKey = await AccessKey.getAccessKeyOrThrow(
      accessKeyId,
      secretAccessKey
    );

    req.loggined = { accessKey };
    next();
  });
}
