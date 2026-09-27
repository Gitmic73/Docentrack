import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ensureEntitlementRecord, isValidAnno } from '../../shared/entitlement.ts';

const MAX_MIN = 2400;       // 40 ore
const APPROACH_MIN = 1440;  // 60% = 24 ore

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Disabled flag lives in the protected Entitlement entity, not user.data.
    const ent = await ensureEntitlementRecord(base44, user.id);
    if (ent.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

    const body = await req.json();
    const anno = body.anno;
    const sez = body.sez || null;

    // Validate inputs — reject invalid anno or section early.
    if (!isValidAnno(anno)) return Response.json({ error: 'Anno scolastico non valido' }, { status: 400 });
    if (sez !== null && sez !== 'a' && sez !== 'b') return Response.json({ error: 'Sezione non valida' }, { status: 400 });

    // Compute totals SERVER-SIDE from the database — do NOT trust client-supplied
    // values. This prevents callers from triggering emails with fake content.
    const activities = await base44.entities.Attivita.filter({ anno_scolastico: anno });
    let totaleMinA = 0;
    let totaleMinB = 0;
    for (const a of activities) {
      if (a.sezione === 'a') totaleMinA += a.durata_min || 0;
      else if (a.sezione === 'b') totaleMinB += a.durata_min || 0;
    }

    function fmtH(min) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return h + ':' + String(m).padStart(2, '0');
    }
    function pct(min) {
      return Math.min(100, Math.round((min / MAX_MIN) * 100));
    }

    const flags = (user.data && user.data.notif_state) ? { ...user.data.notif_state } : {};
    const sent = [];
    const email = user.email;
    const nome = (user.data && user.data.nome_docente) || user.full_name || 'Docente';

    // Notifica soglia: solo per la sezione appena modificata (a o b)
    if (sez === 'a' || sez === 'b') {
      const min = sez === 'a' ? totaleMinA : totaleMinB;
      const keyApproach = anno + '_' + sez + '_approach';
      const key100 = anno + '_' + sez + '_100';

      if (min >= MAX_MIN) {
        // Raggiunto/superato il 100%: invia sempre (prima volta o aggiornamento successivo)
        const isFirst = !flags[key100];
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Registro ore ' + anno + ' — limite 40 ore raggiunto (lett. ' + sez + ')',
          body: 'Gentile ' + nome + ',<br>con l\'attività appena svolta hai raggiunto il limite massimo di 40 ore per la sezione "' + sez + '" delle attività funzionali all\'insegnamento - a.s. ' + anno + '.<br>Ore svolte: ' + fmtH(min) + '.<br>L\'obbligo CCNL è assolto.<br>Grazie per aver usato DocenTrack',
        });
        flags[key100] = true;
        flags[keyApproach] = true;
        sent.push({ sez: sez, type: isFirst ? 'reached' : 'reached_update' });
      } else if (min >= APPROACH_MIN) {
        // Soglia 60%: una sola volta per anno/sezione
        if (!flags[keyApproach]) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: 'Registro ore ' + anno + ' — vicino al limite 40 ore (lett. ' + sez + ')',
            body: 'Gentile ' + nome + ',<br>stai per raggiungere il limite di 40 ore per la sezione "' + sez + '" delle attività funzionali all\'insegnamento - a.s. ' + anno + '.<br>Ore svolte: ' + fmtH(min) + ' su 40 (' + pct(min) + '% / 100%).<br>Mancano ' + fmtH(MAX_MIN - min) + ' al completamento.<br>Grazie per aver scelto DocenTrack',
          });
          flags[keyApproach] = true;
          sent.push({ sez: sez, type: 'approach' });
        }
      }
    }

    // Notifica scadenza: fine anno scolastico al 30 giugno dell'anno finale
    const parts = String(anno).split('/');
    const endYear = parseInt(parts[1], 10);
    let days = null;
    if (endYear) {
      const end = new Date(endYear, 5, 30).getTime();
      days = Math.ceil((end - Date.now()) / 86400000);
    }
    const totalBoth = totaleMinA + totaleMinB;
    if (days !== null && days > 0 && days <= 60 && totalBoth < MAX_MIN * 2) {
      const key = anno + '_deadline';
      if (!flags[key]) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Registro ore ' + anno + ' — scadenza anno scolastico vicina',
          body: 'Gentile ' + nome + ',<br>Mancano circa ' + days + ' giorni alla fine dell\'anno scolastico ' + anno + ' (30 giugno).<br>Hai totalizzato ' + fmtH(totalBoth) + ' ore su 80 (40+40).<br>Ti invitiamo a completare le ore residue.<br>— DocenTrack',
        });
        flags[key] = true;
        sent.push({ type: 'deadline', days: days });
      }
    }

    if (sent.length > 0) {
      await base44.auth.updateMe({ notif_state: flags });
    }

    return Response.json({ sent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}