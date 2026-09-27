import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// This is the ONLY server-side path that writes paid entitlements
// (piano / anni_licenza / ads_removed) to the user record.
//
// IMPORTANT: Payments are currently in demo mode — entitlements are granted
// without payment verification. Before enabling real payments, add verification
// of a completed payment (e.g. Stripe checkout session or payment record) in
// the switch below, BEFORE calling User.update. Without that, the paywall is
// bypassable via this function.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.data?.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

    const body = await req.json();
    const { action, anno } = body;

    if (!action || !['anno', 'permanente', 'ads'].includes(action)) {
      return Response.json({ error: 'Azione non valida' }, { status: 400 });
    }

    // TODO (before enabling real payments): verify a completed payment for
    // this action/anno here, and reject if no valid payment is found.

    if (action === 'anno') {
      if (!anno || typeof anno !== 'string') return Response.json({ error: 'Anno non valido' }, { status: 400 });
      const current = Array.isArray(user.data?.anni_licenza) ? user.data.anni_licenza : [];
      const newLic = Array.from(new Set([...current, anno]));
      await base44.asServiceRole.entities.User.update(user.id, { anni_licenza: newLic });
      return Response.json({ success: true, action, anno });
    }

    if (action === 'permanente') {
      await base44.asServiceRole.entities.User.update(user.id, { piano: 'permanente', ads_removed: true });
      return Response.json({ success: true, action });
    }

    // action === 'ads'
    await base44.asServiceRole.entities.User.update(user.id, { ads_removed: true });
    return Response.json({ success: true, action });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}