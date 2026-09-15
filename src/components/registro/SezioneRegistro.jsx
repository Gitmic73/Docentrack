import React, { useState } from 'react';
import { Plus, Pencil, X, ArrowUpDown, Search, SlidersHorizontal } from 'lucide-react';
import { TIPI_A, TIPI_B, MAX_ORE, m2h, fmtD, oggi, t2m, dateInAnnoScolastico, SCUOLA_BADGE_SECONDA, SCUOLA_ROW_SECONDA } from './registroConstants';
import DrawerSelect from './DrawerSelect';

const CONF = {
  a: {
    titolo: "40 ore — Art. 29 CCNL/2007 (lett. a)",
    desc: "Collegio Docenti · programmazione · formazione · consegna pagelle · ricevimenti collettivi · riunioni disciplinari/dipartimentali",
    tipi: TIPI_A,
    headerClass: 'bg-blu',
    barraClass: 'bg-oro',
    pillClass: 'bg-blu-light text-blu',
    btnAddClass: 'bg-blu hover:bg-[#A57635]',
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
    pillClass: 'bg-oro-light text-[#6F5536]',
    btnAddClass: 'bg-oro hover:bg-[#56442A]',
    noteLabel: 'Note / Classe',
    notePlaceholder: 'es. 3A',
    alertEccMsg: 'Il Collegio Docenti delibera la gestione.',
  },
};

