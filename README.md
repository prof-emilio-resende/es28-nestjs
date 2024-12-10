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

# 5. Versionamento de APIs

Versionar APIs pode ser algo bastante simples, desde que seja decidida uma abordagem única e padronizada para o app

## 5.1 Versionamento por URI (mais comum)

O versionamento através da URI normalmente é feito utilizando parte do PATH para direcionar a requisição, como em:
- http://api.com/v1/endpoint
- http://api.com/v2/endpoint
- http://api.com/latest/endpoint
- http://api.com/endpoint

### Vamos criar as duas versões da nossa API v1 e v2 em controllers diferentes:

```typescript
// imc.calculator.controller.ts
// ...
@Controller({
  path: 'imc',
  version: '1',
})
export class ImcCalculatorController {
// ...
```

```typescript
// main.ts
// ...
app.enableVersioning({
  type: VersioningType.URI,
});
// ...
```

Vamos testar fazendo a chamada contra nossa API com prefixo v1:

```bash
curl --location 'http://localhost:3000/v1/imc/hello' \
--header 'x-api-key: supersafe'
```

O próximo passo será criar uma nova API (uma cópia de nossa V1), para testarmos a co-existência das duas

```typescript
// imc.calculator.controller.v2.ts
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
  version: '2',
})
export class ImcCalculatorControllerV2 {
  constructor(private readonly imcSvc: ImcCalculatorService) {}

  @Get('hello')
  getHello(): object {
    return [{ message: 'Olá mundo v2!' }];
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
      imcDescription: 'Obesidade v2',
    };
  }

  @Get('table')
  getImcTable() {
    return this.imcSvc.getTable();
  }

  @Get('table/html')
  @Render('imc-table')
  getImcTableHtml() {
    return { data: this.imcSvc.getTable() };
  }
}
```

> se quisermos manter a versão sem prefixo de rota apontando para a v2, basta
> adicionarmos essa configuração em @Controller (version), conforme abaixo:
```typescript
// ...
@Controller({
  path: 'imc',
  version: ['2', VERSION_NEUTRAL],
})
export class ImcCalculatorControllerV2 {
// ...
```

Após a criação do novo controller, basta adicioná-lo ao módulo para que ele fique funcional:

```typescript
// imc.calculator.module.ts
// ...
import { ImcCalculatorControllerV2 } from './imc.calculator.controller.v2';
// ...
controllers: [ImcCalculatorController, ImcCalculatorControllerV2],
// ...
```

## 5.2 Configurando middleware por versão

Além das configurações de roteamento, podemos também fazer o vínculo de certos recursos (como middlwares) por rota. Vamos criar mais dois autenticadores:
auth.middleware.v2.ts e auth.middleware.vneutral.ts

```typescript
// auth.middleware.v2.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddlewareV2 implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Validate authn v2...');
    if (req.headers['x-api-key'] === 'supersafev2') {
      next();
      console.log('Authn authenticated...');
    } else {
      res.sendStatus(401);
    }
  }
}
```

> A criação do autenticador para recurso neutro deve contar com um melhor "conhecimento" de como a aplicação funciona, ou seja, entender e reagir à forma como a aplicação versiona seus endpoints e quais abordagens válidas.
```typescript
// auth.middleware.vneutral.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddlewareVNeutral implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Validate authn neutral...');
    // neste ponto validamos que a requisição não possui prefixo de versionamento no path (v1/v2/etc...)
    if (/^\/v[0-9]+/.test(req.path)) {
      next();
    } else {
      if (req.headers['x-api-key'] === 'supersafevn') {
        next();
        console.log('Authn authenticated...');
      } else {
        res.sendStatus(401);
      }
    }
  }
}
```

## Registrando nossos middlewares corretamente
```typescript
// app.module.ts
// ...
import { AuthMiddlewareV2 } from './common/middlewares/auth.middleware.v2';
import { AuthMiddlewareVNeutral } from './common/middlewares/auth.middleware.vneutral';
// ...
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
}
// ...
```

# 6. Autorização com Guards

Guards possuem a responsabilidade de permitir ou não que a requisição seja processada.
Em uma redução simples, a única responsabilidade de um Guard é implementar o método onActivate que vai determinar se o fluxo deve ou não continuar

> Guards vão ser executados depois dos middlewares mas antes de qualquer interceptador (filtro) ou pipe

## Exemplo de Authentication Guard

```typescript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

## 6.1 Implementando autorização com Guard

Para implementar autorização, primeiro vamos fazer a configuração base. Teremos
- enum Role para definir as roles disponíveis (RBAC)
- ROLES_KEY será a constante de acesso às roles
- decorador Roles, uma extensão usando o NestJS para facilitar reflexão

```typescript
// auth/authz.domain.ts
import { SetMetadata } from '@nestjs/common';

