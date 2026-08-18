import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MAX_MIN = 2400;
const APPROACH_MIN = 2160;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const anno = body.anno;
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

    // Hour-limit notifications (per section)
    const sections = [['a', totaleMinA], ['b', totaleMinB]];
    for (const [sez, min] of sections) {
      if (min >= MAX_MIN) {
        const key = anno + '_' + sez + '_100';
        if (!flags[key]) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: 'Registro ore ' + anno + ' — limite 40 ore raggiunto (lett. ' + sez + ')',
            body: 'Gentile ' + nome + ',\n\nHai raggiunto il limite massimo di 40 ore per la sezione "' + sez + '" del registro attività funzionali (A.S. ' + anno + ').\nOre svolte: ' + fmtH(min) + '.\n\nL\'obbligo CCNL è assolto.\n\n— DocentTrack',
          });
          flags[key] = true;
          sent.push({ sez: sez, type: 'reached' });
        }
      } else if (min >= APPROACH_MIN) {
        const key = anno + '_' + sez + '_90';
        if (!flags[key]) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: 'Registro ore ' + anno + ' — vicino al limite (lett. ' + sez + ')',
            body: 'Gentile ' + nome + ',\n\nStai per raggiungere il limite di 40 ore per la sezione "' + sez + '" (A.S. ' + anno + ').\nOre svolte: ' + fmtH(min) + ' su 40 (' + pct(min) + '%).\nMancano ' + fmtH(MAX_MIN - min) + ' al completamento.\n\n— DocentTrack',
          });
          flags[key] = true;
          sent.push({ sez: sez, type: 'approaching' });
        }
      }
    }

    // Deadline notification: school year ends June 30 of the end year
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