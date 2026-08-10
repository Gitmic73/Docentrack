import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function NavAnni({ anni, annoCorrente, onCambia, onNuovo, disabled }) {
  const idx = anni.indexOf(annoCorrente);
  return (
    <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-bordo rounded-lg mb-5">
      <button
        onClick={() => onCambia(-1)}
        disabled={idx <= 0 || disabled}
        className="p-1.5 rounded-md border border-bordo text-foreground hover:bg-blu hover:text-white hover:border-blu transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Anno precedente"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="font-display text-base font-semibold text-blu min-w-[120px] text-center">
        {annoCorrente}
      </span>
      <button
        onClick={() => onCambia(1)}
        disabled={idx >= anni.length - 1 || disabled}
        className="p-1.5 rounded-md border border-bordo text-foreground hover:bg-blu hover:text-white hover:border-blu transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Anno successivo"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={onNuovo}
        disabled={disabled}
        className="ml-1 text-xs bg-verde-light text-verde border border-[#9ed6b5] rounded-md px-2.5 py-1.5 hover:bg-verde hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <Plus size={13} /> Nuovo anno
      </button>
    </div>
  );
}