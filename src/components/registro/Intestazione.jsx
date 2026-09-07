import React, { useState, useEffect } from 'react';
import { Pencil, Settings, Menu } from 'lucide-react';

export default function Intestazione({ annoCorrente, nomeDocente, scuolaNome, scuolaSecondaNome, onEditNome, onEditScuola, onOpenSettings, onOpenMenu }) {
  const [nome, setNome] = useState(nomeDocente);

  useEffect(() => {
    setNome(nomeDocente);
  }, [nomeDocente]);

  function handleBlur() {
    if (nome.trim() && nome !== nomeDocente) {
      onEditNome(nome.trim());
    }
  }

  return (
    <div className="relative text-center pt-7 pb-4 px-4 border-b-2 border-blu bg-white">
      <button
        onClick={onOpenMenu}
        className="absolute left-3 top-3 p-1.5 rounded-md text-grigio hover:bg-blu-light hover:text-blu transition-colors"
        aria-label="Apri menu"
      >
        <Menu size={20} />
      </button>
      <h1 className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-blu to-oro bg-clip-text text-transparent">
        DocenTrack
      </h1>
      <div className="text-[11px] text-grigio mt-0.5">
        Registro Attività Funzionali all'Insegnamento
      </div>
      <div className="flex items-center justify-center gap-2 mt-2.5">
        <label className="text-xs text-grigio">Ins.</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={handleBlur}
          placeholder="Nome e Cognome"
          className="border-0 border-b-[1.5px] border-blu bg-transparent font-display text-[15px] text-center w-[220px] outline-none placeholder:italic placeholder:text-[#bbb] px-1 py-0.5"
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-grigio">
        <strong className="text-blu">{scuolaNome || '—'}{scuolaSecondaNome ? ` · ${scuolaSecondaNome}` : ''}</strong>
        <button
          onClick={onEditScuola}
          className="bg-none border-none text-blu text-[11px] underline cursor-pointer flex items-center gap-1"
        >
          <Pencil size={11} /> dati scuola
        </button>
        <button
          onClick={onOpenSettings}
          className="bg-none border-none text-grigio text-[11px] cursor-pointer flex items-center gap-1 ml-1"
          aria-label="Impostazioni profilo"
        >
          <Settings size={12} /> profilo
        </button>
      </div>
      <div className="text-[10px] uppercase tracking-[1.2px] text-grigio mt-2">
        A.S. {annoCorrente}
      </div>
    </div>
  );
}