import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CalendarX } from 'lucide-react';
import ModalShell from './ModalShell';

export default function CancellaAnnoModal({ open, anni, annoCorrente, onClose, onConferma, saving }) {
  const [step, setStep] = useState('scelta');
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (open) { setStep('scelta'); setSel(null); }
  }, [open]);

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[420px]">
      {step === 'scelta' && (
        <>
          <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5 flex items-center gap-2">
            <CalendarX size={18} /> Cancella anno scolastico
          </h3>
          <div className="text-xs text-grigio mb-3">
            Seleziona l'anno scolastico da eliminare. Verranno cancellate tutte le attività e le statistiche ad esso collegate.
          </div>
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
            {anni.map((a) => (
              <button
                key={a}
                onClick={() => { setSel(a); setStep('conferma'); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-bordo text-left hover:bg-[#F4E8D0] transition-colors"
              >
                <span className="font-display text-sm font-semibold text-foreground flex-1">A.S. {a}</span>
                {a === annoCorrente && (
                  <span className="text-[10px] text-blu bg-blu-light px-2 py-0.5 rounded-full">corrente</span>
                )}
                <Trash2 size={15} className="text-grigio" />
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-5 select-none">
            <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#F4E8D0]">Annulla</button>
          </div>
        </>
      )}

      {step === 'conferma' && sel && (
        <>
          <h3 className="font-display text-[17px] text-rosso mb-3 border-b border-bordo pb-2.5 flex items-center gap-2">
            <AlertTriangle size={18} /> Conferma cancellazione
          </h3>
          <div className="rounded-lg border border-rosso bg-rosso-light p-3 mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              Sei sicuro di voler cancellare l'anno scolastico <strong className="text-rosso">{sel}</strong>?
            </p>
            <p className="text-xs text-foreground mt-2 leading-relaxed">
              Verranno cancellate <strong>tutte le attività e le statistiche</strong> appartenenti a questo anno. L'operazione è <strong className="text-rosso">irreversibile</strong>.
            </p>
          </div>
          <div className="flex justify-between gap-2 select-none">
            <button
              onClick={() => setStep('scelta')}
              disabled={saving}
              className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#F4E8D0] disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              onClick={() => onConferma(sel)}
              disabled={saving}
              className="bg-rosso text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#8e2e25] disabled:opacity-40 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Eliminazione…
                </>
              ) : (
                <>
                  <Trash2 size={14} /> Cancella anno
                </>
              )}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}