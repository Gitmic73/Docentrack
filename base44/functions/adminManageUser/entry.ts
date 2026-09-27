import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (user.data?.disabled) return Response.json({ error: 'Account disabilitato' }, { status: 403 });

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
      await base44.asServiceRole.entities.User.update(userId, { disabled: action === 'disable' });
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

    try {
      await base44.asServiceRole.entities.User.delete(userId);
    } catch (e) {
      return Response.json({ success: true, userDeleted: false, note: e.message });
    }

    return Response.json({ success: true, action: 'delete', userId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}