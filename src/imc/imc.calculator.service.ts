import { Injectable } from '@nestjs/common';

@Injectable()
export class ImcCalculatorService {
  getTable() {
    return {
      Magreza: 0.0,
      Normal: 18.5,
      Sobrepeso: 24.9,
      Obesidade: 30.0,
    };
  }

  calculate(height: number, weight: number): number {
    return weight / height ** height;
  }

  translate(imc: number): string {
    console.log(imc);
    if (imc < 18.5) return 'Magreza';
    if (imc < 24.9) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    else return 'Obesidade';
  }
}
