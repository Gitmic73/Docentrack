import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

export default function ModalScuola({ open, annoCorrente, scuola, onClose, onSave, saving }) {
  const [form, setForm] = useState({ nome: '', indirizzo: '', tel: '', mail: '', codice: '', ds: '' });

  useEffect(() => {
    if (scuola) {
      setForm({ nome: scuola.nome || '', indirizzo: scuola.indirizzo || '', tel: scuola.tel || '', mail: scuola.mail || '', codice: scuola.codice || '', ds: scuola.ds || '' });
    } else {
      setForm({ nome: '', indirizzo: '', tel: '', mail: '', codice: '', ds: '' });
    }
  }, [scuola, open]);

  function handleSave() {
    onSave({
      nome: form.nome.trim(),
      indirizzo: form.indirizzo.trim(),
      tel: form.tel.trim(),
      mail: form.mail.trim(),
      codice: form.codice.trim(),
      ds: form.ds.trim(),
    });
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[500px]">
      <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">
        Dati Istituto Scolastico — A.S. {annoCorrente}
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2">
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Denominazione</label>
          <input value={form.nome} placeholder="Istituto Comprensivo ..." onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Indirizzo</label>
          <input value={form.indirizzo} placeholder="Via ..., n. – CAP Comune (Prov)" onChange={(e) => setForm({ ...form, indirizzo: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Telefono</label>
          <input value={form.tel} placeholder="0000/000000" onChange={(e) => setForm({ ...form, tel: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Email</label>
          <input value={form.mail} placeholder="...@istruzione.it" onChange={(e) => setForm({ ...form, mail: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Codice meccanografico</label>
          <input value={form.codice} placeholder="MOIC00000X" onChange={(e) => setForm({ ...form, codice: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Dirigente Scolastico</label>
          <input value={form.ds} placeholder="Prof./ssa ..." onChange={(e) => setForm({ ...form, ds: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5 select-none">
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Annulla</button>
        <button onClick={handleSave} disabled={saving}
          className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50">Salva</button>
      </div>
    </ModalShell>
  );
}