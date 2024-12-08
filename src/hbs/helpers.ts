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
