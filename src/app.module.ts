import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImcCalculatorModule } from './imc/imc.calculator.module';

@Module({
  imports: [ImcCalculatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
