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