import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { m2h, coloreTipologia } from './registroConstants';

export default function PieChartTipologie({ attivita, titolo }) {
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
      <div className="flex flex-col md:flex-row items-center gap-4 min-w-0">
        <div className="w-full md:w-[220px] h-[220px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={84}
                innerRadius={40}
                paddingAngle={1}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={coloreTipologia(d.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${m2h(value)} (${totale ? ((value / totale) * 100).toFixed(1) : 0}%)`, 'Ore']}
                contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d5dd', maxWidth: '220px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-full min-w-0">
          <div className="text-xs text-grigio mb-2.5 pb-2 border-b border-bordo">
            Totale ore: <strong className="text-foreground">{m2h(totale)}</strong> · {data.length} tipologie
          </div>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            {data.map((d, i) => {
              const pct = totale ? ((d.value / totale) * 100).toFixed(1) : 0;
              return (
                <div key={d.name} className="flex items-center gap-2 text-xs min-w-0">
                  <span className="w-3 h-3 rounded-sm shrink-0 cursor-help" style={{ background: coloreTipologia(d.name) }} title={d.name} />
                  <span className="flex-1" />
                  <span className="text-grigio whitespace-nowrap font-semibold shrink-0">{pct}%</span>
                  <span className="text-foreground whitespace-nowrap w-12 text-right shrink-0">{m2h(d.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}