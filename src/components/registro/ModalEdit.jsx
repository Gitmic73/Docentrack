import React, { useState, useEffect } from 'react';
import { TIPI_A, TIPI_B, t2m } from './registroConstants';
import DrawerSelect from './DrawerSelect';

export default function ModalEdit({ open, record, sezione, onClose, onSave, saving }) {
  const [form, setForm] = useState({ data: '', inizio: '', fine: '', tipo: '', note: '' });
  const [err, setErr] = useState('');

  useEffect(() => {
    if (record) {
      setForm({ data: record.data || '', inizio: record.inizio || '', fine: record.fine || '', tipo: record.tipo || '', note: record.note || '' });
      setErr('');
    }
  }, [record]);

  if (!open) return null;
  const tipi = sezione === 'a' ? TIPI_A : TIPI_B;

  function handleSave() {
    if (!form.data || !form.inizio || !form.fine || !form.tipo) {
      setErr('Tutti i campi sono obbligatori.');
      return;
    }
    const dur = t2m(form.fine) - t2m(form.inizio);
    if (dur <= 0) {
      setErr("Fine deve essere dopo l'inizio.");
      return;
    }
    onSave(record.id, { data: form.data, inizio: form.inizio, fine: form.fine, tipo: form.tipo, note: form.note, durata_min: dur });
  }

  return (
    <div className="fixed inset-0 bg-[rgba(10,20,40,0.62)] z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-[500px] border border-bordo shadow-[0_8px_40px_rgba(0,0,0,0.22)]" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Modifica record</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2">
            <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Data</label>
            <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
          </div>
          <div>
            <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Inizio</label>
            <input type="time" value={form.inizio} onChange={(e) => setForm({ ...form, inizio: e.target.value })}
              className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
          </div>
          <div>
            <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Fine</label>
            <input type="time" value={form.fine} onChange={(e) => setForm({ ...form, fine: e.target.value })}
              className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Tipologia</label>
            <DrawerSelect
              value={form.tipo}
              onChange={(v) => setForm({ ...form, tipo: v })}
              options={tipi}
              placeholder="— Seleziona —"
              label="Tipologia"
              className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Note</label>
            <input type="text" value={form.note} placeholder="facoltativo" onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
          </div>
        </div>
        {err && <div className="mt-2 text-[11px] text-rosso">{err}</div>}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Annulla</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50">Salva modifiche</button>
        </div>
      </div>
    </div>
  );
}