import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getEntitlementRecord } from '../../shared/entitlement.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Disabled flag lives in the protected Entitlement entity, not user.data.
    const ent = await getEntitlementRecord(base44, user.id);
    if (ent && ent.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

    // Log the uninstallation (service role bypasses RLS on the audit entity)
    await base44.asServiceRole.entities.AuditDisinstallazione.create({
      email: user.email,
      nome: user.data?.nome_docente || user.full_name || '',
      user_id: user.id,
      data_disinstallazione: new Date().toISOString(),
    });

    // Delete all user-scoped data (RLS restricts to the caller's own records).
    // We pass created_by_id explicitly to keep the query bounded and intentional.
    await base44.entities.Attivita.deleteMany({ created_by_id: user.id });
    await base44.entities.Scuola.deleteMany({ created_by_id: user.id });
    await base44.entities.AnnoScolastico.deleteMany({ created_by_id: user.id });
    // Remove the protected entitlement record too.
    if (ent) {
      try { await base44.asServiceRole.entities.Entitlement.delete(ent.id); } catch (e) { /* best-effort */ }
    }

    // Best-effort deletion of the user record (requires service role).
    // The platform may refuse for the app owner; data is already cleared and the
    // client will log out regardless, so we don't fail the whole request here.
    try {
      await base44.asServiceRole.entities.User.delete(user.id);
    } catch (userErr) {
      return Response.json({ success: true, userDeleted: false, note: userErr.message });
    }

    return Response.json({ success: true, userDeleted: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}