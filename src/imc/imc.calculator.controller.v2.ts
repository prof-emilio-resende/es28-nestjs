import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ImcCalculatorService } from './imc.calculator.service';

@Controller({
  path: 'imc',
  version: ['2', VERSION_NEUTRAL],
})
export class ImcCalculatorControllerV2 {
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
    return {
      data: this.imcSvc.getTable(),
    };
  }

  @Post('calculadora')
  @Render('imc-form.hbs')
  calculateImcForm() {
    return {
      data: this.imcSvc.getTable(),
      imc: 30,
      imcDescription: 'Obesidade',
    };
  }

  @Get('table')
  imcTable() {
    return this.imcSvc.getTable();
  }

  @Get('table/html')
  @Render('imc-table.hbs')
  imcTableHtml() {
    return {
      data: this.imcSvc.getTable(),
    };
  }
}
