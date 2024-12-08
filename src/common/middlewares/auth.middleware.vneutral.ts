import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddlewareVNeutral implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Validate authn neutral...');
    if (/^\/v[0-9]+/.test(req.path)) {
      next();
    } else {
      if (req.headers['x-api-key'] === 'supersafevn') {
        next();
        console.log('Authn authenticated...');
      } else {
        res.sendStatus(401);
      }
    }
  }
}
