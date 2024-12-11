import { Module } from '@nestjs/common';
import { ImcCalculatorController } from './imc.calculator.controller';
import { ImcCalculatorService } from './imc.calculator.service';
import { ImcCalculatorControllerV2 } from './imc.calculator.controller.v2';

@Module({
  imports: [],
  controllers: [ImcCalculatorController, ImcCalculatorControllerV2],
  providers: [ImcCalculatorService],
})
export class ImcCalculatorModule {}
