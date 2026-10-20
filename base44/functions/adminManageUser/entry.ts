import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getEntitlementRecord } from '../../shared/entitlement.ts';
import { internalErrorBody } from '../../shared/http.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Admin's own disabled flag lives in the protected Entitlement entity.
    const adminEnt = await getEntitlementRecord(base44, user.id);
    if (adminEnt && adminEnt.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

    const body = await req.json();
    const { action, userId } = body;

    if (!userId || !['disable', 'enable', 'delete'].includes(action)) {
      return Response.json({ error: 'Parametri non validi' }, { status: 400 });
    }

    // L'amministratore non puo agire sul proprio account
    if (userId === user.id) {
      return Response.json({ error: 'Non puoi modificare o eliminare il tuo stesso account' }, { status: 400 });
    }

    if (action === 'disable' || action === 'enable') {
      // Write the disable flag to the protected Entitlement entity (service role),
      // not to caller-writable user.data — so the user cannot clear it via updateMe.
      const targetEnt = await getEntitlementRecord(base44, userId);
      if (targetEnt) {
        await base44.asServiceRole.entities.Entitlement.update(targetEnt.id, { disabled: action === 'disable' });
      } else {
        await base44.asServiceRole.entities.Entitlement.create({
          piano: 'free', anno_gratuito: null, anni_licenza: [], ads_removed: false, disabled: action === 'disable', user_id: userId,
        });
      }
      return Response.json({ success: true, action, userId });
    }

    // action === 'delete'
    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    await base44.asServiceRole.entities.AuditDisinstallazione.create({
      email: targetUser.email || '',
      nome: targetUser.data?.nome_docente || targetUser.full_name || '',
      user_id: userId,
      data_disinstallazione: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.Attivita.deleteMany({ created_by_id: userId });
    await base44.asServiceRole.entities.Scuola.deleteMany({ created_by_id: userId });
    await base44.asServiceRole.entities.AnnoScolastico.deleteMany({ created_by_id: userId });
    // Remove the user's protected entitlement record too.
    const delEnt = await getEntitlementRecord(base44, userId);
    if (delEnt) {
      try { await base44.asServiceRole.entities.Entitlement.delete(delEnt.id); } catch (e) { /* best-effort */ }
    }

    try {
      await base44.asServiceRole.entities.User.delete(userId);
    } catch (e) {
      console.error('[adminManageUser] eliminazione utente non riuscita:', e instanceof Error ? e.message : String(e));
      return Response.json({ success: true, userDeleted: false, note: 'Profilo utente non eliminato' });
    }

    return Response.json({ success: true, action: 'delete', userId });
  } catch (error) {
    return Response.json(internalErrorBody(error), { status: 500 });
  }
}