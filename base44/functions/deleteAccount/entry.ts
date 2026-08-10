import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete all user-scoped data (RLS restricts to the caller's own records).
    // We pass created_by_id explicitly to keep the query bounded and intentional.
    await base44.entities.Attivita.deleteMany({ created_by_id: user.id });
    await base44.entities.Scuola.deleteMany({ created_by_id: user.id });
    await base44.entities.AnnoScolastico.deleteMany({ created_by_id: user.id });

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