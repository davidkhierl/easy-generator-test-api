import { Request } from 'express';

export const extractJwtFromSession = function (req: Request) {
  return req.session.refresh_token ?? null;
};
