import React, { useState } from 'react';
import { useRegistro } from '@/hooks/useRegistro';
import NavAnni from '@/components/registro/NavAnni';
import Intestazione from '@/components/registro/Intestazione';
import SezioneRegistro from '@/components/registro/SezioneRegistro';
import ModalEdit from '@/components/registro/ModalEdit';
import ModalScuola from '@/components/registro/ModalScuola';
import NuovoAnnoModal from '@/components/registro/NuovoAnnoModal';
import ProfileSetup from '@/components/registro/ProfileSetup';
import FooterLegale from '@/components/registro/FooterLegale';
import { esportaPDF } from '@/components/registro/pdfExport';

export default function Home() {
  const r = useRegistro();
  const [editRecord, setEditRecord] = useState(null);
  const [editSezione, setEditSezione] = useState('a');
  const [scuolaOpen, setScuolaOpen] = useState(false);
  const [nuovoAnnoOpen, setNuovoAnnoOpen] = useState(false);

  if (r.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f7f6f2]">
        <div className="w-8 h-8 border-4 border-blu-light border-t-blu rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!r.profilo) {
    return <ProfileSetup nomeIniziale={r.nomeDocente} onSave={r.saveProfile} saving={r.saving} />;
  }

  function handleEdit(v) {
    setEditSezione(v.sezione);
    setEditRecord(v);
  }

  function handleExport() {
    esportaPDF({
      docente: r.nomeDocente,
      profilo: r.profilo,
      scuola: r.scuola,
      anno: r.annoCorrente,
      attivitaA: r.attivitaA,
      attivitaB: r.attivitaB,
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-12 font-body text-foreground">
      {/* Strip */}
      <div className="h-[5px] bg-gradient-to-r from-blu to-oro" />

      <div className="max-w-[820px] mx-auto px-3">
        <Intestazione
          annoCorrente={r.annoCorrente}
          nomeDocente={r.nomeDocente}
          scuolaNome={r.scuola?.nome}
          onEditNome={r.updateNomeDocente}
          onEditScuola={() => setScuolaOpen(true)}
        />

        <div className="h-3" />

        <NavAnni
          anni={r.anni}
          annoCorrente={r.annoCorrente}
          onCambia={r.cambiaAnno}
          onNuovo={() => setNuovoAnnoOpen(true)}
          disabled={r.saving}
        />

        <SezioneRegistro
          sezione="a"
          dati={r.attivitaA}
          onAdd={(rec) => r.addAttivita('a', rec)}
          onEdit={handleEdit}
          onDelete={r.deleteAttivita}
          onSvuota={() => r.svuotaSezione('a')}
          onExport={handleExport}
          saving={r.saving}
        />

        <SezioneRegistro
          sezione="b"
          dati={r.attivitaB}
          onAdd={(rec) => r.addAttivita('b', rec)}
          onEdit={handleEdit}
          onDelete={r.deleteAttivita}
          onSvuota={() => r.svuotaSezione('b')}
          onExport={handleExport}
          saving={r.saving}
        />

        <FooterLegale />
      </div>

      <ModalEdit
        open={!!editRecord}
        record={editRecord}
        sezione={editSezione}
        onClose={() => setEditRecord(null)}
        onSave={(id, rec) => { r.updateAttivita(id, rec); setEditRecord(null); }}
        saving={r.saving}
      />
      <ModalScuola
        open={scuolaOpen}
        annoCorrente={r.annoCorrente}
        scuola={r.scuola}
        onClose={() => setScuolaOpen(false)}
        onSave={(data) => { r.saveScuola(data); setScuolaOpen(false); }}
        saving={r.saving}
      />
      <NuovoAnnoModal
        open={nuovoAnnoOpen}
        suggerito={r.suggerisciProssimo()}
        onClose={() => setNuovoAnnoOpen(false)}
        onCrea={(nome) => { r.nuovoAnno(nome); setNuovoAnnoOpen(false); }}
      />
    </div>
  );
}