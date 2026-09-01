export const MAX_ORE = 40 * 60; // 40 ore in minuti

export const TIPI_A = [
  'Collegio Docenti',
  "Collegio d'Ordine",
  'Riunione dipartimentale / disciplinare',
  'Attività inizio anno / verifica fine anno',
  'Informazione alle famiglie / ricevimento collettivo',
  'Formazione obbligatoria',
  'Formazione sicurezza (D.Lgs. 81/2008)',
  'Altro (lett. a)'
];

export const TIPI_B = [
  'Consiglio di classe (ordinario / straordinario)',
  'Interclasse (scuola primaria)',
  'Intersezione (scuola dell\'infanzia)',
  'GLO (Gruppo di Lavoro Operativo)',
  'Altro (lett. b)'
];

export const COLORI_A = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324'];
export const COLORI_B = ['#469990', '#800000', '#808000', '#000075', '#fabed4'];

export const COLORI_TIPI = {};
TIPI_A.forEach((t, i) => { COLORI_TIPI[t] = COLORI_A[i]; });
TIPI_B.forEach((t, i) => { COLORI_TIPI[t] = COLORI_B[i]; });

export function coloreTipologia(nome) {
  return COLORI_TIPI[nome] || '#5a5a5a';
}

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

// Anno scolastico (01/09 - 31/08) contenente la data in formato YYYY-MM-DD
export function annoScolasticoDaData(date) {
  if (!date) return null;
  const y = parseInt(date.slice(0, 4), 10);
  const m = parseInt(date.slice(5, 7), 10);
  if (!y || isNaN(m)) return null;
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

// Verifica che la data rientri nel range dell'anno scolastico (01/09/XXX1 - 31/08/XXX2)
export function dateInAnnoScolastico(date, anno) {
  if (!date || !anno) return true;
  const [y1, y2] = anno.split('/').map(Number);
  if (!y1 || !y2) return true;
  return date >= `${y1}-09-01` && date <= `${y2}-08-31`;
}