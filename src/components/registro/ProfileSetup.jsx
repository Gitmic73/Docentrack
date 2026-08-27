import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export default function ProfileSetup({ nomeIniziale, onSave, saving }) {
  const [nome, setNome] = useState(nomeIniziale || '');

  return (
    <div className="fixed inset-0 bg-[#FFFBEB] z-[900] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-bordo shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-full max-w-[460px] overflow-hidden">
        <div className="h-[5px] bg-gradient-to-r from-blu to-oro" />
        <div className="p-7">
          <div className="text-[10px] uppercase tracking-[1.2px] text-grigio text-center">Configurazione iniziale</div>
          <h2 className="font-display text-xl font-semibold text-blu text-center mt-1 mb-1">Benvenuto nel Registro</h2>
          <p className="text-center text-xs text-grigio mb-6">
            Inserisci il tuo nome per iniziare a registrare le ore funzionali.
          </p>

          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-full bg-blu-light flex items-center justify-center text-blu">
              <GraduationCap size={32} />
            </div>
            <div className="font-display text-sm font-semibold mt-2 text-foreground">Docente</div>
            <div className="text-[10px] text-grigio mt-0.5">40+40 ore Art. 29 CCNL</div>
          </div>

          <label className="text-[10px] text-grigio uppercase tracking-[0.4px] block mb-1">Nome e Cognome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome e Cognome"
            className="w-full font-display text-[15px] text-center border-0 border-b-[1.5px] border-blu bg-transparent outline-none placeholder:italic placeholder:text-[#bbb] py-1"
          />

          <button
            onClick={() => nome.trim() && onSave('docente', nome.trim())}
            disabled={!nome.trim() || saving}
            className="w-full mt-6 bg-blu text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#B45309] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio…' : 'Inizia a registrare'}
          </button>
        </div>
      </div>
    </div>
  );
}