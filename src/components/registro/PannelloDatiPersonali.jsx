import React, { useState, useEffect } from 'react';
import { Mail, Phone, KeyRound, Trash2, AlertTriangle, LogOut, FileDown, User as UserIcon } from 'lucide-react';
import ModalShell from './ModalShell';
import { base44 } from '@/api/base44Client';

export default function PannelloDatiPersonali({ open, email, nomeDocente, telefono, docenteDi, onClose, onSave, saving, onLogout, onDeleteAccount, onExportCSV }) {
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [docDi, setDocDi] = useState('');
  const [pwdSent, setPwdSent] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [step, setStep] = useState('dati');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setNome(nomeDocente || '');
      setTel(telefono || '');
      setDocDi(docenteDi || '');
      setPwdSent(false);
      setPwdLoading(false);
      setStep('dati');
      setErr('');
    }
  }, [open, nomeDocente, telefono, docenteDi]);

  async function handlePassword() {
    if (!email) return;
    setPwdLoading(true);
    try { await base44.auth.resetPasswordRequest(email); } catch (e) { /* ignore */ }
    setPwdLoading(false);
    setPwdSent(true);
  }

  function handleSave() {
    if (!nome.trim()) return;
    onSave({ nome: nome.trim(), telefono: tel.trim(), docente_di: docDi.trim() });
  }

  async function handleDelete() {
    setErr('');
    try {
      await onDeleteAccount();
    } catch (e) {
      setErr(e.message || "Errore durante l'eliminazione");
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[440px]">
      {step === 'dati' && (
        <>
          <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Impostazioni profilo</h3>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F4E8D0] mb-4">
            <div className="w-10 h-10 rounded-full bg-blu-light flex items-center justify-center text-blu">
              <UserIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold text-foreground truncate">{nomeDocente || '—'}</div>
              <div className="text-xs text-grigio">{email || ''}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Email di registrazione</label>
              <div className="flex items-center gap-2 w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-[#f4f4f2] text-grigio">
                <Mail size={14} className="shrink-0" /> <span className="truncate">{email || '—'}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Nome e cognome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome e Cognome"
                className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
              />
            </div>
            <div>
              <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Telefono</label>
              <div className="relative">
                <Phone size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-grigio pointer-events-none" />
                <input
                  type="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  placeholder="0000/000000"
                  className="w-full text-[13px] pl-7 pr-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Docente di</label>
              <input
                type="text"
                value={docDi}
                onChange={(e) => setDocDi(e.target.value)}
                placeholder="es. Matematica e Scienze"
                className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
              />
            </div>
            <div className="pt-2 border-t border-bordo">
              <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1.5">Password di accesso</label>
              {pwdSent ? (
                <div className="text-[11px] text-verde bg-verde-light rounded px-2 py-1.5">
                  Ti abbiamo inviato un'email per reimpostare la password.
                </div>
              ) : (
                <button
                  onClick={handlePassword}
                  disabled={pwdLoading || !email}
                  className="flex items-center gap-2 text-[13px] text-blu border border-blu rounded px-3 py-1.5 hover:bg-blu-light disabled:opacity-50"
                >
                  <KeyRound size={14} /> {pwdLoading ? 'Invio…' : 'Cambia password'}
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 select-none">
            <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#F4E8D0]">Annulla</button>
            <button onClick={handleSave} disabled={saving || !nome.trim()} className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#A57635] disabled:opacity-50">Salva</button>
          </div>

          <div className="mt-5 pt-4 border-t border-bordo space-y-2 select-none">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-bordo text-sm text-foreground hover:bg-[#F4E8D0] transition-colors"
            >
              <LogOut size={16} className="text-grigio" /> Esci dall&apos;account
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-rosso text-sm text-rosso hover:bg-rosso-light transition-colors"
            >
              <Trash2 size={16} /> Elimina account
            </button>
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
              <strong className="text-rosso">Attenzione:</strong> stai per eliminare l&apos;account e tutti i dati presenti nell&apos;applicazione. Il processo di eliminazione è <strong className="text-rosso">irreversibile</strong>. Sei sicuro di volerlo eliminare?
            </p>
          </div>
          <div className="text-xs text-grigio mb-2">Verranno eliminati definitivamente:</div>
          <ul className="text-xs text-grigio list-disc pl-5 mb-4 space-y-1">
            <li>Tutte le attività registrate (lett. a e lett. b)</li>
            <li>I dati dell&apos;istituto scolastico</li>
            <li>Gli anni scolastici creati</li>
            <li>Il tuo account utente e l&apos;accesso</li>
          </ul>
          <div className="rounded-lg border border-bordo bg-[#F4E8D0] p-3 mb-4 flex items-start gap-2">
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
              onClick={() => setStep('dati')}
              disabled={saving}
              className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#F4E8D0] disabled:opacity-50"
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