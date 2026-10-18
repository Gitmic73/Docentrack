import React, { useState, useEffect } from 'react';
import { Pencil, Settings, Menu, Sun, Moon } from 'lucide-react';
import { setStoredTheme } from '@/lib/theme';
import Logo from './Logo';

export default function Intestazione({ annoCorrente, nomeDocente, scuolaNome, scuolaSecondaNome, onEditNome, onEditScuola, onOpenSettings, onOpenMenu }) {
  const [nome, setNome] = useState(nomeDocente);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setNome(nomeDocente);
  }, [nomeDocente]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const handler = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themechange', handler);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const sysHandler = () => setIsDark(document.documentElement.classList.contains('dark'));
    mql.addEventListener('change', sysHandler);
    return () => {
      window.removeEventListener('themechange', handler);
      mql.removeEventListener('change', sysHandler);
    };
  }, []);

  function toggleTheme() {
    const currentlyDark = document.documentElement.classList.contains('dark');
    setStoredTheme(currentlyDark ? 'light' : 'dark');
  }

  function handleBlur() {
    if (nome.trim() && nome !== nomeDocente) {
      onEditNome(nome.trim());
    }
  }

  return (
    <div className="relative text-center pt-7 pb-4 px-4 border-b-2 border-blu bg-white">
      <button
        onClick={onOpenMenu}
        className="absolute left-3 top-3 rounded-md text-grigio hover:bg-blu-light hover:text-blu transition-colors flex items-center justify-center"
        style={{ minWidth: 44, minHeight: 44, padding: 10 }}
        aria-label="Apri menu"
      >
        <Menu size={20} />
      </button>
      <button
        onClick={toggleTheme}
        className="absolute right-3 top-3 rounded-md text-grigio hover:bg-blu-light hover:text-blu transition-colors flex items-center justify-center"
        style={{ minWidth: 44, minHeight: 44, padding: 10 }}
        aria-label="Cambia tema chiaro/scuro"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="flex items-center justify-center gap-2.5 mb-1">
        <Logo size={40} />
        <h1 className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-blu to-oro bg-clip-text text-transparent">
          DocenTrack
        </h1>
      </div>
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
          className="border-0 border-b-[1.5px] border-blu bg-transparent font-display text-[15px] text-center w-[220px] outline-none placeholder:italic placeholder:text-[#C5CDD9] px-1 py-0.5"
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-grigio">
        <strong className="text-blu">{scuolaNome || '—'}{scuolaSecondaNome ? ` · ${scuolaSecondaNome}` : ''}</strong>
        <button
          onClick={onEditScuola}
          className="bg-none border-none text-blu text-[11px] underline cursor-pointer flex items-center gap-1 justify-center"
          style={{ minHeight: 44, padding: '10px 6px' }}
        >
          <Pencil size={11} /> dati scuola
        </button>
        <button
          onClick={onOpenSettings}
          className="bg-none border-none text-grigio text-[11px] cursor-pointer flex items-center gap-1 justify-center"
          style={{ minHeight: 44, padding: '10px 6px' }}
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