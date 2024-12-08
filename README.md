# 1. Executando nosso projeto (desenvolvimento)

```bash
npm run start:dev
```

# 2. Construindo a página da tabela IMC

## 2.1 Nova funcionalidade no ImcCalculatorService

```typescript
// imc.calculator.service.ts
getTable() {
  return {
    Magreza: 0.0,
    Normal: 18.5,
    Sobrepeso: 24.9,
    Obesidade: 30.0,
  };
}
```

## 2.2 Expondo novo endpoint (JSON)

```typescript
// imc.calculator.controller.ts
@Get('table')
getImcTable() {
  return this.imcSvc.getTable();
}
```
## 2.3 Expondo novo endpoint (HTML)
```typescript
// imc.calculator.controller.ts
@Get('table/html')
@Render('imc-table')
getImcTableHtml() {
  return { data: this.imcSvc.getTable() };
}
```

```hbs
<!-- views/imc-table.hbs -->
<h1>Tabela de IMC</h1>
<table>
    <tr>
        <th>Início</th><th>Descrição</th>
    </tr>
    {{#each data}}
    <tr>
        <td>{{@key}}</td>
        <td>{{this}}</td>
    </tr>
    {{/each}}
</table>
```

# 3. Adicionando Handlebars helpers
Vamos criar um helper como uma função simples que pode receber parâmetros e devolve uma string

```typescript
// hbs/helper.ts
interface ImcTable extends Record<string, number> {}

export function renderImcTable(obj: ImcTable) {
  const output = `<table>{rows}</table>`;
  const rows = Object.keys(obj)
    .map(
      (propName) => `<tr>
            <td>${propName}</td>
            <td>${obj[propName]}</td>
        </tr>`,
    )
    .join('');

  return output.replace('{rows}', rows);
}
```

Todo helper deve ser registrado para que o handlebars identifique sua funcionalidade


```typescript
// main.ts
import { renderImcTable } from './hbs/helpers';
// ...
hbs.engine({
  extname: 'hbs',
  helpers: { imcTable: renderImcTable },
}),
// ...
```
Basta disponibilizar os dados para nossa página e utilizar o novo helper

```typescript
// imc.calculator.controller.ts
// ...
@Post('calculadora')
@Render('imc-form.hbs')
calculateImcForm() {
  return {
    data: this.imcSvc.getTable(),
    imc: 30,
    imcDescription: 'Obesidade',
  };
}
// ...
```

```hbs
<!-- imc-form.hbs -->
{{#imcTable data}}{{/imcTable}}
<!-- ... -->
{{#if imc}}
    {{imc}} : {{imcDescription}}
{{/if}}
```

# 4. Middlewares
Middlewares vão trabalhar no início e fim da requisição ... criar um middleware permite que ações sejam executadas antes e/ou depois do processamento da requisição.
> Múltiplos middlewares podem ser criados e associados às mesmas requisições, sua ordem será definida pela ordem de registro

```typescript
// common/middlewares/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Before responding request...');
    console.log(req.query);
    next();
    console.log('After responding request...');
  }
}
```

Assim como outros recursos, o middleware precisa ser adicionado à configuração de seu módulo

```typescript
// app.module.ts
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
// ...
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ImcCalculatorController } from './imc/imc.calculator.controller';
// ...
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(ImcCalculatorController);
  }
}
```

Podemos utilizar múltiplos middlewares em associação

```typescript
// common/middlewares/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Validate authn...');
    if (req.headers['x-api-key'] === 'supersafe') {
      next();
      console.log('Authn authenticated...');
    } else {
      res.sendStatus(401);
    }
  }
}
```

```typescript
// app.module.ts
// ...
import { AuthMiddleware } from './common/middlewares/auth.middleware';
// ...
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(AuthMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(LoggerMiddleware).forRoutes(ImcCalculatorController);
}
// ...
```

> podemos testar usando curl com e sem o cabeçalho esperado

```bash
#401
curl --location 'http://localhost:3000/imc/hello'

#200
curl --location 'http://localhost:3000/imc/hello' \
--header 'x-api-key: supersafe' 
```