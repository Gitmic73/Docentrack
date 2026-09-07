import React, { useState, useEffect, useRef } from 'react';
import ModalShell from './ModalShell';
import { base44 } from '@/api/base44Client';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';

const EMPTY = { nome: '', indirizzo: '', tel: '', mail: '', codice: '', ds: '', logo_url: '' };

export default function ModalScuola({ open, annoCorrente, scuolaPrima, scuolaSeconda, onClose, onSave, saving }) {
  const [tab, setTab] = useState('prima');
  const [prima, setPrima] = useState(EMPTY);
  const [seconda, setSeconda] = useState(EMPTY);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPrima(scuolaPrima
      ? { nome: scuolaPrima.nome || '', indirizzo: scuolaPrima.indirizzo || '', tel: scuolaPrima.tel || '', mail: scuolaPrima.mail || '', codice: scuolaPrima.codice || '', ds: scuolaPrima.ds || '', logo_url: scuolaPrima.logo_url || '' }
      : EMPTY);
    setSeconda(scuolaSeconda
      ? { nome: scuolaSeconda.nome || '', indirizzo: scuolaSeconda.indirizzo || '', tel: scuolaSeconda.tel || '', mail: scuolaSeconda.mail || '', codice: scuolaSeconda.codice || '', ds: scuolaSeconda.ds || '', logo_url: scuolaSeconda.logo_url || '' }
      : EMPTY);
  }, [scuolaPrima, scuolaSeconda, open]);

  const form = tab === 'prima' ? prima : seconda;
  const setForm = tab === 'prima' ? setPrima : setSeconda;

  function handleSave() {
    onSave(
      { nome: prima.nome.trim(), indirizzo: prima.indirizzo.trim(), tel: prima.tel.trim(), mail: prima.mail.trim(), codice: prima.codice.trim(), ds: prima.ds.trim(), logo_url: prima.logo_url },
      { nome: seconda.nome.trim(), indirizzo: seconda.indirizzo.trim(), tel: seconda.tel.trim(), mail: seconda.mail.trim(), codice: seconda.codice.trim(), ds: seconda.ds.trim(), logo_url: seconda.logo_url }
    );
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, logo_url: file_url });
    } catch (err) {
      /* ignore */
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

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

      {/* Logo upload */}
      <div className="mb-3 flex items-center gap-3">
        {form.logo_url ? (
          <div className="relative shrink-0">
            <img src={form.logo_url} alt="Logo scuola" className="w-16 h-16 object-contain rounded-lg border border-bordo bg-white p-1" />
            <button onClick={() => setForm({ ...form, logo_url: '' })} className="absolute -top-1.5 -right-1.5 bg-rosso text-white rounded-full p-1 shadow-sm hover:bg-red-700 transition-colors" aria-label="Rimuovi logo">
              <Trash2 size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={logoUploading}
            className="w-16 h-16 border-2 border-dashed border-bordo rounded-lg flex items-center justify-center text-grigio hover:bg-blu-light hover:border-blu hover:text-blu transition-colors disabled:opacity-50 shrink-0"
          >
            {logoUploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          </button>
        )}
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block">Logo scuola</label>
          <p className="text-[11px] text-grigio mt-0.5">Facoltativo — apparirà nell'intestazione del PDF ufficiale</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
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