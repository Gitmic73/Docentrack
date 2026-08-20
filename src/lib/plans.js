export const PIANI = {
  free: { id: 'free', label: 'Base', prezzo: 0, desc: 'Anno scolastico in corso gratuito' },
  annuale: { id: 'annuale', label: 'Rinnovo annuale', prezzo: 1.99, desc: 'Sblocca un nuovo anno scolastico' },
  permanente: { id: 'permanente', label: 'Licenza permanente', prezzo: 4.99, desc: 'Tutti gli anni scolastici, per sempre' },
};

export const PREZZO_RIMOZIONE_ADS = 0.99;

// Anno scolastico (1 settembre - 31 agosto) contenente la data
export function schoolYearFromDate(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth(); // 0-11
  return m >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export function canCreateYear(anno, { piano, anno_gratuito, anni_licenza }) {
  if (piano === 'permanente') return true;
  if (anno === anno_gratuito) return true;
  if (Array.isArray(anni_licenza) && anni_licenza.includes(anno)) return true;
  return false;
}

export function pianoLabel(piano) {
  return (PIANI[piano] || PIANI.free).label;
}

export function fmtPrezzo(p) {
  return `€ ${p.toFixed(2).replace('.', ',')}`;
}