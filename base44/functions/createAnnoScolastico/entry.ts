import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { ensureEntitlementRecord, canCreateYear, isValidAnno } from '../../shared/entitlement.ts';

// Server-side paywall gate for school-year creation. Verifies the caller's
// entitlement via the protected Entitlement entity (which the user cannot
// write) before creating the AnnoScolastico record. The client's canCreateYear
// is only UX; this is the control.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const nome = body && body.nome;
    if (!isValidAnno(nome)) {
      return Response.json({ error: 'Anno scolastico non valido (formato richiesto: AAAA/AAAA)' }, { status: 400 });
    }

    const ent = await ensureEntitlementRecord(base44, user.id);
    if (!canCreateYear(nome, ent)) {
      return Response.json({ error: 'Anno scolastico non inclus nel tuo piano. Acquista la licenza per sbloccarlo.' }, { status: 403 });
    }

    // Service-role create bypasses the admin-only create RLS; created_by_id is
    // set to the caller so the user can read their own year record.
    const created = await base44.asServiceRole.entities.AnnoScolastico.create({ nome });
    return Response.json({ success: true, id: created.id, nome });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}