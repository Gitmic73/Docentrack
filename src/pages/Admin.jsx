import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Users, UserX, Activity } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user.role !== 'admin') {
          navigate('/', { replace: true });
          return;
        }
        const res = await base44.functions.invoke('getAdminStats', {});
        setData(res.data);
      } catch (e) {
        setError(e.message || 'Errore di caricamento');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAF4EA]">
        <div className="w-8 h-8 border-4 border-blu-light border-t-blu rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF4EA] flex items-center justify-center font-body">
        <div className="text-center">
          <p className="text-rosso mb-4 text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="bg-blu text-white px-4 py-2 rounded text-sm">Torna alla home</button>
        </div>
      </div>
    );
  }

  const { activeUsers = [], deletedUsers = [] } = data || {};
  const attivi = activeUsers.filter((u) => u.attivita_count > 0).length;

  return (
    <div className="min-h-screen bg-[#FAF4EA] font-body pb-12">
      <div className="h-[5px] bg-gradient-to-r from-blu to-oro" />
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-md border border-bordo text-foreground hover:bg-blu-light transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-xl font-bold text-blu">Pannello Admin</h1>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-bordo rounded-lg p-4">
            <div className="flex items-center gap-2 text-blu mb-1">
              <Users size={16} />
              <span className="text-xs uppercase tracking-wide text-grigio">Registrati</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{activeUsers.length}</div>
          </div>
          <div className="bg-white border border-bordo rounded-lg p-4">
            <div className="flex items-center gap-2 text-verde mb-1">
              <Activity size={16} />
              <span className="text-xs uppercase tracking-wide text-grigio">Hanno usato l'app</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{attivi}</div>
          </div>
          <div className="bg-white border border-bordo rounded-lg p-4">
            <div className="flex items-center gap-2 text-rosso mb-1">
              <UserX size={16} />
              <span className="text-xs uppercase tracking-wide text-grigio">Disinstallati</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{deletedUsers.length}</div>
          </div>
        </div>

        <div className="bg-white border border-bordo rounded-lg overflow-hidden mb-6">
          <div className="bg-blu px-4 py-2.5">
            <h2 className="font-display text-sm font-semibold text-white">Utenti Registrati</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-bordo bg-[#F4E8D0]">
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-grigio font-semibold">Email</th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-grigio font-semibold">Nome</th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-grigio font-semibold">Registrato il</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wide text-grigio font-semibold">N. attività</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wide text-grigio font-semibold">Stato</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((u) => (
                  <tr key={u.id} className="border-b border-bordo hover:bg-[#F4E8D0]">
                    <td className="px-3 py-2 select-text">{u.email}</td>
                    <td className="px-3 py-2 select-text">{u.full_name || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{u.created_date ? new Date(u.created_date).toLocaleDateString('it-IT') : '—'}</td>
                    <td className="px-3 py-2 text-center font-semibold">{u.attivita_count}</td>
                    <td className="px-3 py-2 text-center">
                      {u.attivita_count > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-verde-light text-verde">Attivo</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4E8D0] text-grigio">Mai usata</span>
                      )}
                    </td>
                  </tr>
                ))}
                {activeUsers.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-grigio italic">Nessun utente registrato</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {deletedUsers.length > 0 && (
          <div className="bg-white border border-bordo rounded-lg overflow-hidden">
            <div className="bg-rosso px-4 py-2.5">
              <h2 className="font-display text-sm font-semibold text-white">Utenti Disinstallati</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bordo bg-rosso-light">
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-grigio font-semibold">Email</th>
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-grigio font-semibold">Nome</th>
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-grigio font-semibold">Disinstallato il</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-bordo hover:bg-rosso-light">
                      <td className="px-3 py-2 select-text">{u.email}</td>
                      <td className="px-3 py-2 select-text">{u.nome || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{u.data_disinstallazione ? new Date(u.data_disinstallazione).toLocaleString('it-IT') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}