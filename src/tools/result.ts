import { WrapperResult, WrapperResultLazyProps } from '.';

export function $_$(
  opcode: number,
  statusCode: number,
  message?: string,
  reportable?: boolean
): (props?: WrapperResultLazyProps) => WrapperResult {
  return (lazyOptions: WrapperResultLazyProps = {}) =>
    new WrapperResult({
      opcode,
      statusCode,
      message,
      reportable,
      ...lazyOptions,
    });
}

export const RESULT = {
  /** SAME ERRORS  */
  SUCCESS: $_$(0, 200),
  REQUIRED_ACCESS_KEY: $_$(501, 401, 'REQUIRED_ACCESS_KEY'),
  EXPIRED_ACCESS_KEY: $_$(502, 401, 'EXPIRED_ACCESS_KEY'),
  PERMISSION_DENIED: $_$(503, 403, 'PERMISSION_DENIED'),
  INVALID_ERROR: $_$(504, 500, 'INVALID_ERROR'),
  FAILED_VALIDATE: $_$(505, 400, 'FAILED_VALIDATE'),
  INVALID_API: $_$(506, 404, 'INVALID_API'),
  /** CUSTOM ERRORS */
  CANNOT_FIND_ACCESS_KEY: $_$(507, 404, 'CANNOT_FIND_ACCESS_KEY'),
  CANNOT_FIND_TEMPLATE: $_$(508, 404, 'CANNOT_FIND_TEMPLATE'),
  FAILED_SEND_MESSAGE: $_$(509, 500, 'FAILED_SEND_MESSAGE'),
};
