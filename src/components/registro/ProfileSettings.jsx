import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, LogOut, User as UserIcon } from 'lucide-react';

export default function ProfileSettings({ open, profilo, nomeDocente, onClose, onLogout, onDeleteAccount, saving }) {
  const [step, setStep] = useState('menu');
  const [confirmText, setConfirmText] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setStep('menu'); setConfirmText(''); setErr(''); }
  }, [open]);

  if (!open) return null;

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
    <div className="fixed inset-0 bg-[rgba(10,20,40,0.62)] z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-[420px] border border-bordo shadow-[0_8px_40px_rgba(0,0,0,0.22)]" onClick={(e) => e.stopPropagation()}>
        {step === 'menu' && (
          <>
            <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Impostazioni profilo</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f4f4f2] mb-4">
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
              className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border border-bordo text-sm text-foreground hover:bg-[#f4f4f2] transition-colors mb-2"
            >
              <LogOut size={16} className="text-grigio" /> Esci dall&apos;account
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border border-rosso text-sm text-rosso hover:bg-rosso-light transition-colors"
            >
              <Trash2 size={16} /> Elimina account
            </button>
            <div className="flex justify-end mt-5">
              <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Chiudi</button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h3 className="font-display text-[17px] text-rosso mb-3 border-b border-bordo pb-2.5 flex items-center gap-2">
              <AlertTriangle size={18} /> Elimina account
            </h3>
            <div className="text-sm text-foreground mb-3">
              Questa operazione è <strong className="text-rosso">irreversibile</strong>. Verranno eliminati definitivamente:
            </div>
            <ul className="text-xs text-grigio list-disc pl-5 mb-4 space-y-1">
              <li>Tutte le attività registrate (lett. a e lett. b)</li>
              <li>I dati dell&apos;istituto scolastico</li>
              <li>Gli anni scolastici creati</li>
              <li>Il tuo account utente e l&apos;accesso</li>
            </ul>
            <label className="text-xs text-foreground block mb-1.5">
              Per confermare digita <strong className="text-rosso">ELIMINA</strong>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINA"
              className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-rosso"
            />
            {err && <div className="mt-2 text-[11px] text-rosso bg-rosso-light rounded px-2 py-1.5">{err}</div>}
            <div className="flex justify-between gap-2 mt-5">
              <button
                onClick={() => setStep('menu')}
                disabled={saving}
                className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee] disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'ELIMINA' || saving}
                className="bg-rosso text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#8e2e25] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Eliminazione…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Elimina definitivamente
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}