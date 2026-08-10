import React, { useState } from 'react';
import { Plus, Pencil, X, ArrowUpDown } from 'lucide-react';
import { TIPI_A, TIPI_B, MAX_ORE, m2h, fmtD, oggi, t2m } from './registroConstants';

const CONF = {
  a: {
    titolo: "40 ore — Art. 29 CCNL/2007 (lett. a)",
    desc: "Collegio Docenti · programmazione · formazione · consegna pagelle · ricevimenti collettivi · riunioni disciplinari/dipartimentali",
    tipi: TIPI_A,
    headerClass: 'bg-blu',
    barraClass: 'bg-oro',
    pillClass: 'bg-blu-light text-blu',
    btnAddClass: 'bg-blu hover:bg-[#12284d]',
    noteLabel: 'Note',
    notePlaceholder: 'facoltativo',
    alertEccMsg: "Hai diritto al compenso (Tab. 5 CCNL) o all'esonero.",
  },
  b: {
    titolo: "Fino a 40 ore — Art. 29 CCNL/2007 (lett. b)",
    desc: "Consigli di classe · interclasse soli docenti / docenti+genitori · intersezione · GLO con genitori",
    tipi: TIPI_B,
    headerClass: 'bg-oro',
    barraClass: 'bg-blu',
    pillClass: 'bg-oro-light text-[#7a5c00]',
    btnAddClass: 'bg-oro hover:bg-[#a6841e]',
    noteLabel: 'Note / Classe',
    notePlaceholder: 'es. 3A',
    alertEccMsg: 'Il Collegio Docenti delibera la gestione.',
  },
};

