import { Injectable } from '@nestjs/common';

@Injectable()
export class ImcCalculatorService {
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
