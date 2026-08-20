import React, { useState, useEffect } from 'react';
import { Star, Check } from 'lucide-react';
import ModalShell from './ModalShell';
import { base44 } from '@/api/base44Client';

export default function PannelloRecensione({ open, onClose }) {
  const [voto, setVoto] = useState(0);
  const [hover, setHover] = useState(0);
  const [testo, setTesto] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setVoto(0); setHover(0); setTesto(''); setDone(false); setErr(''); setLoading(false); }
  }, [open]);

  async function handleSubmit() {
    if (voto === 0) { setErr('Seleziona un numero di stelle.'); return; }
    setErr('');
    setLoading(true);
    try {
      await base44.entities.Recensione.create({ voto, testo: testo.trim() });
      setDone(true);
    } catch (e) {
      setErr(e.message || 'Invio non riuscito.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[440px]">
      <h3 className="font-display text-[17px] text-blu mb-1 border-b border-bordo pb-2.5 flex items-center gap-2">
        <Star size={18} /> Valuta DocentTrack
      </h3>
      <div className="text-xs text-grigio mb-4">
        La tua valutazione ci aiuta a migliorare. Sarà pubblicata sullo store.
      </div>
      {done ? (
        <div className="text-center py-5">
          <div className="w-12 h-12 rounded-full bg-verde-light text-verde flex items-center justify-center mx-auto mb-2">
            <Check size={24} />
          </div>
          <div className="text-sm text-foreground">Grazie! La tua recensione è stata inviata.</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-1.5 py-2 select-none">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setVoto(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-0.5"
                aria-label={`${n} stelle`}
              >
                <Star size={32} className={(hover || voto) >= n ? 'fill-oro text-oro' : 'text-bordo'} />
              </button>
            ))}
          </div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1 mt-2">La tua recensione</label>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            rows={4}
            placeholder="Scrivi la tua esperienza…"
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu resize-none"
          />
          {err && <div className="mt-2 text-[11px] text-rosso">{err}</div>}
        </>
      )}
      <div className="flex justify-end gap-2 mt-5 select-none">
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Chiudi</button>
        {!done && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50"
          >
            {loading ? 'Invio…' : 'Invia recensione'}
          </button>
        )}
      </div>
    </ModalShell>
  );
}