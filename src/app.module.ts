import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcCalculatorModule } from './imc/imc.calculator.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ImcCalculatorController } from './imc/imc.calculator.controller';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { AuthMiddlewareV2 } from './common/middlewares/auth.middleware.v2';
import { AuthMiddlewareVNeutral } from './common/middlewares/auth.middleware.vneutral';

@Module({
  imports: [ImcCalculatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
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
    consumer.apply(AuthMiddlewareVNeutral).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
    consumer.apply(LoggerMiddleware).forRoutes(ImcCalculatorController);
  }
}
