import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('authorizing endpoint middleware...');
    if (req.headers['x-api-key'] === 'secret') {
      next();
      console.log('processamento autenticado (x-api-key) concluído.');
    } else {
      res.sendStatus(401);
    }
  }
}
