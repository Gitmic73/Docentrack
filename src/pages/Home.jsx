import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegistro } from '@/hooks/useRegistro';
import NavAnni from '@/components/registro/NavAnni';
import Intestazione from '@/components/registro/Intestazione';
import SezioneRegistro from '@/components/registro/SezioneRegistro';
import ModalEdit from '@/components/registro/ModalEdit';
import ModalScuola from '@/components/registro/ModalScuola';
import NuovoAnnoModal from '@/components/registro/NuovoAnnoModal';
import ProfileSetup from '@/components/registro/ProfileSetup';
import ProfileSettings from '@/components/registro/ProfileSettings';
import FooterLegale from '@/components/registro/FooterLegale';
import CalendarioMese from '@/components/registro/CalendarioMese';
import PieChartTipologie from '@/components/registro/PieChartTipologie';
import BarChartTipologie from '@/components/registro/BarChartTipologie';
import BottomTabs from '@/components/registro/BottomTabs';
import PullToRefresh from '@/components/registro/PullToRefresh';
import { esportaPDF } from '@/components/registro/pdfExport';
import { esportaCSV } from '@/components/registro/csvExport';
import ExportToolbar from '@/components/registro/ExportToolbar';

export default function Home() {
  const r = useRegistro();
  const [searchParams, setSearchParams] = useSearchParams();

  const vista = searchParams.get('tab') || 'registro';
  const modal = searchParams.get('modal');
  const editId = searchParams.get('id');

  function patchParams(updates, replace = false) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace });
  }

  const setVista = (v) => patchParams({ tab: v });
  const openModal = (name, id) => patchParams({ modal: name, id: id || null });
  const closeModal = () => patchParams({ modal: null, id: null }, true);

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

  const allAttivita = [...r.attivitaA, ...r.attivitaB];
  const editRecord = editId ? allAttivita.find((a) => a.id === editId) : null;
  const editSezione = editRecord?.sezione || 'a';

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

  function handleCSV() {
    esportaCSV({
      docente: r.nomeDocente,
      anno: r.annoCorrente,
      attivitaA: r.attivitaA,
      attivitaB: r.attivitaB,
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-24 md:pb-12 font-body text-foreground">
      <PullToRefresh onRefresh={r.refresh} disabled={!!modal}>
        <div className="pt-[env(safe-area-inset-top,16px)] md:pt-0">
          <div className="h-[5px] bg-gradient-to-r from-blu to-oro" />
          <div className="max-w-[820px] mx-auto px-3">
            <Intestazione
              annoCorrente={r.annoCorrente}
              nomeDocente={r.nomeDocente}
              scuolaNome={r.scuola?.nome}
              onEditNome={r.updateNomeDocente}
              onEditScuola={() => openModal('scuola')}
              onOpenSettings={() => openModal('profilo')}
            />

            <div className="h-3" />

            <NavAnni
              anni={r.anni}
              annoCorrente={r.annoCorrente}
              onCambia={r.cambiaAnno}
              onNuovo={() => openModal('nuovoanno')}
              disabled={r.saving}
            />

            <div className="hidden md:flex gap-1.5 mb-4 bg-white border border-bordo rounded-lg p-1 select-none">
              {[
                { k: 'registro', l: 'Registro' },
                { k: 'calendario', l: 'Calendario' },
                { k: 'statistiche', l: 'Statistiche' },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setVista(t.k)}
                  className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${
                    vista === t.k ? 'bg-blu text-white' : 'text-grigio hover:bg-blu-light'
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>

            <ExportToolbar onPDF={handleExport} onCSV={handleCSV} disabled={allAttivita.length === 0} />

            {/* All tabs mounted concurrently; visibility toggled to preserve scroll/filter state */}
            <div className={vista === 'registro' ? '' : 'hidden'}>
              <SezioneRegistro
                sezione="a"
                dati={r.attivitaA}
                onAdd={(rec) => r.addAttivita('a', rec)}
                onEdit={(v) => openModal('edit', v.id)}
                onDelete={r.deleteAttivita}
                onSvuota={() => r.svuotaSezione('a')}
                saving={r.saving}
              />
              <SezioneRegistro
                sezione="b"
                dati={r.attivitaB}
                onAdd={(rec) => r.addAttivita('b', rec)}
                onEdit={(v) => openModal('edit', v.id)}
                onDelete={r.deleteAttivita}
                onSvuota={() => r.svuotaSezione('b')}
                saving={r.saving}
              />
            </div>

            <div className={vista === 'calendario' ? '' : 'hidden'}>
              <CalendarioMese attivita={allAttivita} />
            </div>

            <div className={vista === 'statistiche' ? '' : 'hidden'}>
              <div className="space-y-4">
                <BarChartTipologie
                  attivita={allAttivita}
                  titolo="Ore per tipologia — Totale anno (ordinato per tempo)"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <PieChartTipologie attivita={r.attivitaA} titolo="Lett. a — 40 ore" />
                  <PieChartTipologie attivita={r.attivitaB} titolo="Lett. b — 40 ore" />
                </div>
              </div>
            </div>

            <FooterLegale />
          </div>
        </div>
      </PullToRefresh>

      <BottomTabs vista={vista} onChange={setVista} />

      <ModalEdit
        open={modal === 'edit' && !!editRecord}
        record={editRecord}
        sezione={editSezione}
        onClose={closeModal}
        onSave={(id, rec) => { r.updateAttivita(id, rec); closeModal(); }}
        saving={r.saving}
      />
      <ModalScuola
        open={modal === 'scuola'}
        annoCorrente={r.annoCorrente}
        scuola={r.scuola}
        onClose={closeModal}
        onSave={(data) => { r.saveScuola(data); closeModal(); }}
        saving={r.saving}
      />
      <NuovoAnnoModal
        open={modal === 'nuovoanno'}
        suggerito={r.suggerisciProssimo()}
        onClose={closeModal}
        onCrea={(nome) => { r.nuovoAnno(nome); closeModal(); }}
      />
      <ProfileSettings
        open={modal === 'profilo'}
        profilo={r.profilo}
        nomeDocente={r.nomeDocente}
        onClose={closeModal}
        onLogout={r.logout}
        onDeleteAccount={r.deleteAccount}
        saving={r.saving}
      />
    </div>
  );
}