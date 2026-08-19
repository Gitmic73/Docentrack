import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MAX_MIN = 2400;       // 40 ore
const APPROACH_MIN = 1440;  // 60% = 24 ore

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const anno = body.anno;
    const sez = body.sez || null;
    const totaleMinA = Number(body.totaleMinA) || 0;
    const totaleMinB = Number(body.totaleMinB) || 0;

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
          body: 'Gentile ' + nome + ',\n\ncon l\'attività appena svolta hai raggiunto il limite massimo di 40 ore per la sezione "' + sez + '" delle attività funzionali all\'insegnamento - a.s. ' + anno + '.\nOre svolte: ' + fmtH(min) + '.\nL\'obbligo CCNL è assolto.\n\nGrazie per aver usato DocentTrack',
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
            body: 'Gentile ' + nome + ',\n\nstai per raggiungere il limite di 40 ore per la sezione "' + sez + '" delle attività funzionali all\'insegnamento - a.s. ' + anno + '.\nOre svolte: ' + fmtH(min) + ' su 40 (' + pct(min) + '% / 100%). Mancano ' + fmtH(MAX_MIN - min) + ' al completamento.\n\nGrazie per aver scelto DocentTrack',
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
          body: 'Gentile ' + nome + ',\n\nMancano circa ' + days + ' giorni alla fine dell\'anno scolastico ' + anno + ' (30 giugno).\nHai totalizzato ' + fmtH(totalBoth) + ' ore su 80 (40+40).\nTi invitiamo a completare le ore residue.\n\n— DocentTrack',
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