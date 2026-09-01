import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, LogOut, User as UserIcon, FileDown } from 'lucide-react';
import ModalShell from './ModalShell';

export default function ProfileSettings({ open, profilo, nomeDocente, onClose, onLogout, onDeleteAccount, onExportCSV, saving }) {
  const [step, setStep] = useState('menu');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setStep('menu'); setErr(''); }
  }, [open]);

  const profiloLabel = profilo === 'ata' ? 'Personale ATA' : 'Docente';

  async function handleDelete() {
    setErr('');
    try {
      await onDeleteAccount();
    } catch (e) {
      setErr(e.message || "Errore durante l'eliminazione");
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[420px]">
      {step === 'menu' && (
        <>
          <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Impostazioni profilo</h3>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FEF3C7] mb-4">
            <div className="w-10 h-10 rounded-full bg-blu-light flex items-center justify-center text-blu">
              <UserIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold text-foreground truncate">{nomeDocente || '—'}</div>
              <div className="text-xs text-grigio">{profiloLabel}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border border-bordo text-sm text-foreground hover:bg-[#FEF3C7] transition-colors mb-2 select-none"
          >
            <LogOut size={16} className="text-grigio" /> Esci dall&apos;account
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border border-rosso text-sm text-rosso hover:bg-rosso-light transition-colors select-none"
          >
            <Trash2 size={16} /> Elimina account
          </button>
          <div className="flex justify-end mt-5 select-none">
            <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#FEF3C7]">Chiudi</button>
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <h3 className="font-display text-[17px] text-rosso mb-3 border-b border-bordo pb-2.5 flex items-center gap-2">
            <AlertTriangle size={18} /> Elimina account
          </h3>
          <div className="rounded-lg border border-rosso bg-rosso-light p-3 mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="text-rosso">Attenzione:</strong> stai per eliminare l'account e tutti i dati presenti nell'applicazione. Il processo di eliminazione è <strong className="text-rosso">irreversibile</strong>. Sei sicuro di volerlo eliminare?
            </p>
          </div>
          <div className="text-xs text-grigio mb-2">Verranno eliminati definitivamente:</div>
          <ul className="text-xs text-grigio list-disc pl-5 mb-4 space-y-1">
            <li>Tutte le attività registrate (lett. a e lett. b)</li>
            <li>I dati dell&apos;istituto scolastico</li>
            <li>Gli anni scolastici creati</li>
            <li>Il tuo account utente e l&apos;accesso</li>
          </ul>
          <div className="rounded-lg border border-bordo bg-[#FEF3C7] p-3 mb-4 flex items-start gap-2">
            <FileDown size={16} className="text-blu shrink-0 mt-0.5" />
            <div className="text-xs text-foreground">
              <strong>Prima di eliminare, salva i tuoi dati</strong> esportandoli in CSV.
              <button
                onClick={onExportCSV}
                className="block mt-2 text-blu underline text-xs font-semibold"
              >
                Esporta CSV di tutti gli anni
              </button>
            </div>
          </div>
          {err && <div className="mt-2 text-[11px] text-rosso bg-rosso-light rounded px-2 py-1.5 mb-3">{err}</div>}
          <div className="flex justify-between gap-2 select-none">
            <button
              onClick={() => setStep('menu')}
              disabled={saving}
              className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#FEF3C7] disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="bg-rosso text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#8e2e25] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Eliminazione…
                </>
              ) : (
                <>
                  <Trash2 size={14} /> Elimina
                </>
              )}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}