import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRegistro } from '@/hooks/useRegistro';
import { base44 } from '@/api/base44Client';
import NavAnni from '@/components/registro/NavAnni';
import Intestazione from '@/components/registro/Intestazione';
import SezioneRegistro from '@/components/registro/SezioneRegistro';
import ModalEdit from '@/components/registro/ModalEdit';
import ModalScuola from '@/components/registro/ModalScuola';
import NuovoAnnoModal from '@/components/registro/NuovoAnnoModal';
import CancellaAnnoModal from '@/components/registro/CancellaAnnoModal';
import ProfileSetup from '@/components/registro/ProfileSetup';
import SidebarMenu from '@/components/registro/SidebarMenu';
import PannelloPiani from '@/components/registro/PannelloPiani';
import PannelloDatiPersonali from '@/components/registro/PannelloDatiPersonali';
import PannelloInvita from '@/components/registro/PannelloInvita';
import PannelloRecensione from '@/components/registro/PannelloRecensione';
import FooterLegale from '@/components/registro/FooterLegale';
import CalendarioMese from '@/components/registro/CalendarioMese';
import PieChartTipologie from '@/components/registro/PieChartTipologie';
import BarChartTipologie from '@/components/registro/BarChartTipologie';
import BarChartMensile from '@/components/registro/BarChartMensile';
import RiepilogoTipologie from '@/components/registro/RiepilogoTipologie';
import BottomTabs from '@/components/registro/BottomTabs';
import PullToRefresh from '@/components/registro/PullToRefresh';
import { esportaPDF } from '@/components/registro/pdfExport';
import { esportaCSV } from '@/components/registro/csvExport';
import ExportToolbar from '@/components/registro/ExportToolbar';
import { ClipboardList, Calendar, PieChart, ListChecks } from 'lucide-react';

