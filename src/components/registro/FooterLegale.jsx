import React from 'react';

export default function FooterLegale() {
  return (
    <div className="mt-6 px-4 py-3 border-t border-bordo text-[10px] text-grigio text-center leading-[1.7] bg-white rounded-b-lg">
      <strong className="text-blu">Riferimenti normativi:</strong>{' '}
      Art. 29 CCNL Comparto Scuola 29/11/2007 (ex artt. 28-29 CCNL 4/8/1995) —{' '}
      D.Lgs. n. 81/2008 art. 37 c. 12 (formazione sicurezza)
      <br />
      <em>
        Le ore eccedenti le 40 (lett. a) danno diritto al compenso previsto dalla Tabella 5 allegata al CCNL, oppure all'esonero dalla partecipazione.
        Per le ore ex lett. b, il Collegio Docenti delibera le modalità di gestione dell'eccedenza.
      </em>
      <div className="mt-2 pt-1.5 border-t border-bordo text-[9px] text-grigio">
        DocenTrack v1.0 — Registro Attività Funzionali all'Insegnamento · by Michele Maccarrone
        <br />
        © 2026 DocenTrack — Tutti i diritti riservati
      </div>
    </div>
  );
}