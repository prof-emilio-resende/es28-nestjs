import { Controller, Get, Param } from '@nestjs/common';
import { ImcCalculatorService } from './imc.calculator.service';

@Controller('imc')
export class ImcCalculatorController {
  constructor(private readonly imcSvc: ImcCalculatorService) {}

  @Get('hello')
  getHello(): object {
    return [{ message: 'Olá mundo!' }];
  }

  @Get(':nr/translate')
  translate(@Param('nr') nr: number): string {
    return this.imcSvc.translate(nr);
  }
}