export default function Home() {
  const r = useRegistro();
  const navigate = useNavigate();
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

  const setVista = (v) => patchParams({ tab: v, modal: null, id: null });
  const openModal = (name, id) => patchParams({ modal: name, id: id || null });
  const closeModal = () => patchParams({ modal: null, id: null }, true);

  if (r.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAF4EA]">
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

  const meseCorrente = new Date().toISOString().slice(0, 7);
  const hasMeseAttivita = allAttivita.some((a) => (a.data || '').slice(0, 7) === meseCorrente);

  function handleExport() {
    esportaPDF({
      docente: r.nomeDocente,
      profilo: r.profilo,
      scuola: r.scuola,
      scuolaSeconda: r.scuolaSeconda,
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

  async function handleExportAllCSV() {
    const all = await base44.entities.Attivita.list('-data', 1000);
    esportaCSV({
      docente: r.nomeDocente,
      anno: 'tutti',
      attivitaA: all.filter((x) => x.sezione === 'a'),
      attivitaB: all.filter((x) => x.sezione === 'b'),
    });
  }

  function handleExportMese() {
    esportaPDF({
      docente: r.nomeDocente,
      profilo: r.profilo,
      scuola: r.scuola,
      scuolaSeconda: r.scuolaSeconda,
      anno: r.annoCorrente,
      attivitaA: r.attivitaA,
      attivitaB: r.attivitaB,
      mese: meseCorrente,
    });
  }

  return (
    <div className="min-h-screen bg-[#FAF4EA] pb-24 md:pb-12 font-body text-foreground">
      <PullToRefresh onRefresh={r.refresh} disabled={!!modal}>
        <div className="pt-[env(safe-area-inset-top,16px)] md:pt-0">
          <div className="h-[5px] bg-gradient-to-r from-blu to-oro" />
          <div className="max-w-[820px] mx-auto px-3">
            <Intestazione
              annoCorrente={r.annoCorrente}
              nomeDocente={r.nomeDocente}
              scuolaNome={r.scuola?.nome}
          scuolaSecondaNome={r.scuolaSeconda?.nome}
              onEditNome={r.updateNomeDocente}
              onEditScuola={() => openModal('scuola')}
              onOpenSettings={() => openModal('profilo')}
              onOpenMenu={() => openModal('menu')}
            />

            <div className="h-3" />

            <NavAnni
              anni={r.anni}
              annoCorrente={r.annoCorrente}
              onCambia={r.cambiaAnno}
              onNuovo={() => openModal('nuovoanno')}
              onCancella={() => openModal('cancellaanno')}
              disabled={r.saving}
            />

            <div className="hidden md:flex gap-1.5 mb-4 bg-white border border-bordo rounded-lg p-1 select-none sticky top-0 z-30 shadow-sm">
              {[
                { k: 'registro', l: 'Registro', icon: ClipboardList },
                { k: 'calendario', l: 'Calendario', icon: Calendar },
                { k: 'riepilogo', l: 'Riepilogo', icon: ListChecks, novita: true },
                { k: 'statistiche', l: 'Statistiche', icon: PieChart },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.k}
                    onClick={() => setVista(t.k)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-1.5 rounded-md transition-colors relative ${
                      vista === t.k ? 'bg-blu text-white' : 'text-grigio hover:bg-blu-light'
                    }`}
                  >
                    <Icon size={15} />
                    {t.l}
                    {t.novita && (
                      <span className="absolute -top-1.5 -right-1 bg-rosso text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">NEW</span>
                    )}
                  </button>
                );
              })}
            </div>

            <ExportToolbar onPDF={handleExport} onCSV={handleCSV} onPDFMese={handleExportMese} disabled={allAttivita.length === 0} disabledMese={!hasMeseAttivita} />

            <AnimatePresence mode="wait">
              {vista === 'registro' && (
                <motion.div key="registro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <SezioneRegistro
                    sezione="a"
                    annoCorrente={r.annoCorrente}
                    dati={r.attivitaA}
                    onAdd={(rec) => r.addAttivita('a', rec)}
                    onEdit={(v) => openModal('edit', v.id)}
                    onDelete={r.deleteAttivita}
                    onSvuota={() => r.svuotaSezione('a')}
                    saving={r.saving}
                    hasSeconda={!!r.scuolaSeconda}
                  />
                  <SezioneRegistro
                    sezione="b"
                    annoCorrente={r.annoCorrente}
                    dati={r.attivitaB}
                    onAdd={(rec) => r.addAttivita('b', rec)}
                    onEdit={(v) => openModal('edit', v.id)}
                    onDelete={r.deleteAttivita}
                    onSvuota={() => r.svuotaSezione('b')}
                    saving={r.saving}
                    hasSeconda={!!r.scuolaSeconda}
                  />
                </motion.div>
              )}
              {vista === 'calendario' && (
                <motion.div key="calendario" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <CalendarioMese attivita={allAttivita} />
                </motion.div>
              )}
              {vista === 'riepilogo' && (
                <motion.div key="riepilogo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <RiepilogoTipologie attivitaA={r.attivitaA} attivitaB={r.attivitaB} />
                </motion.div>
              )}
              {vista === 'statistiche' && (
                <motion.div key="statistiche" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <div className="space-y-4">
                    <BarChartMensile
                      attivitaA={r.attivitaA}
                      attivitaB={r.attivitaB}
                      titolo="Carico mensile — ore per mese (lett. a + lett. b)"
                    />
                    <BarChartTipologie
                      attivita={allAttivita}
                      titolo="Ore per tipologia — Totale anno (ordinato per tempo)"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <PieChartTipologie attivita={r.attivitaA} titolo="Lett. a — 40 ore" />
                      <PieChartTipologie attivita={r.attivitaB} titolo="Lett. b — 40 ore" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <FooterLegale />
          </div>
        </div>
      </PullToRefresh>

      <BottomTabs vista={vista} onChange={setVista} />

      <ModalEdit
        open={modal === 'edit' && !!editRecord}
        record={editRecord}
        sezione={editSezione}
        annoCorrente={r.annoCorrente}
        onClose={closeModal}
        onSave={(id, rec) => { r.updateAttivita(id, rec); closeModal(); }}
        saving={r.saving}
        hasSeconda={!!r.scuolaSeconda}
      />
      <ModalScuola
        open={modal === 'scuola'}
        annoCorrente={r.annoCorrente}
        scuolaPrima={r.scuola}
        scuolaSeconda={r.scuolaSeconda}
        onClose={closeModal}
        onSave={(prima, seconda) => { r.saveScuolaBoth(prima, seconda); closeModal(); }}
        saving={r.saving}
      />
      <NuovoAnnoModal
        open={modal === 'nuovoanno'}
        suggerito={r.suggerisciProssimo()}
        onClose={closeModal}
        onCrea={(nome) => {
          if (r.canCreateYear(nome)) {
            r.nuovoAnno(nome);
            closeModal();
          } else {
            patchParams({ modal: 'piano', id: nome });
          }
        }}
      />
      <CancellaAnnoModal
        open={modal === 'cancellaanno'}
        anni={r.anni}
        annoCorrente={r.annoCorrente}
        onClose={closeModal}
        onConferma={(anno) => r.cancellaAnno(anno).then(() => closeModal())}
        saving={r.saving}
      />
      <PannelloDatiPersonali
        open={modal === 'profilo'}
        email={r.email}
        nomeDocente={r.nomeDocente}
        telefono={r.telefono}
        docenteDi={r.docenteDi}
        onClose={closeModal}
        onSave={(data) => { r.saveDatiPersonali(data); closeModal(); }}
        onLogout={r.logout}
        onDeleteAccount={r.deleteAccount}
        onExportCSV={handleExportAllCSV}
        saving={r.saving}
      />
      <SidebarMenu
        open={modal === 'menu'}
        nomeDocente={r.nomeDocente}
        piano={r.piano}
        isAdmin={r.user?.role === 'admin'}
        onClose={closeModal}
        onNavigate={(m) => patchParams({ modal: m, id: null })}
        onAdmin={() => navigate('/admin')}
        onExportPDF={handleExport}
        onExportCSV={handleCSV}
      />
      <PannelloPiani
        open={modal === 'piani' || modal === 'piano'}
        piano={r.piano}
        annoGratuito={r.annoGratuito}
        anniLicenza={r.anniLicenza}
        adsRemoved={r.adsRemoved}
        targetAnno={modal === 'piano' ? editId : null}
        prossimoAnno={r.suggerisciProssimo()}
        onClose={closeModal}
        onAcquistaAnno={r.acquistaAnno}
        onAcquistaPermanente={r.acquistaPermanente}
        onAcquistaRimozioneAds={r.acquistaRimozioneAds}
        onAnnoSbloccato={(anno) => r.nuovoAnno(anno)}
        saving={r.saving}
      />
      <PannelloInvita open={modal === 'invita'} onClose={closeModal} />
      <PannelloRecensione open={modal === 'recensione'} onClose={closeModal} />
    </div>
  );
}