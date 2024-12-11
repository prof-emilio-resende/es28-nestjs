import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class AuthMiddlewareNeutral implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('authorizing endpoint middleware...');

    if (/^\/v[0-9]+/.test(req.path)) {
      next();
    } else {
      if (req.headers['x-api-key'] === 'secretn') {
        next();
        console.log('processamento autenticado (x-api-key) concluído.');
      } else {
        res.sendStatus(401);
      }
    }
  }
}
