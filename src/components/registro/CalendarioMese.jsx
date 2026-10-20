import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { m2h, fmtD, coloreTipologia } from './registroConstants';

// Tinta chiara (alpha) a partire dal colore esadecimale della tipologia
function tinta(hex, a = 0.16) {
  const h = (hex || '#6B7280').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export default function CalendarioMese({ attivita }) {
  const now = new Date();
  const [mese, setMese] = useState(now.getMonth());
  const [anno, setAnno] = useState(now.getFullYear());
  const [selGiorno, setSelGiorno] = useState(null);

  const perData = useMemo(() => {
    const map = {};
    attivita.forEach((v) => {
      if (!v.data) return;
      (map[v.data] = map[v.data] || []).push(v);
    });
    return map;
  }, [attivita]);

  const celle = useMemo(() => {
    const primo = new Date(anno, mese, 1);
    const ultimo = new Date(anno, mese + 1, 0);
    let startDay = primo.getDay() - 1; // Monday=0
    if (startDay < 0) startDay = 6;
    const out = [];
    for (let i = 0; i < startDay; i++) out.push(null);
    for (let d = 1; d <= ultimo.getDate(); d++) {
      const gg = String(d).padStart(2, '0');
      const mm = String(mese + 1).padStart(2, '0');
      out.push(`${anno}-${mm}-${gg}`);
    }
    // completa l'ultima settimana
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [anno, mese]);

  function cambiaMese(dir) {
    setSelGiorno(null);
    let nm = mese + dir;
    let na = anno;
    if (nm < 0) { nm = 11; na--; }
    if (nm > 11) { nm = 0; na++; }
    setMese(nm);
    setAnno(na);
  }

  const totaleMese = useMemo(() => {
    return celle.reduce((s, key) => {
      if (!key) return s;
      const list = perData[key] || [];
      return s + list.reduce((a, v) => a + (v.durata_min || 0), 0);
    }, 0);
  }, [celle, perData]);

  const selList = selGiorno ? (perData[selGiorno] || []) : [];

  return (
    <div className="border border-bordo rounded-[10px] bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-blu flex items-center justify-between">
        <button onClick={() => cambiaMese(-1)} className="text-white p-1 rounded hover:bg-white/20 transition-colors" aria-label="Mese precedente">
          <ChevronLeft size={18} />
        </button>
        <div className="font-display text-sm font-semibold text-white">{MESI[mese]} {anno}</div>
        <button onClick={() => cambiaMese(1)} className="text-white p-1 rounded hover:bg-white/20 transition-colors" aria-label="Mese successivo">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="px-4 py-2 bg-[#E8EEF6] border-b border-bordo text-xs text-grigio">
        Totale ore del mese: <strong className="text-blu">{m2h(totaleMese)}</strong>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-[0.5px] text-grigio font-semibold border-b border-bordo bg-[#E8EEF6]">
        {GIORNI.map((g) => <div key={g} className="py-1.5">{g}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {celle.map((key, i) => {
          if (!key) return <div key={i} className="min-h-[60px] border-b border-r border-bordo bg-[#E8EEF6]" />;
          const list = perData[key] || [];
          const min = list.reduce((s, v) => s + (v.durata_min || 0), 0);
          const day = parseInt(key.split('-')[2], 10);
          const isSel = selGiorno === key;
          const weekend = i % 7 >= 5;
          // Tipologie del giorno (minuti per tipo) — stesso colore usato nelle statistiche
          const perTipo = {};
          list.forEach((v) => {
            const t = v.tipo || 'Altro';
            perTipo[t] = (perTipo[t] || 0) + (v.durata_min || 0);
          });
          const tipiGiorno = Object.entries(perTipo).sort((a, b) => b[1] - a[1]);
          const dominante = tipiGiorno[0] ? tipiGiorno[0][0] : null;
          return (
            <button
              key={i}
              onClick={() => setSelGiorno(isSel ? null : key)}
              style={list.length > 0 ? { backgroundColor: tinta(coloreTipologia(dominante)) } : undefined}
              className={`min-h-[60px] border-b border-r border-bordo p-1 text-left align-top flex flex-col gap-0.5 transition-colors ${
                isSel ? 'ring-1 ring-inset ring-blu' : list.length > 0 ? 'hover:brightness-95' : `${weekend ? 'bg-[#E8EEF6]' : 'bg-white'} hover:bg-blu-light/30`
              }`}
            >
              <span className={`text-[11px] font-semibold ${list.length > 0 ? 'text-blu' : 'text-grigio'}`}>{day}</span>
              {min > 0 && (
                <>
                  <span className="text-[10px] font-semibold text-foreground leading-tight">{m2h(min)}</span>
                  <span className="text-[9px] text-grigio leading-tight">{list.length} att.</span>
                </>
              )}
              {tipiGiorno.length > 0 && (
                <span className="flex gap-0.5 flex-wrap mt-auto">
                  {tipiGiorno.slice(0, 4).map(([t]) => (
                    <span key={t} className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: coloreTipologia(t) }} title={t} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selGiorno && (
        <div className="border-t border-bordo bg-[#E8EEF6] p-3">
          <div className="text-xs font-semibold text-blu mb-2">Attività del {fmtD(selGiorno)}</div>
          {selList.length === 0 ? (
            <div className="text-xs text-grigio italic">Nessuna attività in questo giorno</div>
          ) : (
            <div className="space-y-1">
              {selList.map((v) => (
                <div key={v.id} className="flex items-center gap-2 text-xs bg-white border border-bordo rounded px-2 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: coloreTipologia(v.tipo) }} title={v.tipo} />
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap ${v.sezione === 'a' ? 'bg-blu-light text-blu' : 'bg-oro-light text-[#3A5A85]'}`}>
                    {v.sezione === 'a' ? 'lett. a' : 'lett. b'}
                  </span>
                  <span className="text-grigio whitespace-nowrap">{v.inizio}–{v.fine}</span>
                  <span className="flex-1 truncate text-foreground" title={v.tipo}>{v.tipo}</span>
                  {v.note && <span className="text-grigio text-[10px] truncate hidden sm:inline select-text">{v.note}</span>}
                  <span className="font-semibold text-foreground whitespace-nowrap">{m2h(v.durata_min)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}