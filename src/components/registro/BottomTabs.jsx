import React from 'react';
import { ClipboardList, Calendar, PieChart, ListChecks } from 'lucide-react';

const TABS = [
  { k: 'registro', l: 'Registro', icon: ClipboardList },
  { k: 'calendario', l: 'Calendario', icon: Calendar },
  { k: 'riepilogo', l: 'Riepilogo', icon: ListChecks },
  { k: 'statistiche', l: 'Statistiche', icon: PieChart },
];

export default function BottomTabs({ vista, onChange }) {
  const novitaTabs = { riepilogo: true };
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-bordo flex select-none shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = vista === t.k;
        return (
          <button
            key={t.k}
            onClick={() => onChange(t.k)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${active ? 'text-blu' : 'text-grigio'}`}
            style={{ minHeight: 56, WebkitTapHighlightColor: 'transparent' }}
            aria-label={t.l}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] font-semibold">{t.l}</span>
            {novitaTabs[t.k] && (
              <span className="absolute top-1 right-[20%] bg-rosso text-white text-[7px] font-bold px-1 py-0.5 rounded-full leading-none">NEW</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}