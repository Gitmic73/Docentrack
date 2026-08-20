import React, { useState, useEffect } from 'react';
import { Mail, Phone, KeyRound } from 'lucide-react';
import ModalShell from './ModalShell';
import { base44 } from '@/api/base44Client';

export default function PannelloDatiPersonali({ open, email, nomeDocente, telefono, docenteDi, onClose, onSave, saving }) {
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [docDi, setDocDi] = useState('');
  const [pwdSent, setPwdSent] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setNome(nomeDocente || '');
      setTel(telefono || '');
      setDocDi(docenteDi || '');
      setPwdSent(false);
      setPwdLoading(false);
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

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[440px]">
      <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Dati personali</h3>
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
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Annulla</button>
        <button onClick={handleSave} disabled={saving || !nome.trim()} className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50">Salva</button>
      </div>
    </ModalShell>
  );
}