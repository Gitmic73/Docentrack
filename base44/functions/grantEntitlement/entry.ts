import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { ensureEntitlementRecord, getEntitlementRecord, isValidAnno } from '../../shared/entitlement.ts';

// This is the ONLY server-side path that writes paid entitlements
// (piano / anni_licenza / ads_removed) — now to the protected Entitlement entity,
// NOT to caller-writable user.data. A user cannot self-grant via updateMe.
//
// SECURITY: Every grant is gated by verifyPayment(). DEMO_MODE is sourced from
// the DEMO_MODE environment variable and defaults to FALSE (secure) — so in any
// deployed build that does not explicitly opt in, self-grants are rejected
// with 403 and the paywall cannot be bypassed. Set DEMO_MODE=true in dev
// secrets only to test the checkout flow. When real payments go live, implement
// the payment-record lookup in verifyPayment() and remove the DEMO_MODE path.

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Verify that the caller has a completed payment for the requested action.
// TODO: When real payments are enabled, query a payment/checkout record for
// this user matching {action, anno} and return true only if a valid completed
// payment exists. In demo mode (DEMO_MODE env var = 'true') returns true to
// allow testing the checkout flow; otherwise rejects all grants.
async function verifyPayment(_user, _action, _anno) {
  if (DEMO_MODE) return true;
  return false;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Disabled check reads from the protected Entitlement entity, not user.data.
    const ent = await ensureEntitlementRecord(base44, user.id);
    if (ent.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

    const body = await req.json();
    const { action, anno } = body;

    if (!action || !['anno', 'permanente', 'ads'].includes(action)) {
      return Response.json({ error: 'Azione non valida' }, { status: 400 });
    }

    if (action === 'anno' && !isValidAnno(anno)) {
      return Response.json({ error: 'Anno scolastico non valido (formato richiesto: AAAA/AAAA)' }, { status: 400 });
    }

    // Payment verification gate — rejects when no valid payment is found.
    const paid = await verifyPayment(user, action, action === 'anno' ? anno : null);
    if (!paid) {
      return Response.json({ error: 'Nessun pagamento valido trovato per questa operazione' }, { status: 403 });
    }

    if (action === 'anno') {
      const current = Array.isArray(ent.anni_licenza) ? ent.anni_licenza : [];
      const newLic = Array.from(new Set([...current, anno]));
      await base44.asServiceRole.entities.Entitlement.update(ent.id, { anni_licenza: newLic });
      return Response.json({ success: true, action, anno });
    }

    if (action === 'permanente') {
      await base44.asServiceRole.entities.Entitlement.update(ent.id, { piano: 'permanente', ads_removed: true });
      return Response.json({ success: true, action });
    }

    // action === 'ads'
    await base44.asServiceRole.entities.Entitlement.update(ent.id, { ads_removed: true });
    return Response.json({ success: true, action });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}