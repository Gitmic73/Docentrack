import React, { useState, useEffect } from 'react';
import { TIPI_A, TIPI_B, t2m, formatTimeInput, dateInAnnoScolastico } from './registroConstants';
import DrawerSelect from './DrawerSelect';
import ModalShell from './ModalShell';

export default function ModalEdit({ open, record, sezione, onClose, onSave, saving, annoCorrente, hasSeconda }) {
  const [form, setForm] = useState({ data: '', inizio: '', fine: '', tipo: '', note: '', scuola_tipo: 'prima' });
  const [err, setErr] = useState('');
  const tipi = sezione === 'a' ? TIPI_A : TIPI_B;

  useEffect(() => {
    if (record) {
      setForm({ data: record.data || '', inizio: record.inizio || '', fine: record.fine || '', tipo: record.tipo || '', note: record.note || '', scuola_tipo: record.scuola_tipo || 'prima' });
      setErr('');
    }
  }, [record]);

  function handleSave() {
    if (!form.data || !form.inizio || !form.fine || !form.tipo) {
      setErr('Tutti i campi sono obbligatori.');
      return;
    }
    if (annoCorrente && !dateInAnnoScolastico(form.data, annoCorrente)) {
      const [y1, y2] = annoCorrente.split('/');
      setErr(`La data non rientra nell'anno scolastico ${annoCorrente} (valido dal 01/09/${y1} al 31/08/${y2}). Verifica la data.`);
      return;
    }
    if (form.tipo.startsWith('Altro') && !form.note.trim()) {
      setErr('Il campo Note è obbligatorio quando si seleziona "Altro".');
      return;
    }
    const dur = t2m(form.fine) - t2m(form.inizio);
    if (dur <= 0) {
      setErr("Fine deve essere dopo l'inizio.");
      return;
    }
    onSave(record.id, { data: form.data, inizio: form.inizio, fine: form.fine, tipo: form.tipo, note: form.note, durata_min: dur, scuola_tipo: form.scuola_tipo });
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[500px]">
      <h3 className="font-display text-[17px] text-blu mb-4 border-b border-bordo pb-2.5">Modifica record</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2">
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Inizio</label>
          <input type="text" inputMode="numeric" placeholder="HH:MM" maxLength={5} value={form.inizio} onChange={(e) => setForm({ ...form, inizio: formatTimeInput(e.target.value) })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Fine</label>
          <input type="text" inputMode="numeric" placeholder="HH:MM" maxLength={5} value={form.fine} onChange={(e) => setForm({ ...form, fine: formatTimeInput(e.target.value) })}
            className="w-full text-[13px] px-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        {hasSeconda && (
          <div className="col-span-2 flex items-center gap-2 select-none">
            <span className="text-[10px] text-grigio uppercase tracking-[0.4px]">Scuola:</span>
            <button onClick={() => setForm({ ...form, scuola_tipo: 'prima' })}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${form.scuola_tipo !== 'seconda' ? 'bg-blu text-white border-blu' : 'border-bordo text-grigio hover:bg-blu-light'}`}>1ª scuola</button>
            <button onClick={() => setForm({ ...form, scuola_tipo: 'seconda' })}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${form.scuola_tipo === 'seconda' ? 'bg-teal-600 text-white border-teal-600 dark:bg-teal-700 dark:border-teal-700' : 'border-bordo text-grigio hover:bg-teal-50'}`}>2ª scuola</button>
          </div>
        )}
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
          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">
            Note{form.tipo.startsWith('Altro') && <span className="text-rosso"> *</span>}
          </label>
          <input type="text" value={form.note} placeholder={form.tipo.startsWith('Altro') ? 'obbligatorio' : 'facoltativo'} onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={`w-full text-[13px] px-2 py-1.5 border rounded bg-white outline-none focus:border-blu ${form.tipo.startsWith('Altro') ? 'border-rosso' : 'border-bordo'}`} />
        </div>
      </div>
      {err && <div className="mt-2 text-[11px] text-rosso">{err}</div>}
      <div className="flex justify-end gap-2 mt-5 select-none">
        <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#F4E8D0]">Annulla</button>
        <button onClick={handleSave} disabled={saving}
          className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#A57635] disabled:opacity-50">Salva modifiche</button>
      </div>
    </ModalShell>
  );
}