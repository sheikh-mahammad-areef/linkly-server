//  ------------------------------------------------------------------
//  file: src/types/authenticated-request.ts
//  Extended Express Request interface to include authenticated user
//  ------------------------------------------------------------------

import { Request } from 'express';

import { IUser } from '../models/user.model';

export interface AuthenticatedRequest<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: IUser;
}
