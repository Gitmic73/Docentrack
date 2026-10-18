import React, { useMemo } from 'react';
import { m2h, MAX_ORE, coloreTipologia, TIPI_A, TIPI_B } from './registroConstants';

function TabellaRiepilogo({ attivita, tipi, titolo, colore }) {
  const righe = useMemo(() => {
    const map = {};
    attivita.forEach((v) => {
      const t = v.tipo || 'Altro';
      if (!map[t]) map[t] = { min: 0, count: 0 };
      map[t].min += v.durata_min || 0;
      map[t].count += 1;
    });
    // Include tutte le tipologie anche se a 0, ordina per minuti desc
    return tipi
      .map((t) => ({ tipo: t, ...map[t] || { min: 0, count: 0 } }))
      .sort((a, b) => b.min - a.min);
  }, [attivita, tipi]);

  const totMin = attivita.reduce((s, v) => s + (v.durata_min || 0), 0);
  const pctTotale = Math.min(100, (totMin / MAX_ORE) * 100);
  const residuo = Math.max(0, MAX_ORE - totMin);
  const eccedenza = Math.max(0, totMin - MAX_ORE);

  return (
    <div className="mb-5 border border-bordo rounded-[10px] overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2" style={{ backgroundColor: colore }}>
        <div className="font-display text-sm font-semibold text-white">{titolo}</div>
        <div className="bg-white/20 text-white rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
          {m2h(totMin)} / 40 ore
        </div>
      </div>

      <div className="h-[5px] bg-black/[0.08]">
        <div
          className={`h-full transition-all duration-500 ${eccedenza > 0 ? 'bg-rosso' : 'bg-oro'}`}
          style={{ width: `${pctTotale}%` }}
        />
      </div>

      <div className="divide-y divide-bordo">
        {righe.map((r) => {
          const pct = totMin > 0 ? (r.min / totMin) * 100 : 0;
          const pctMonte = Math.min(100, (r.min / MAX_ORE) * 100);
          const hasData = r.count > 0;
          return (
            <div key={r.tipo} className={`px-4 py-2.5 flex items-center gap-3 ${!hasData ? 'opacity-40' : ''}`}>
              <span className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: coloreTipologia(r.tipo) }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">{r.tipo}</span>
                  <span className="text-xs font-bold text-blu whitespace-nowrap">{m2h(r.min)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-blu-light rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctMonte}%`, backgroundColor: coloreTipologia(r.tipo) }} />
                  </div>
                  <span className="text-[10px] text-grigio whitespace-nowrap">
                    {r.count} {r.count === 1 ? 'attività' : 'attività'}
                    {hasData && ` · ${pct.toFixed(0)}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2.5 border-t border-bordo bg-[#E8EEF6] flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-grigio">
          Totale: <strong className="text-foreground">{m2h(totMin)}</strong>
          {eccedenza > 0
            ? <> · Eccedenza: <strong className="text-rosso">{m2h(eccedenza)}</strong></>
            : residuo > 0 ? <> · Residuo: <strong className="text-foreground">{m2h(residuo)}</strong></>
            : <> · <strong className="text-verde">Monte ore completato</strong></>}
        </div>
      </div>
    </div>
  );
}

export default function RiepilogoTipologie({ attivitaA, attivitaB }) {
  return (
    <div>
      <TabellaRiepilogo
        attivita={attivitaA}
        tipi={TIPI_A}
        titolo="Riepilogo per tipologia — Lett. a (40 ore)"
        colore="#5B7DB1"
      />
      <TabellaRiepilogo
        attivita={attivitaB}
        tipi={TIPI_B}
        titolo="Riepilogo per tipologia — Lett. b (fino a 40 ore)"
        colore="#3A5A85"
      />
    </div>
  );
}