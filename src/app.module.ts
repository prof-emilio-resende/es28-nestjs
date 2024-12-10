import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcCalculatorModule } from './imc/imc.calculator.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ImcCalculatorController } from './imc/imc.calculator.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [ImcCalculatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ImcCalculatorController);
    consumer.apply(LoggerMiddleware).forRoutes(ImcCalculatorController);
  }
}
