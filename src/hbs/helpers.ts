interface ImcTable extends Record<string, number> {}

export function renderImcTable(table: ImcTable) {
  const template = '<table>[rows]</table>';
  const rows = Object.keys(table)
    .map((key) => {
      return `<tr><td>${key}</td><td>${table[key]}</td></tr>`;
    })
    .join('');

  return template.replace('[rows]', rows);
}
