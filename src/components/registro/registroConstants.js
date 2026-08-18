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

export const COLORI_A = ['#1a3a6b', '#c9a227', '#1e6b45', '#b03a2e', '#7c4dff', '#00838f', '#e65100', '#5d4037'];
export const COLORI_B = ['#6d4c41', '#ad1457', '#2e7d32', '#455a64', '#0097a7'];

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