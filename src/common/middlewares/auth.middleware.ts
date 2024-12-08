import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Validate authn...');
    if (req.headers['x-api-key'] === 'supersafe') {
      next();
      console.log('Authn authenticated...');
    } else {
      res.sendStatus(401);
    }
  }
}
