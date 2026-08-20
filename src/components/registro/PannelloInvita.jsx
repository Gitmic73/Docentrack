import React, { useState, useEffect } from 'react';
import { UserPlus, Check } from 'lucide-react';
import ModalShell from './ModalShell';
import { base44 } from '@/api/base44Client';

export default function PannelloInvita({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setEmail(''); setDone(false); setErr(''); setLoading(false); }
  }, [open]);

  async function handleInvite() {
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      setErr('Inserisci un indirizzo email valido.');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      await base44.users.inviteUser(e, 'user');
      setDone(true);
    } catch (e2) {
      setErr(e2.message || 'Invito non riuscito.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[420px]">
      <h3 className="font-display text-[17px] text-blu mb-1 border-b border-bordo pb-2.5 flex items-center gap-2">
        <UserPlus size={18} /> Invita un collega
      </h3>
      <div className="text-xs text-grigio mb-4">
        Invita docenti o amici a usare DocentTrack. Riceveranno un'email per registrarsi.
      </div>
      {done ? (
        <div className="text-center py-5">
          <div className="w-12 h-12 rounded-full bg-verde-light text-verde flex items-center justify-center mx-auto mb-2">
            <Check size={24} />
          </div>
          <div className="text-sm text-foreground">Invito inviato a <strong>{email}</strong>.</div>
        </div>
      ) : (
        <>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Email del collega</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collega@istruzione.it"
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
          />
          {err && <div className="mt-2 text-[11px] text-rosso">{err}</div>}
        </>
      )}
      <div className="flex justify-end gap-2 mt-5 select-none">
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Chiudi</button>
        {!done && (
          <button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50"
          >
            {loading ? 'Invio…' : 'Invia invito'}
          </button>
        )}
      </div>
    </ModalShell>
  );
}