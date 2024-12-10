import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    console.log('Iniciando middleware, chamando proximo fluxo...');
    next();
    console.log('Finalizado middleware, respondendo request...');
  }
}
