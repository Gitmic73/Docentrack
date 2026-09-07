import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

const EMPTY = { nome: '', indirizzo: '', tel: '', mail: '', codice: '', ds: '' };

export default function ModalScuola({ open, annoCorrente, scuolaPrima, scuolaSeconda, onClose, onSave, saving }) {
  const [tab, setTab] = useState('prima');
  const [prima, setPrima] = useState(EMPTY);
  const [seconda, setSeconda] = useState(EMPTY);

  useEffect(() => {
    setPrima(scuolaPrima
      ? { nome: scuolaPrima.nome || '', indirizzo: scuolaPrima.indirizzo || '', tel: scuolaPrima.tel || '', mail: scuolaPrima.mail || '', codice: scuolaPrima.codice || '', ds: scuolaPrima.ds || '' }
      : EMPTY);
    setSeconda(scuolaSeconda
      ? { nome: scuolaSeconda.nome || '', indirizzo: scuolaSeconda.indirizzo || '', tel: scuolaSeconda.tel || '', mail: scuolaSeconda.mail || '', codice: scuolaSeconda.codice || '', ds: scuolaSeconda.ds || '' }
      : EMPTY);
  }, [scuolaPrima, scuolaSeconda, open]);

  function handleSave() {
    onSave(
      { nome: prima.nome.trim(), indirizzo: prima.indirizzo.trim(), tel: prima.tel.trim(), mail: prima.mail.trim(), codice: prima.codice.trim(), ds: prima.ds.trim() },
      { nome: seconda.nome.trim(), indirizzo: seconda.indirizzo.trim(), tel: seconda.tel.trim(), mail: seconda.mail.trim(), codice: seconda.codice.trim(), ds: seconda.ds.trim() }
    );
  }

  const form = tab === 'prima' ? prima : seconda;
  const setForm = tab === 'prima' ? setPrima : setSeconda;

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[500px]">
      <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">
        Dati Istituto Scolastico — A.S. {annoCorrente}
      </h3>
      <div className="flex gap-1.5 mb-4 select-none">
        <button onClick={() => setTab('prima')}
          className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${tab === 'prima' ? 'bg-blu text-white' : 'text-grigio hover:bg-blu-light'}`}>
          Prima scuola
        </button>
        <button onClick={() => setTab('seconda')}
          className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${tab === 'seconda' ? 'bg-teal-600 text-white dark:bg-teal-700' : 'text-grigio hover:bg-teal-50'}`}>
          Seconda scuola
        </button>
      </div>
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
      {tab === 'seconda' && (
        <p className="text-[11px] text-grigio italic mt-3">
          Lascia vuoto se non insegni in una seconda scuola. Le attività della seconda sede saranno contrassegnate con un badge distintivo.
        </p>
      )}
      <div className="flex justify-end gap-2 mt-5 select-none">
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#FEF3C7]">Annulla</button>
        <button onClick={handleSave} disabled={saving}
          className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#B45309] disabled:opacity-50">Salva</button>
      </div>
    </ModalShell>
  );
}