export const MAX_ORE = 40 * 60; // 40 ore in minuti

export const TIPI_A = [
  'Collegio Docenti',
  'Riunione disciplinare / dipartimento',
  'Programmazione inizio anno',
  'Verifica fine anno',
  'Consegna pagelle / ricevimento collettivo',
  'Formazione obbligatoria',
  'Formazione sicurezza (D.Lgs. 81/2008)',
  'GLO (Gruppo di Lavoro Operativo)',
  'Commissione / gruppo di lavoro',
  'Altro (lett. a)'
];

export const TIPI_B = [
  'Consiglio di classe (soli docenti)',
  'Consiglio di classe (docenti + genitori)',
  'Interclasse (soli docenti)',
  'Interclasse (docenti + genitori)',
  'Intersezione (soli docenti)',
  'Intersezione (docenti + genitori)',
  'GLO con genitori / specialisti',
  'Consiglio di classe straordinario',
  'Altro (lett. b)'
];

export function t2m(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function m2h(m) {
  const s = m < 0 ? '-' : '';
  const a = Math.abs(m);
  return s + Math.floor(a / 60) + ':' + String(a % 60).padStart(2, '0');
}

export function fmtD(d) {
  if (!d) return '';
  const [y, mo, day] = d.split('-');
  return day + '/' + mo + '/' + y;
}

export function oggi() {
  return new Date().toISOString().split('T')[0];
}

export function suggerisciAnno(anno) {
  try {
    const y = parseInt(anno.split('/')[1], 10);
    return y + '/' + (y + 1);
  } catch (e) {
    return '2026/2027';
  }
}