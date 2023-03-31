import createHttpError from 'http-errors';

export const NotImplementedHandler = createHttpError(501, 'Handler not implemented', { expose: false });
export const NotImplementedControllerError = createHttpError(501, 'Controller not implemented', { expose: false });
export const InvalidController = createHttpError(500, 'Invalid controller', { expose: false });
export const InvalidHandler = createHttpError(500, 'Invalid controller handler', { expose: false });
export const PathAlreadyExistError = createHttpError(500, 'Path already exist in router', { expose: false });
