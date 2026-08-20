import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

export default function PannelloDatiPersonali({ open, nomeDocente, profilo, onClose, onSave, saving }) {
  const [nome, setNome] = useState('');
  const [profiloSel, setProfiloSel] = useState('docente');

  useEffect(() => {
    if (open) {
      setNome(nomeDocente || '');
      setProfiloSel(profilo === 'ata' ? 'ata' : 'docente');
    }
  }, [open, nomeDocente, profilo]);

  function handleSave() {
    if (!nome.trim()) return;
    onSave(profiloSel, nome.trim());
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[420px]">
      <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Dati personali</h3>
      <div className="space-y-3">
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
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Profilo</label>
          <div className="grid grid-cols-2 gap-2 select-none">
            {[
              { k: 'docente', l: 'Docente' },
              { k: 'ata', l: 'Personale ATA' },
            ].map((p) => (
              <button
                key={p.k}
                onClick={() => setProfiloSel(p.k)}
                className={`text-sm py-2 rounded-lg border transition-colors ${
                  profiloSel === p.k ? 'bg-blu text-white border-blu' : 'border-bordo text-foreground hover:bg-blu-light'
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5 select-none">
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Annulla</button>
        <button onClick={handleSave} disabled={saving || !nome.trim()} className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50">Salva</button>
      </div>
    </ModalShell>
  );
}