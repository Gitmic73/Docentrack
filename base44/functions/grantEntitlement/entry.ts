import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { ensureEntitlementRecord, getEntitlementRecord, isValidAnno } from '../../shared/entitlement.ts';

// This is the ONLY server-side path that writes paid entitlements
// (piano / anni_licenza / ads_removed) — to the protected Entitlement entity,
// NOT to caller-writable user.data. A user cannot self-grant via updateMe.
//
// SECURITY: Every grant is gated by verifyPayment(). Until a real payment
// provider is integrated, verifyPayment() rejects ALL grants — no
// environment variable can bypass the paywall. When payments go live,
// implement the payment-record lookup in verifyPayment() (query a
// completed checkout record for this user matching {action, anno}).

async function verifyPayment(_user, _action, _anno) {
  // No payment provider is connected yet — reject all grants.
  // Replace this with a real payment-record lookup once checkout is live.
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