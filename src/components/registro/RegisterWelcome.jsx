import React from 'react';
import { ClipboardList, School, BarChart3, FileText, Clock, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Registra in pochi secondi',
    desc: 'Inserisci data, orario di inizio/fine e tipologia. Il sistema calcola automaticamente la durata.',
    color: 'text-blu',
    bg: 'bg-blu-light',
  },
  {
    icon: School,
    title: 'Doppia sede',
    desc: 'Gestisci le attività di due scuole diverse con un\'unica app, con badge dedicati per ogni sede.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: BarChart3,
    title: 'Statistiche e grafici',
    desc: 'Monitora i tuoi 40+40 ore con grafici a torta e a barre, suddivisi per tipologia.',
    color: 'text-oro',
    bg: 'bg-oro-light',
  },
  {
    icon: FileText,
    title: 'Report PDF e CSV',
    desc: 'Esporta il registro annuale completo con grafici e riferimenti normativi in un click.',
    color: 'text-verde',
    bg: 'bg-verde-light',
  },
];

const STEPS = [
  'Crea il tuo account gratuito',
  'Inserisci i dati della tua scuola',
  'Registra le attività svolte',
  'Esporta il registro a fine anno',
];

export default function RegisterWelcome() {
  return (
    <div className="flex flex-col justify-center px-8 py-10 select-none">
      {/* Logo / Brand */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blu to-oro flex items-center justify-center shadow-md">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-blu leading-none">DocenTrack</h1>
            <p className="text-[11px] text-grigio mt-0.5">Registro Attività Funzionali all'Insegnamento</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          L'app gratuita per docenti e ATA per monitorare e storicizzare le{' '}
          <strong className="text-blu">40+40 ore</strong> annuali previste dall'Art. 29 CCNL.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-white border border-bordo rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mb-2.5`}>
                <Icon className={f.color} size={18} />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-[11px] text-grigio leading-snug">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Quick steps */}
      <div className="bg-[#FEF3C7] border border-bordo rounded-xl p-4">
        <h3 className="font-display text-sm font-semibold text-blu mb-3 flex items-center gap-1.5">
          <Clock size={15} /> Come funziona
        </h3>
        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blu text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <span className="text-xs text-foreground/80">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance badge */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-grigio">
        <CheckCircle2 size={14} className="text-verde" />
        <span>Conforme all'Art. 29 CCNL Comparto Scuola 29/11/2007 · D.Lgs. 81/2008</span>
      </div>
    </div>
  );
}