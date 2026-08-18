import React, { useMemo } from 'react';
import { m2h, coloreTipologia } from './registroConstants';

export default function BarChartTipologie({ attivita, titolo }) {
  const data = useMemo(() => {
    const map = {};
    attivita.forEach((v) => {
      const t = v.tipo || 'Altro';
      map[t] = (map[t] || 0) + (v.durata_min || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [attivita]);

  const totale = data.reduce((s, d) => s + d.value, 0);
  const max = data.length ? data[0].value : 0;

  if (data.length === 0) {
    return (
      <div className="border border-bordo rounded-[10px] bg-white p-4 shadow-sm text-center py-8 text-grigio italic text-sm">
        Nessuna attività da visualizzare
      </div>
    );
  }

  return (
    <div className="border border-bordo rounded-[10px] bg-white p-4 shadow-sm overflow-hidden">
      {titolo && <h3 className="font-display text-sm font-semibold text-blu mb-3 border-b border-bordo pb-2">{titolo}</h3>}
      <div className="text-xs text-grigio mb-3">
        Totale ore: <strong className="text-foreground">{m2h(totale)}</strong> · {data.length} tipologie
      </div>
      <div className="space-y-2">
        {data.map((d, i) => {
          const w = max ? (d.value / max) * 100 : 0;
          const share = totale ? ((d.value / totale) * 100).toFixed(1) : 0;
          return (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-[42%] min-w-0 text-xs text-foreground truncate" title={d.name}>{d.name}</div>
              <div className="flex-1 min-w-0 h-5 bg-[#f0f0ee] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500 flex items-center justify-end pr-1"
                  style={{ width: `${Math.max(w, 2)}%`, background: coloreTipologia(d.name) }}
                >
                  {w > 22 && (
                    <span className="text-[10px] font-semibold text-white whitespace-nowrap">{share}%</span>
                  )}
                </div>
              </div>
              <div className="w-[58px] text-right text-xs font-semibold text-foreground whitespace-nowrap">{m2h(d.value)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}