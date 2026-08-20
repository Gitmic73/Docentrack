import React, { useState, useEffect } from 'react';
import { Crown, Calendar, Infinity as InfinityIcon, Ban, Check, AlertCircle } from 'lucide-react';
import ModalShell from './ModalShell';
import { PIANI, PREZZO_RIMOZIONE_ADS, fmtPrezzo } from '@/lib/plans';

export default function PannelloPiani({
  open, piano, annoGratuito, anniLicenza, adsRemoved, targetAnno, prossimoAnno,
  onClose, onAcquistaAnno, onAcquistaPermanente, onAcquistaRimozioneAds, onAnnoSbloccato, saving,
}) {
  const [step, setStep] = useState('lista');
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (open) { setStep('lista'); setItem(null); }
  }, [open]);

  const annoTarget = targetAnno || prossimoAnno;
  const annoSbloccato = piano === 'permanente' || annoTarget === annoGratuito || (anniLicenza || []).includes(annoTarget);

  function seleziona(tipo, label, prezzo, anno) {
    setItem({ tipo, label, prezzo, anno });
    setStep('checkout');
  }

  async function paga() {
    if (!item) return;
    if (item.tipo === 'annuale') {
      await onAcquistaAnno(item.anno);
      if (targetAnno && onAnnoSbloccato) onAnnoSbloccato(item.anno);
    } else if (item.tipo === 'permanente') {
      await onAcquistaPermanente();
    } else if (item.tipo === 'ads') {
      await onAcquistaRimozioneAds();
    }
    setStep('success');
  }

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-[460px]">
      {step === 'lista' && (
        <>
          <h3 className="font-display text-[17px] text-blu mb-1 border-b border-bordo pb-2.5 flex items-center gap-2">
            <Crown size={18} /> I miei piani
          </h3>
          <div className="text-xs text-grigio mb-3">Gestisci la tua licenza e gli anni scolastici sbloccati.</div>

          <div className="rounded-lg border border-bordo bg-[#f4f4f2] p-3 mb-4">
            <div className="text-[10px] text-grigio uppercase tracking-wide">Piano attuale</div>
            <div className="font-display text-base font-semibold text-blu mt-0.5">{(PIANI[piano] || PIANI.free).label}</div>
            <div className="text-[11px] text-grigio mt-1">
              Anno gratuito: <strong className="text-foreground">{annoGratuito || '—'}</strong>
              {piano !== 'permanente' && (anniLicenza || []).length > 0 && (
                <> · Anni sbloccati: <strong className="text-foreground">{anniLicenza.join(', ')}</strong></>
              )}
            </div>
          </div>

          {targetAnno && !annoSbloccato && (
            <div className="rounded-lg border border-oro bg-oro-light p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="text-[#7a5c00] shrink-0 mt-0.5" />
              <div className="text-xs text-foreground">
                Per creare l'anno <strong>{targetAnno}</strong> è necessario sbloccarlo. Scegli un'opzione qui sotto.
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="rounded-lg border border-bordo p-3 flex items-center gap-3">
              <Calendar size={20} className="text-blu shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Rinnovo annuale</div>
                <div className="text-[11px] text-grigio">Sblocca un nuovo anno scolastico</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-blu">{fmtPrezzo(PIANI.annuale.prezzo)}</div>
                <button
                  onClick={() => seleziona('annuale', 'Rinnovo annuale', PIANI.annuale.prezzo, annoTarget)}
                  disabled={annoSbloccato || !annoTarget}
                  className="text-[11px] bg-blu text-white rounded px-2.5 py-1 mt-1 hover:bg-[#12284d] disabled:opacity-40"
                >
                  {annoSbloccato ? 'Già sbloccato' : `Sblocca ${annoTarget || '…'}`}
                </button>
              </div>
            </div>

            <div className="rounded-lg border-2 border-oro p-3 flex items-center gap-3 bg-oro-light/40">
              <InfinityIcon size={20} className="text-oro shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Licenza permanente</div>
                <div className="text-[11px] text-grigio">Tutti gli anni scolastici, per sempre · pubblicità rimossa inclusa</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-blu">{fmtPrezzo(PIANI.permanente.prezzo)}</div>
                {piano === 'permanente' ? (
                  <span className="text-[11px] text-verde font-semibold inline-flex items-center gap-1 mt-1"><Check size={12} /> Attiva</span>
                ) : (
                  <button onClick={() => seleziona('permanente', 'Licenza permanente', PIANI.permanente.prezzo)} className="text-[11px] bg-oro text-white rounded px-2.5 py-1 mt-1 hover:bg-[#a6841e]">Acquista</button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-bordo p-3 flex items-center gap-3">
              <Ban size={20} className="text-grigio shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Rimuovi pubblicità</div>
                <div className="text-[11px] text-grigio">
                  {piano === 'permanente' ? 'Già inclusa nel piano permanente' : 'Nasconde il banner pubblicitario in app'}
                </div>
              </div>
              <div className="text-right shrink-0">
                {adsRemoved || piano === 'permanente' ? (
                  <span className="text-[11px] text-verde font-semibold inline-flex items-center gap-1"><Check size={12} /> Attiva</span>
                ) : (
                  <>
                    <div className="text-sm font-bold text-blu">{fmtPrezzo(PREZZO_RIMOZIONE_ADS)}</div>
                    <button onClick={() => seleziona('ads', 'Rimozione pubblicità', PREZZO_RIMOZIONE_ADS)} className="text-[11px] bg-blu text-white rounded px-2.5 py-1 mt-1 hover:bg-[#12284d]">Acquista</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5 select-none">
            <button onClick={onClose} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee]">Chiudi</button>
          </div>
        </>
      )}

      {step === 'checkout' && item && (
        <>
          <h3 className="font-display text-[17px] text-blu mb-3 border-b border-bordo pb-2.5">Conferma acquisto</h3>
          <div className="rounded-lg border border-bordo bg-[#f4f4f2] p-3 mb-3">
            <div className="text-sm font-semibold text-foreground">{item.label}</div>
            {item.anno && <div className="text-xs text-grigio mt-0.5">Anno scolastico: {item.anno}</div>}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-bordo">
              <span className="text-xs text-grigio">Totale</span>
              <span className="text-lg font-bold text-blu">{fmtPrezzo(item.prezzo)}</span>
            </div>
          </div>
          <div className="rounded-lg border border-oro bg-oro-light/50 p-2.5 mb-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-[#7a5c00] shrink-0 mt-0.5" />
            <div className="text-[11px] text-foreground">
              <strong>Modalità demo:</strong> i pagamenti non sono ancora attivi. L'attivazione è gratuita a scopo di test. Abiliterai il pagamento reale in seguito.
            </div>
          </div>
          <div className="flex justify-between gap-2 mt-2 select-none">
            <button onClick={() => setStep('lista')} disabled={saving} className="text-grigio border border-bordo rounded px-4 py-1.5 text-[13px] hover:bg-[#f0f0ee] disabled:opacity-50">Indietro</button>
            <button onClick={paga} disabled={saving} className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d] disabled:opacity-50 flex items-center gap-1.5">
              {saving ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Elaborazione…</>
              ) : (
                <>Paga e attiva</>
              )}
            </button>
          </div>
        </>
      )}

      {step === 'success' && item && (
        <>
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-verde-light text-verde flex items-center justify-center mx-auto mb-3">
              <Check size={28} />
            </div>
            <h3 className="font-display text-lg text-blu mb-1">Acquisto completato</h3>
            <div className="text-sm text-grigio">
              {item.label} attivato{item.anno ? ` per l'anno ${item.anno}` : ''}.
            </div>
          </div>
          <div className="flex justify-end select-none">
            <button onClick={onClose} className="bg-blu text-white rounded px-4 py-1.5 text-[13px] font-semibold hover:bg-[#12284d]">Chiudi</button>
          </div>
        </>
      )}
    </ModalShell>
  );
}