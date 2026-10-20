import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getEntitlementRecord } from '../../shared/entitlement.ts';
import { internalErrorBody } from '../../shared/http.ts';

// Calcola la data di scadenza del primo anno gratuito.
// L'a.s. va dal 01/09 al 31/08. Registrazioni di agosto non scadono a fine
// dello stesso agosto ma al 31/08 dell'anno successivo (durata 13 mesi).
function computeScadenza(createdDate) {
  const d = new Date(createdDate);
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();
  let endYear;
  if (month >= 9) {
    // set-dic: a.s. YYYY/YYYY+1 → scade 31/08/YYYY+1
    endYear = year + 1;
  } else if (month <= 7) {
    // gen-lug: a.s. YYYY-1/YYYY → scade 31/08/YYYY
    endYear = year;
  } else {
    // agosto: appartiene al a.s. successivo → scade 31/08/YYYY+1 (13 mesi)
    endYear = year + 1;
  }
  return new Date(endYear, 7, 31, 23, 59, 59).toISOString();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    // Admin's own disabled flag lives in the protected Entitlement entity.
    const adminEnt = await getEntitlementRecord(base44, user.id);
    if (adminEnt && adminEnt.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);

    // Disabled flags live in the protected Entitlement entity (not user.data).
    const allEntitlements = await base44.asServiceRole.entities.Entitlement.list('-created_date', 1000);
    const disabledByUser = {};
    for (const e of allEntitlements) {
      if (e.disabled) disabledByUser[e.user_id || e.created_by_id] = true;
    }

    const allActivities = await base44.asServiceRole.entities.Attivita.list('-created_date', 2000);
    const countByUser = {};
    const lastAccessByUser = {};
    const lastActivityDateByUser = {};
    for (const a of allActivities) {
      countByUser[a.created_by_id] = (countByUser[a.created_by_id] || 0) + 1;
      const ad = a.created_date;
      if (ad && (!lastAccessByUser[a.created_by_id] || new Date(ad) > new Date(lastAccessByUser[a.created_by_id]))) {
        lastAccessByUser[a.created_by_id] = ad;
      }
      // "Ultima attività" = data di inserimento del record (created_date),
      // non il giorno a cui si riferisce l'attività (a.data).
      const dataIns = a.created_date;
      if (dataIns && (!lastActivityDateByUser[a.created_by_id] || new Date(dataIns) > new Date(lastActivityDateByUser[a.created_by_id]))) {
        lastActivityDateByUser[a.created_by_id] = dataIns;
      }
    }

    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    const activeUsers = users.map((u) => {
      const count = countByUser[u.id] || 0;
      // "Ultimo accesso" = il più recente tra updated_date del profilo
      // (riflette interazioni/accessi reali all'app) e ultima attività registrata
      const candidates = [u.updated_date, u.created_date, lastAccessByUser[u.id]].filter(Boolean);
      const lastAccess = candidates.length
        ? candidates.map((d) => new Date(d).getTime()).reduce((a, b) => Math.max(a, b), 0)
        : 0;
      const inactive = lastAccess ? (now - lastAccess) > THIRTY_DAYS : true;
      let stato;
      if (count === 0) stato = 'mai_usata';
      else if (inactive) stato = 'inattivo';
      else stato = 'attivo';
      return {
        id: u.id,
        email: u.email,
        full_name: u.data?.nome_docente || u.full_name || '',
        created_date: u.created_date,
        attivita_count: count,
        last_access: lastAccess,
        last_activity_date: lastActivityDateByUser[u.id] || null,
        scadenza: computeScadenza(u.created_date),
        stato,
        disabled: !!disabledByUser[u.id],
        livelli: Array.isArray(u.livelli) ? u.livelli : (Array.isArray(u.data?.livelli) ? u.data.livelli : []),
      };
    });

    const deletedUsers = await base44.asServiceRole.entities.AuditDisinstallazione.list('-created_date', 500);

    return Response.json({ activeUsers, deletedUsers });
  } catch (error) {
    return Response.json(internalErrorBody(error), { status: 500 });
  }
}