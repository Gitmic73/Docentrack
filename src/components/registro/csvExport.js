import { fmtD, m2h } from './registroConstants';

function csvCell(v) {
  const s = String(v == null ? '' : v);
  if (/[",\n\r;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function esportaCSV({ docente, anno, attivitaA, attivitaB }) {
  const all = [
    ...attivitaA.map((a) => ({ ...a, sez: 'a' })),
    ...attivitaB.map((a) => ({ ...a, sez: 'b' })),
  ].sort((a, b) => (a.data || '').localeCompare(b.data || ''));

  const rows = [['Sezione', 'Data', 'Tipologia', 'Inizio', 'Fine', 'Durata (min)', 'Durata (ore)', 'Note']];
  all.forEach((v) => {
    rows.push([
      v.sez,
      fmtD(v.data),
      v.tipo || '',
      v.inizio || '',
      v.fine || '',
      v.durata_min || 0,
      m2h(v.durata_min || 0),
      v.note || '',
    ]);
  });

  const csv = rows.map((r) => r.map(csvCell).join(';')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Registro_Ore_${anno.replace('/', '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}