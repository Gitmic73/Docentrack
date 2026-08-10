import React, { useState } from 'react';
import { GraduationCap, Building2 } from 'lucide-react';

export default function ProfileSetup({ nomeIniziale, onSave, saving }) {
  const [profilo, setProfilo] = useState(null);
  const [nome, setNome] = useState(nomeIniziale || '');

  return (
    <div className="fixed inset-0 bg-[#f7f6f2] z-[900] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-bordo shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-full max-w-[460px] overflow-hidden">
        <div className="h-[5px] bg-gradient-to-r from-blu to-oro" />
        <div className="p-7">
          <div className="text-[10px] uppercase tracking-[1.2px] text-grigio text-center">Configurazione iniziale</div>
          <h2 className="font-display text-xl font-semibold text-blu text-center mt-1 mb-1">Benvenuto nel Registro</h2>
          <p className="text-center text-xs text-grigio mb-6">
            Seleziona il tuo profilo per personalizzare la gestione delle ore.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setProfilo('docente')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${profilo === 'docente' ? 'border-blu bg-blu-light' : 'border-bordo hover:border-blu/50'}`}
            >
              <GraduationCap size={28} className={profilo === 'docente' ? 'text-blu mx-auto' : 'text-grigio mx-auto'} />
              <div className="font-display text-sm font-semibold mt-2 text-foreground">Docente</div>
              <div className="text-[10px] text-grigio mt-0.5">40+40 ore Art. 29</div>
            </button>
            <button
              onClick={() => setProfilo('ata')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${profilo === 'ata' ? 'border-blu bg-blu-light' : 'border-bordo hover:border-blu/50'}`}
            >
              <Building2 size={28} className={profilo === 'ata' ? 'text-blu mx-auto' : 'text-grigio mx-auto'} />
              <div className="font-display text-sm font-semibold mt-2 text-foreground">Personale ATA</div>
              <div className="text-[10px] text-grigio mt-0.5">Ore di servizio</div>
            </button>
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
            onClick={() => profilo && nome.trim() && onSave(profilo, nome.trim())}
            disabled={!profilo || !nome.trim() || saving}
            className="w-full mt-6 bg-blu text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#12284d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio…' : 'Inizia a registrare'}
          </button>
        </div>
      </div>
    </div>
  );
}