export default function SezioneRegistro({ sezione, dati, onAdd, onEdit, onDelete, onSvuota, saving, annoCorrente, hasSeconda }) {
  const c = CONF[sezione];
  const [form, setForm] = useState({ data: oggi(), inizio: '', fine: '', tipo: '', note: '', scuola_tipo: 'prima' });
  const [sort, setSort] = useState({ col: 'data', asc: false });
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [filtDa, setFiltDa] = useState('');
  const [filtA, setFiltA] = useState('');
  const [filtTipo, setFiltTipo] = useState('');
  const [filtScuola, setFiltScuola] = useState('');
  const [showFiltri, setShowFiltri] = useState(false);

  const isAltro = form.tipo.startsWith('Altro');

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

  const filtered = sorted.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(`${v.tipo} ${v.note || ''}`.toLowerCase().includes(q))) return false;
    }
    if (filtDa && v.data < filtDa) return false;
    if (filtA && v.data > filtA) return false;
    if (filtTipo && v.tipo !== filtTipo) return false;
    if (filtScuola && v.scuola_tipo !== filtScuola) return false;
    return true;
  });

  const filtriAttivi = search || filtDa || filtA || filtTipo || filtScuola;
  function resetFiltri() {
    setSearch(''); setFiltDa(''); setFiltA(''); setFiltTipo(''); setFiltScuola('');
  }

  function toggleSort(col) {
    setSort((s) => s.col === col ? { col, asc: !s.asc } : { col, asc: col === 'data' ? false : true });
  }

  function handleAdd() {
    if (!form.data || !form.inizio || !form.fine || !form.tipo) {
      setErr('Compila data, orario di inizio, fine e tipologia.');
      return;
    }
    if (annoCorrente && !dateInAnnoScolastico(form.data, annoCorrente)) {
      const [y1, y2] = annoCorrente.split('/');
      setErr(`La data non rientra nell'anno scolastico ${annoCorrente} (valido dal 01/09/${y1} al 31/08/${y2}). Verifica la data o seleziona l'anno scolastico corretto.`);
      return;
    }
    if (form.tipo.startsWith('Altro') && !form.note.trim()) {
      setErr('Il campo Note è obbligatorio quando si seleziona "Altro".');
      return;
    }
    const dur = t2m(form.fine) - t2m(form.inizio);
    if (dur <= 0) {
      setErr("L'orario di fine deve essere successivo all'inizio.");
      return;
    }
    setErr('');
    onAdd({ data: form.data, inizio: form.inizio, fine: form.fine, tipo: form.tipo, note: form.note, durata_min: dur, scuola_tipo: form.scuola_tipo });
    setForm({ data: form.data, inizio: '', fine: '', tipo: '', note: '', scuola_tipo: form.scuola_tipo });
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
      <div className="px-4 py-2 flex justify-between items-center border-b border-bordo bg-[#F4E8D0]">
        <div className="flex gap-[18px] flex-wrap">
          <div className="stat">
            <span className="block text-lg font-semibold text-verde">{m2h(totMin)}</span>
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
      <div className={`px-4 py-2 bg-[#F4E8D0] border-b border-bordo grid grid-cols-2 ${hasSeconda ? 'sm:grid-cols-[104px_72px_100px_100px_minmax(115px,1fr)_auto]' : 'sm:grid-cols-[104px_100px_100px_minmax(115px,1fr)_auto]'} gap-1.5 items-end select-none`}>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        {hasSeconda && (
          <div>
            <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Scuola</label>
            <select value={form.scuola_tipo} onChange={(e) => setForm({ ...form, scuola_tipo: e.target.value })}
              className="w-full text-xs px-1 py-1 border border-bordo rounded bg-white outline-none focus:border-blu">
              <option value="prima">1ª</option>
              <option value="seconda">2ª</option>
            </select>
          </div>
        )}
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Inizio</label>
          <input type="time" value={form.inizio} onChange={(e) => setForm({ ...form, inizio: e.target.value })}
            className="w-full text-[13px] px-1 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Fine</label>
          <input type="time" value={form.fine} onChange={(e) => setForm({ ...form, fine: e.target.value })}
            className="w-full text-[13px] px-1 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
        </div>
        <div className="min-w-0">
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Tipologia</label>
          <DrawerSelect
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={c.tipi}
            placeholder="— Seleziona —"
            label="Tipologia"
            className="w-full text-[11px] px-1 py-1 border border-bordo rounded bg-white outline-none focus:border-blu"
          />
        </div>
        <button onClick={handleAdd} disabled={saving}
          className={`text-white rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50 ${c.btnAddClass}`}>
          <Plus size={13} className="inline -mt-0.5" /> Aggiungi
        </button>
      </div>
      {err && <div className="px-4 py-1.5 text-[11px] text-rosso bg-rosso-light">{err}</div>}

      {/* Ricerca, note e filtri */}
      <div className="px-4 py-2 bg-[#F4E8D0] border-b border-bordo flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">
            {c.noteLabel}{isAltro && <span className="text-rosso"> *</span>}
          </label>
          <input
            type="text"
            value={form.note}
            placeholder={isAltro ? 'obbligatorio' : c.notePlaceholder}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={`w-full text-xs px-2 py-1.5 border rounded bg-white outline-none focus:border-blu ${isAltro ? 'border-rosso' : 'border-bordo'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Cerca</label>
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-grigio pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Parola chiave…"
              className="w-full text-xs pl-7 pr-2 py-1.5 border border-bordo rounded bg-white outline-none focus:border-blu"
            />
          </div>
        </div>
        <button
          onClick={() => setShowFiltri((s) => !s)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border whitespace-nowrap transition-colors ${showFiltri ? 'bg-blu text-white border-blu' : 'border-bordo text-grigio hover:bg-blu-light'}`}
        >
          <SlidersHorizontal size={13} /> Filtri
        </button>
      </div>
      {showFiltri && (
        <div className={`px-4 py-2 bg-[#F4E8D0] border-b border-bordo grid grid-cols-2 ${hasSeconda ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-2 items-end select-none`}>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Dal</label>
            <input type="date" value={filtDa} onChange={(e) => setFiltDa(e.target.value)}
              className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Al</label>
            <input type="date" value={filtA} onChange={(e) => setFiltA(e.target.value)}
              className="w-full text-xs px-1.5 py-1 border border-bordo rounded bg-white outline-none focus:border-blu" />
          </div>
          <div className="min-w-0">
            <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Categoria</label>
            <DrawerSelect
              value={filtTipo}
              onChange={setFiltTipo}
              options={c.tipi}
              placeholder="Tutte"
              label="Categoria"
              className="w-full text-[11px] px-1 py-1 border border-bordo rounded bg-white outline-none focus:border-blu"
            />
          </div>
          {hasSeconda && (
            <div className="select-none">
              <label className="text-[10px] uppercase tracking-[0.3px] text-grigio block mb-1">Scuola</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setFiltScuola('')}
                  className={`flex-1 text-xs px-1.5 py-1 rounded border transition-colors ${filtScuola === '' ? 'bg-oro text-white border-oro' : 'border-bordo text-grigio hover:bg-oro-light bg-white'}`}
                >Tutte</button>
                <button
                  onClick={() => setFiltScuola('prima')}
                  className={`flex-1 text-xs px-1.5 py-1 rounded border transition-colors ${filtScuola === 'prima' ? 'bg-blu text-white border-blu' : 'border-bordo text-grigio hover:bg-blu-light bg-white'}`}
                >1ª</button>
                <button
                  onClick={() => setFiltScuola('seconda')}
                  className={`flex-1 text-xs px-1.5 py-1 rounded border transition-colors ${filtScuola === 'seconda' ? 'bg-teal-600 text-white border-teal-600' : 'border-bordo text-grigio hover:bg-teal-50 bg-white'}`}
                >2ª</button>
              </div>
            </div>
          )}
          <button onClick={resetFiltri} disabled={!filtriAttivi}
            className="text-xs px-2 py-1.5 rounded border border-bordo text-grigio hover:bg-blu-light disabled:opacity-40">
            Reset
          </button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-bordo">
        {filtered.map((v) => (
          <div key={v.id} className={`px-3 py-2.5 flex items-center gap-2 ${v.scuola_tipo === 'seconda' ? SCUOLA_ROW_SECONDA : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-foreground">{fmtD(v.data)}</span>
                <span className="text-[10px] text-grigio whitespace-nowrap">{v.inizio}–{v.fine}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 min-w-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.pillClass} truncate max-w-full`} title={v.tipo}>{v.tipo}</span>
                {v.scuola_tipo === 'seconda' && (
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${SCUOLA_BADGE_SECONDA}`}>2ª</span>
                )}
                {v.note && <span className="text-grigio text-[10px] truncate select-text">{v.note}</span>}
              </div>
            </div>
            <div className="text-sm font-semibold text-blu whitespace-nowrap">{m2h(v.durata_min)}</div>
            <div className="flex shrink-0">
              <button onClick={() => onEdit(v)} className="w-11 h-11 flex items-center justify-center text-grigio hover:text-blu rounded-lg hover:bg-blu-light transition-colors" title="Modifica" aria-label="Modifica"><Pencil size={18} /></button>
              <button onClick={() => onDelete(v.id)} className="w-11 h-11 flex items-center justify-center text-grigio hover:text-rosso rounded-lg hover:bg-rosso-light transition-colors" title="Elimina" aria-label="Elimina"><X size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <table className="hidden md:table w-full border-collapse text-xs">
        <thead>
          <tr>
            {[
              { k: 'data', l: 'Data' },
              { k: 'orario', l: 'Orario' },
              { k: 'tipo', l: 'Tipologia' },
              { k: 'dur', l: 'Durata' },
            ].map((h) => (
              <th key={h.k} onClick={() => toggleSort(h.k)}
                className={`px-2.5 py-1.5 text-[10px] uppercase tracking-[0.5px] text-grigio font-semibold border-b border-bordo text-left bg-[#F4E8D0] cursor-pointer hover:text-blu whitespace-nowrap ${sort.col === h.k ? 'text-blu' : ''}`}>
                {h.l} <ArrowUpDown size={9} className="inline opacity-50" />
              </th>
            ))}
            <th className="px-2.5 py-1.5 border-b border-bordo bg-[#F4E8D0]"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id} className={`border-b border-bordo hover:bg-[#F4E8D0] ${v.scuola_tipo === 'seconda' ? SCUOLA_ROW_SECONDA : ''}`}>
              <td className="px-2.5 py-1.5">{fmtD(v.data)}</td>
              <td className="px-2.5 py-1.5 whitespace-nowrap">{v.inizio}–{v.fine}</td>
              <td className="px-2.5 py-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.pillClass}`} title={v.tipo}>{v.tipo}</span>
                {v.scuola_tipo === 'seconda' && (
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-1 ${SCUOLA_BADGE_SECONDA}`}>2ª</span>
                )}
                {v.note && <span className="text-grigio text-[10px] ml-1 select-text">{v.note}</span>}
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
      {dati.length === 0 ? (
        <div className="text-center py-5 text-grigio italic text-[13px]">
          Nessuna attività registrata per questo anno scolastico
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-grigio italic text-[13px]">
          Nessun risultato per la ricerca
        </div>
      ) : null}

      {/* Footer sezione */}
      <div className="px-4 py-2 border-t border-bordo bg-[#F4E8D0] flex items-center justify-between gap-2.5 flex-wrap">
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
        <div className="flex gap-1.5 select-none">
          <button onClick={onSvuota} disabled={saving || dati.length === 0}
            className="text-rosso border border-rosso rounded px-3 py-1 text-xs font-semibold hover:bg-rosso hover:text-white transition-colors disabled:opacity-40">
            Svuota anno
          </button>
        </div>
      </div>
    </div>
  );
}