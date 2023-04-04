import createHttpError from 'http-errors';

export const NotImplementedHandler = createHttpError(501, 'Handler not implemented', { expose: false });
export const NotImplementedControllerError = createHttpError(501, 'Controller not implemented', { expose: false });
export const InvalidController = createHttpError(500, 'Invalid controller', { expose: false });
export const InvalidHandler = createHttpError(500, 'Invalid controller handler', { expose: false });
export const PathAlreadyExistError = createHttpError(500, 'Path already exist in router', { expose: false });
export const NotFoundError = createHttpError(404, 'Not found', { expose: true });
export const ServerError = createHttpError(500, 'Server error', { expose: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isHttpError = (e: any) => e instanceof createHttpError.HttpError;