export default function SezioneRegistro({ sezione, dati, onAdd, onEdit, onDelete, onSvuota, onExport, saving }) {
  const c = CONF[sezione];
  const [form, setForm] = useState({ data: oggi(), inizio: '', fine: '', tipo: '', note: '' });
  const [sort, setSort] = useState({ col: 'data', asc: false });
  const [err, setErr] = useState('');

  const totMin = dati.reduce((s, v) => s + (v.durata_min || 0), 0);
  const pct = Math.min(100, (totMin / MAX_ORE) * 100);
  const eccedenza = Math.max(0, totMin - MAX_ORE);
  const residuo = Math.max(0, MAX_ORE - totMin);
  const completato = totMin >= MAX_ORE;

  const sorted = [...dati].sort((a, b) => {
    const { col, asc } = sort;
    let av, bv;
    if (col === 'data') { av = a.data; bv = b.data; }
    else if (col === 'tipo') { av = a.tipo; bv = b.tipo; }
    else if (col === 'dur') { av = a.durata_min; bv = b.durata_min; }
    else { av = a.inizio; bv = b.inizio; }
    if (av < bv) return asc ? -1 : 1;
    if (av > bv) return asc ? 1 : -1;
    return 0;
  });

  function toggleSort(col) {
    setSort((s) => s.col === col ? { col, asc: !s.asc } : { col, asc: col === 'data' ? false : true });
  }

  function handleAdd() {
    if (!form.data || !form.inizio || !form.fine || !form.tipo) {
      setErr('Compila data, orario di inizio, fine e tipologia.');
      return;
    }
    const dur = t2m(form.fine) - t2m(form.inizio);
    if (dur <= 0) {
      setErr("L'orario di fine deve essere successivo all'inizio.");
      return;
    }
    setErr('');
    onAdd({ data: form.data, inizio: form.inizio, fine: form.fine, tipo: form.tipo, note: form.note, durata_min: dur });
    setForm({ data: form.data, inizio: '', fine: '', tipo: '', note: '' });
  }

  return (
    <div className="mb-7 border border-bordo rounded-[10px] overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 ${c.headerClass}`}>
        <div>
          <div className="font-display text-sm font-semibold text-white">{c.titolo}</div>
          <div className="text-[10px] text-white/80 mt-0.5">{c.desc}</div>
        </div>
        <div className="bg-white/20 text-white rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
          {m2h(totMin)} / 40 ore
        </div>
      </div>

      {/* Barra progresso */}
      <div className="h-[5px] bg-black/[0.08]">
        <div
          className={`h-full transition-all duration-500 ${eccedenza > 0 ? 'bg-rosso' : c.barraClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex justify-between items-center border-b border-bordo bg-[#f4f4f2]">
        <div className="flex gap-[18px] flex-wrap">
          <div className="stat">
            <span className="block text-lg font-semibold text-blu">{m2h(totMin)}</span>
            <span className="text-[10px] uppercase tracking-[0.5px] text-grigio">Ore svolte</span>
          </div>
          <div className="stat">
            <span className="block text-lg font-semibold text-blu">{completato ? '0:00' : m2h(residuo)}</span>
            <span className="text-[10px] uppercase tracking-[0.5px] text-grigio">Ore residue</span>
          </div>
          {eccedenza > 0 && (
            <div className="stat">
              <span className="block text-lg font-semibold text-rosso">{m2h(eccedenza)}</span>
              <span className="text-[10px] uppercase tracking-[0.5px] text-grigio">Ore eccedenti</span>
            </div>
          )}
        </div>
      </div>

      {/* Form inserimento */}
      <div className="px-4 py-2 bg-[#f4f4f2] border-b border-bordo grid grid-cols-2 sm:grid-cols-[105px_62px_62px_1fr_90px_auto] gap-1.5 items-end">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Inizio</label>
          <input type="time" value={form.inizio} onChange={(e) => setForm({ ...form, inizio: e.target.value })}
            className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Fine</label>
          <input type="time" value={form.fine} onChange={(e) => setForm({ ...form, fine: e.target.value })}
            className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Tipologia</label>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu">
            <option value="">— Seleziona —</option>
            {c.tipi.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">{c.noteLabel}</label>
          <input type="text" value={form.note} placeholder={c.notePlaceholder} onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <button onClick={handleAdd} disabled={saving}
          className={`text-white rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50 ${c.btnAddClass}`}>
          <Plus size={13} className="inline -mt-0.5" /> Aggiungi
        </button>
      </div>
      {err && <div className="px-4 py-1.5 text-[11px] text-rosso bg-rosso-light">{err}</div>}

      {/* Tabella */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {[
              { k: 'data', l: 'Data' },
              { k: 'orario', l: 'Orario' },
              { k: 'tipo', l: 'Tipologia' },
              { k: 'dur', l: 'Durata' },
            ].map((h) => (
              <th key={h.k} onClick={() => toggleSort(h.k)}
                className={`px-2.5 py-1.5 text-[10px] uppercase tracking-[0.5px] text-grigio font-semibold border-b border-bordo text-left bg-[#f4f4f2] cursor-pointer hover:text-blu whitespace-nowrap ${sort.col === h.k ? 'text-blu' : ''}`}>
                {h.l} <ArrowUpDown size={9} className="inline opacity-50" />
              </th>
            ))}
            <th className="px-2.5 py-1.5 border-b border-bordo bg-[#f4f4f2]"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((v) => (
            <tr key={v.id} className="border-b border-bordo hover:bg-[#fafaf8]">
              <td className="px-2.5 py-1.5">{fmtD(v.data)}</td>
              <td className="px-2.5 py-1.5 whitespace-nowrap">{v.inizio}–{v.fine}</td>
              <td className="px-2.5 py-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.pillClass}`} title={v.tipo}>{v.tipo}</span>
                {v.note && <span className="text-grigio text-[10px] ml-1">{v.note}</span>}
              </td>
              <td className="px-2.5 py-1.5 font-semibold">{m2h(v.durata_min)}</td>
              <td className="px-2.5 py-1.5 whitespace-nowrap">
                <button onClick={() => onEdit(v)} className="text-[#ccc] hover:text-blu p-0.5" title="Modifica"><Pencil size={13} /></button>
                <button onClick={() => onDelete(v.id)} className="text-[#ccc] hover:text-rosso p-0.5" title="Elimina"><X size={13} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="text-center py-5 text-grigio italic text-[13px]">
          Nessuna attività registrata per questo anno scolastico
        </div>
      )}

      {/* Footer sezione */}
      <div className="px-4 py-2 border-t border-bordo bg-[#f4f4f2] flex items-center justify-between gap-2.5 flex-wrap">
        <div>
          {dati.length > 0 && (
            <div className="text-xs text-grigio">
              Totale ore svolte: <strong className="text-foreground">{m2h(totMin)}</strong>
              {eccedenza > 0
                ? <> &middot; Ore eccedenti: <strong className="text-rosso">{m2h(eccedenza)}</strong></>
                : completato ? '' : <> &middot; Ore residue: <strong className="text-foreground">{m2h(residuo)}</strong></>}
            </div>
          )}
          {eccedenza > 0 && (
            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-rosso-light text-rosso font-semibold">
              ⚠ Superato il massimale! {c.alertEccMsg}
            </span>
          )}
          {completato && eccedenza === 0 && (
            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-verde-light text-verde font-semibold">
              ✓ Monte ore completato — obbligo CCNL assolto.
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button onClick={onSvuota} disabled={saving || dati.length === 0}
            className="text-rosso border border-rosso rounded px-3 py-1 text-xs font-semibold hover:bg-rosso hover:text-white transition-colors disabled:opacity-40">
            Svuota anno
          </button>
          <button onClick={onExport} disabled={dati.length === 0}
            className="text-blu border border-blu rounded px-3 py-1 text-xs font-semibold hover:bg-blu hover:text-white transition-colors disabled:opacity-40">
            Esporta PDF
          </button>
        </div>
      </div>
    </div>
  );
}