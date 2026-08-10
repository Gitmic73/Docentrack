import React, { useState } from 'react';

export default function NuovoAnnoModal({ open, suggerito, onClose, onCrea }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');

  React.useEffect(() => {
    if (open) { setVal(suggerito); setErr(''); }
  }, [open, suggerito]);

  if (!open) return null;

  function handleCrea() {
    const fmt = val.trim();
    if (!/^\d{4}\/\d{4}$/.test(fmt)) {
      setErr('Formato non valido. Usa: AAAA/AAAA');
      return;
    }
    onCrea(fmt);
  }

  return (
    <div className="fixed inset-0 bg-[rgba(10,20,40,0.62)] z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-[400px] border border-bordo shadow-[0_8px_40px_rgba(0,0,0,0.22)]" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Nuovo anno scolastico</h3>
        <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Anno (es. 2026/2027)</label>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="AAAA/AAAA"
          className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
        />
        {err && <div className="mt-2 text-[11px] text-rosso">{err}</div>}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Annulla</button>
          <button onClick={handleCrea} className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d]">Crea</button>
        </div>
      </div>
    </div>
  );
}