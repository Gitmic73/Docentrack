import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { m2h } from './registroConstants';

// Mesi dell'anno scolastico in ordine (set → ago)
const MESI = [
  { key: '09', label: 'Set' },
  { key: '10', label: 'Ott' },
  { key: '11', label: 'Nov' },
  { key: '12', label: 'Dic' },
  { key: '01', label: 'Gen' },
  { key: '02', label: 'Feb' },
  { key: '03', label: 'Mar' },
  { key: '04', label: 'Apr' },
  { key: '05', label: 'Mag' },
  { key: '06', label: 'Giu' },
  { key: '07', label: 'Lug' },
  { key: '08', label: 'Ago' },
];

export default function BarChartMensile({ attivitaA = [], attivitaB = [], titolo }) {
  const data = useMemo(() => {
    const map = {};
    MESI.forEach((m) => { map[m.key] = { name: m.label, a: 0, b: 0 }; });
    attivitaA.forEach((v) => {
      if (!v.data) return;
      const m = v.data.slice(5, 7);
      if (map[m]) map[m].a += v.durata_min || 0;
    });
    attivitaB.forEach((v) => {
      if (!v.data) return;
      const m = v.data.slice(5, 7);
      if (map[m]) map[m].b += v.durata_min || 0;
    });
    return MESI.map((m) => map[m.key]);
  }, [attivitaA, attivitaB]);

  const totale = data.reduce((s, d) => s + d.a + d.b, 0);
  const maxMese = data.reduce((mx, d) => Math.max(mx, d.a + d.b), 0);
  const mesePiuCarico = data.reduce((mx, d) => (d.a + d.b > mx.a + mx.b ? d : mx), data[0]);

  if (totale === 0) {
    return (
      <div className="border border-bordo rounded-[10px] bg-white p-4 shadow-sm text-center py-8 text-grigio italic text-sm">
        Nessuna attività da visualizzare
      </div>
    );
  }

  return (
    <div className="border border-bordo rounded-[10px] bg-white p-4 shadow-sm overflow-hidden">
      {titolo && <h3 className="font-display text-sm font-semibold text-blu mb-3 border-b border-bordo pb-2">{titolo}</h3>}
      <div className="text-sm font-semibold text-foreground mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>Totale ore: <span className="text-blu font-bold">{m2h(totale)}</span></span>
        {mesePiuCarico && (mesePiuCarico.a + mesePiuCarico.b) > 0 && (
          <span className="text-xs text-grigio">· Mese più carico: <strong className="text-foreground">{mesePiuCarico.name}</strong> ({m2h(mesePiuCarico.a + mesePiuCarico.b)})</span>
        )}
      </div>
      <div className="flex items-center gap-3 mb-2 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#C28D43' }} />Lett. a</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#6F5536' }} />Lett. b</span>
      </div>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a5a5a' }} axisLine={{ stroke: '#d0d5dd' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5a5a5a' }} axisLine={false} tickLine={false} tickFormatter={(v) => m2h(v)} width={48} />
            <Tooltip
              cursor={{ fill: 'rgba(194,141,67,0.08)' }}
              content={({ payload, label }) => {
                if (!payload || !payload.length) return null;
                const a = payload.find((p) => p.dataKey === 'a')?.value || 0;
                const b = payload.find((p) => p.dataKey === 'b')?.value || 0;
                return (
                  <div style={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d5dd', background: '#fff', padding: '6px 10px' }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ color: '#C28D43' }}>Lett. a: {m2h(a)}</div>
                    <div style={{ color: '#6F5536' }}>Lett. b: {m2h(b)}</div>
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 3, paddingTop: 3, fontWeight: 600 }}>Tot: {m2h(a + b)}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="a" stackId="1" fill="#C28D43" radius={[0, 0, 0, 0]} maxBarSize={42} />
            <Bar dataKey="b" stackId="1" fill="#6F5536" radius={[4, 4, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}