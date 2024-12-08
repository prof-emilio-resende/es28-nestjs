import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddlewareV2 implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Validate authn v2...');
    if (req.headers['x-api-key'] === 'supersafev2') {
      next();
      console.log('Authn authenticated...');
    } else {
      res.sendStatus(401);
    }
  }
}