export enum Role {
  Reader = 'reader',
  Writer = 'writer',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

Serviço de autenticação que declara chaves vs roles (hardcoded para o exemplo)
```typescript
import { Injectable } from '@nestjs/common';
import { Role } from './authz.domain';

@Injectable()
export class AuthzService {
  private keyRoles = {
    supersafe: [Role.Reader, Role.Writer],
    supersafev2: [Role.Reader, Role.Writer],
    supersafevn: [Role.Reader],
  };

  getRolesFromKey(key: string): Role[] {
    return this.keyRoles[key];
  }
}
```

Declaração simples do módulo de autorização

```typescript
import { Module } from '@nestjs/common';
import { AuthzService } from './authz.service';

@Module({
  providers: [AuthzService],
  exports: [AuthzService],
})
export class AuthzModule {}
```

## Implementando o Guard
A funcionalidade desejada, basicamente consiste em encontrar a chave de API, encontrar as roles associadas e, por fim, 
verificar se o endpoint em execução solicita Roles que não existam para esta chave. 
Do contrário, o processamento segue normalmente.

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from './authz.domain';
import { AuthzService } from './authz.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authzService: AuthzService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'];
    const actualRoles = this.authzService.getRolesFromKey(apiKey);

    const hasAccess = requiredRoles.some((role) => actualRoles.includes(role));

    if (hasAccess) return true;

    throw new ForbiddenException();
  }
}
```

## Utilizando o Guard
Uma vez implementado, agora podemos utilizar nosso Guard para proteger recursos (endpoints) de nosso app

### Primeiro precisamos importar o módulo de autorização
```typescript
// imc/imc.calculator.module.ts
// ...
import { AuthzModule } from '../auth/authz.module';
// ...
imports: [AuthzModule]
// ...
```

> Para proteger o controller, basta usar o Guard e o decorador que criamos

```typescript
// imc/imc.calculator.controller.v2.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
// ...
import { RolesGuard } from '../auth/authz.roles.guard';
import { Role, Roles } from '../auth/authz.domain';
// ...
@UseGuards(RolesGuard)
@Controller ///...
// ...
@Roles(Role.Writer)
@Get('hello')
// ...
```

Para testar, basta fazer a chamada usando o acesso via V2 e via NEUTRAL.

```bash
#200
curl --location 'http://localhost:3000/v2/imc/hello' \
--header 'x-api-key: supersafev2'
```

```bash
#403
curl --location 'http://localhost:3000/imc/hello' \
--header 'x-api-key: supersafevn'
```

# 7. Implementando autenticação

Como última funcionalidade, vamos adicionar o processo de autenticação. Para isso, vamos começar criando um novo módulo, controller e service.

```bash
nest g module authn
nest g controller authn
nest g service authn
```

Vamos utilizar a biblioteca complementar jwt do próprio nest para gerar novos tokens:
```bash
npm install --save @nestjs/jwt
```

E vamos criar o serviço responsável por gerenciar os usuários.
É claro que esta é uma simplificação do processo, sem o devido cuidado com as credenciais de usuários.
```bash
nest g service authn/users
```
```typescript
// authn/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { Role } from '../../auth/authz.domain';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'emilio',
      password: '123@mudar',
      roles: [Role.Writer, Role.Reader],
    },
    {
      userId: 2,
      username: 'resende',
      password: '234@mudar',
      roles: [Role.Reader],
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}

```

Agora, vamos desenvolver o serviço de autenticação que usa o gerenciador de usuários.

```typescript
// authn/authn.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthnService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.userId,
      username: user.username,
      roles: user.roles,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }
}

```

Uma vez desenvolvidos os serviços de autenticação, vamos expor um endpoint para utilizá-lo

```typescript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthnService } from './authn.service';

@Controller('authn')
export class AuthnController {
  constructor(private authService: AuthnService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}

```

A última etapa é configurar o módulo de autenticação
```typescript
// authn/authn.module.ts
import { Module } from '@nestjs/common';
import { AuthnService } from './authn.service';
import { AuthnController } from './authn.controller';
import { UsersService } from './users/users.service';
import { jwtConstants } from './constants';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthnService, UsersService],
  controllers: [AuthnController],
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  exports: [AuthnService],
})
export class AuthnModule {}

```

```typescript
// authn/constants.ts
export const jwtConstants = {
  secret: '123',
  expiresIn: '300s',
};

```

Outro ponto importante será ajustar o nosso middleware de autenticação para não interceptar a rota de login:
```typescript
// common/middlewares/auth.middleware.vneutral.ts
// ...
if (/^\/v[0-9]+/.test(req.path) || req.path.includes('login')) {
  // ...
}
// ...
```

Agora basta importar nosso novo módulo:
```typescript
// app.module.ts
// ...
imports: [ImcCalculatorModule, AuthnModule]
// ...
```

Teste o funcionamento tentando login com diferentes usuários
```bash
curl --location 'http://localhost:3000/authn/login' \
--header 'Content-Type: application/json' \
--data-raw '{"username": "resende", "password": "234@mudar"}'
```

## 7.1 Implementando autenticação via Guard

Basta criar nosso guard e configurar seu uso em um controller para autenticar nossas rotas:

```typescript
// authn/authn.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthnGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

```

Configuração do controller (nova rota):
```typescript
// authn/authn.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
// ...
import { AuthnGuard } from './authn.guard';
// ...
@UseGuards(AuthnGuard)
@Get('profile')
getProfile(@Request() req) {
return req.user;
}
// ...
```

Por fim, podemos testar a chamada:
```bash
curl --location 'http://localhost:3000/authn/login' \
--header 'Content-Type: application/json' \
--data-raw '{"username": "resende", "password": "234@mudar"}'
```

```bash
curl --location 'http://localhost:3000/authn/profile' \
--header 'x-api-key: supersafevn' \
--header 'Authorization: Bearer eyJ...'
```