import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class AuthMiddlewareV2 implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('authorizing endpoint middleware...');
    if (req.headers['x-api-key'] === 'secret2') {
      next();
      console.log('processamento autenticado (x-api-key) concluído.');
    } else {
      res.sendStatus(401);
    }
  }
}
