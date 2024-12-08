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
````
