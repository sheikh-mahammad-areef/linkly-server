//  ------------------------------------------------------------------
//  file: src/types/express/index.d.ts
//  Extend Express Request interface to include user property
//  ------------------------------------------------------------------

import { IUser } from '../../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export {};
