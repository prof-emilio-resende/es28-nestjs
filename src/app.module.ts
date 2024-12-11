import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcCalculatorModule } from './imc/imc.calculator.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthMiddlewareV2 } from './middlewares/auth.middleware.v2';
import { AuthMiddlewareNeutral } from './middlewares/auth.middleware.neutral';

@Module({
  imports: [ImcCalculatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });

    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
      version: '1',
    });

    consumer.apply(AuthMiddlewareV2).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
      version: '2',
    });

    consumer.apply(AuthMiddlewareNeutral).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
