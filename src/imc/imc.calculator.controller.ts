import { Controller, Get, Param, Post, Render } from '@nestjs/common';
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

  @Get('calculadora')
  @Render('imc-form.hbs')
  renderImcForm() {
    return {};
  }

  @Post('calculadora')
  @Render('imc-form.hbs')
  calculateImcForm() {
    return {
      imc: 30,
      imcDescription: 'Obesidade',
    };
  }
}
