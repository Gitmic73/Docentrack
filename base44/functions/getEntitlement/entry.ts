import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { ensureEntitlementRecord } from '../../shared/entitlement.ts';
import { internalErrorBody } from '../../shared/http.ts';

// Returns the caller's authoritative entitlement (piano, anno_gratuito,
// anni_licenza, ads_removed) and disabled status. Creates the default record on
// first call. The client uses this for UX gating; the disabled flag is also
// checked here so AuthContext can block suspended accounts at login.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ent = await ensureEntitlementRecord(base44, user.id);

    // Un account sospeso dall'amministratore non può usare l'app lato server:
    // la sospensione viene comunicata con 403 (e col flag `disabled`), non come
    // risposta positiva.
    if (ent.disabled) {
      return Response.json({ error: 'Account disabilitato', disabled: true }, { status: 403 });
    }

    return Response.json({
      piano: ent.piano || 'free',
      anno_gratuito: ent.anno_gratuito || null,
      anni_licenza: ent.anni_licenza || [],
      ads_removed: !!ent.ads_removed,
      disabled: false,
    });
  } catch (error) {
    return Response.json(internalErrorBody(error), { status: 500 });
  }
}