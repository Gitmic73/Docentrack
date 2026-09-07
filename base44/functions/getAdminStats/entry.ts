import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // List all users (service role bypasses built-in User permissions)
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);

    // Count activities per user in a single query
    const allActivities = await base44.asServiceRole.entities.Attivita.list('-created_date', 2000);
    const countByUser = {};
    for (const a of allActivities) {
      countByUser[a.created_by_id] = (countByUser[a.created_by_id] || 0) + 1;
    }

    const activeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.data?.nome_docente || u.full_name || '',
      created_date: u.created_date,
      attivita_count: countByUser[u.id] || 0,
    }));

    // List deletion audit records
    const deletedUsers = await base44.asServiceRole.entities.AuditDisinstallazione.list('-created_date', 500);

    return Response.json({ activeUsers, deletedUsers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}