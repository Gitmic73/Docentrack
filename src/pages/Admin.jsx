import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Users, UserX, Activity, ChevronUp, ChevronDown, ChevronsUpDown, Clock, Pause, CircleSlash, Ban, CircleCheck, Trash2, AlertTriangle } from 'lucide-react';

const STATO_LABEL = {
  attivo: 'Attivo',
  inattivo: 'Inattivo',
  mai_usata: 'Mai usata',
};
const STATO_BADGE = {
  attivo: 'bg-verde-light text-verde',
  inattivo: 'bg-[#F4E8D0] text-oro',
  mai_usata: 'bg-[#F4E8D0] text-grigio',
};

export default function Admin() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  async function handleAction(action, userId) {
    setActionLoading(userId + action);
    setActionMsg('');
    try {
      await base44.functions.invoke('adminManageUser', { action, userId });
      const res = await base44.functions.invoke('getAdminStats', {});
      setData(res.data);
      setConfirmDelete(null);
      setActionMsg(action === 'delete' ? 'Account eliminato definitivamente' : action === 'disable' ? 'Account disabilitato' : 'Account riattivato');
      setTimeout(() => setActionMsg(''), 4000);
    } catch (e) {
      setActionMsg(e.message || 'Errore durante l\'operazione');
    } finally {
      setActionLoading(null);
    }
  }

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

  const { activeUsers = [], deletedUsers = [] } = data || {};

  const conteggiStato = useMemo(() => {
    const c = { attivo: 0, inattivo: 0, mai_usata: 0 };
    activeUsers.forEach((u) => { if (c[u.stato] != null) c[u.stato]++; });
    return c;
  }, [activeUsers]);

  const sortedUsers = useMemo(() => {
    const arr = [...activeUsers];
    arr.sort((a, b) => {
      let va, vb;
      if (sortKey === 'attivita_count') {
        va = a.attivita_count; vb = b.attivita_count;
      } else if (sortKey === 'stato') {
        va = a.stato; vb = b.stato;
      } else if (['scadenza', 'last_access', 'last_activity_date', 'created_date'].includes(sortKey)) {
        va = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
        vb = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
      } else {
        va = (a[sortKey] || '').toString().toLowerCase();
        vb = (b[sortKey] || '').toString().toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [activeUsers, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(['attivita_count', 'created_date', 'last_access', 'last_activity_date', 'scadenza'].includes(key) ? 'desc' : 'asc');
    }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronsUpDown size={11} className="inline ml-0.5 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="inline ml-0.5 text-blu" />
      : <ChevronDown size={12} className="inline ml-0.5 text-blu" />;
  }

  function Th({ col, label, align = 'left' }) {
    return (
      <th
        onClick={() => handleSort(col)}
        className={`px-3 py-2 text-[10px] uppercase tracking-wide text-grigio font-semibold cursor-pointer select-none hover:text-blu transition-colors ${align === 'center' ? 'text-center' : 'text-left'}`}
      >
        {label} <SortIcon col={col} />
      </th>
    );
  }

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

      {actionMsg && (
      <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${actionMsg.includes('eliminato') || actionMsg.includes('disabilitato') || actionMsg.includes('riattivato') ? 'bg-verde-light text-verde' : 'bg-rosso-light text-rosso'}`}>
        {actionMsg}
      </div>
      )}

        <div className="grid grid-cols-3 gap-3 mb-4">
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

        {/* Riepilogo tipologie di stato */}
        <div className="bg-white border border-bordo rounded-lg p-4 mb-6">
          <h2 className="text-[11px] uppercase tracking-wide text-grigio font-semibold mb-3">Riepilogo stati</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-verde-light flex items-center justify-center shrink-0">
                <Activity size={16} className="text-verde" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground leading-none">{conteggiStato.attivo}</div>
                <div className="text-[10px] text-grigio uppercase tracking-wide mt-0.5">Attivi</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F4E8D0] flex items-center justify-center shrink-0">
                <Pause size={16} className="text-oro" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground leading-none">{conteggiStato.inattivo}</div>
                <div className="text-[10px] text-grigio uppercase tracking-wide mt-0.5">Inattivi (30+ gg)</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F4E8D0] flex items-center justify-center shrink-0">
                <CircleSlash size={16} className="text-grigio" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground leading-none">{conteggiStato.mai_usata}</div>
                <div className="text-[10px] text-grigio uppercase tracking-wide mt-0.5">Mai usata</div>
              </div>
            </div>
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
                  <Th col="email" label="Email" />
                  <Th col="full_name" label="Nome" />
                  <Th col="created_date" label="Registrato il" />
                  <Th col="scadenza" label="Scadenza" />
                  <Th col="attivita_count" label="N. attività" align="center" />
                  <Th col="last_activity_date" label="Ultima attività" />
                  <Th col="stato" label="Stato" align="center" />
                  <th className="px-3 py-2 text-[10px] uppercase tracking-wide text-grigio font-semibold text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => {
                  const scad = u.scadenza ? new Date(u.scadenza) : null;
                  const scaduta = scad && scad.getTime() < Date.now();
                  return (
                    <tr key={u.id} className="border-b border-bordo hover:bg-[#F4E8D0]">
                      <td className="px-3 py-2 select-text">{u.email}</td>
                      <td className="px-3 py-2 select-text">{u.full_name || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{u.created_date ? new Date(u.created_date).toLocaleDateString('it-IT') : '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {scad ? (
                          <span className={scaduta ? 'text-rosso font-semibold' : 'text-foreground'}>
                            {scad.toLocaleDateString('it-IT')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{u.attivita_count}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{u.last_activity_date ? new Date(u.last_activity_date).toLocaleDateString('it-IT') : '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {u.disabled ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rosso-light text-rosso">Disabilitato</span>
                        ) : (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATO_BADGE[u.stato]}`}>
                            {STATO_LABEL[u.stato]}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAction(u.disabled ? 'enable' : 'disable', u.id)}
                            disabled={!!actionLoading}
                            className={`p-1.5 rounded transition-colors disabled:opacity-50 ${u.disabled ? 'text-verde hover:bg-verde-light' : 'text-oro hover:bg-[#F4E8D0]'}`}
                            title={u.disabled ? 'Riattiva account' : 'Disabilita account'}
                          >
                            {u.disabled ? <CircleCheck size={15} /> : <Ban size={15} />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded text-rosso hover:bg-rosso-light transition-colors disabled:opacity-50"
                            title="Elimina account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {activeUsers.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-4 text-center text-grigio italic">Nessun utente registrato</td></tr>
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
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <div className="bg-white rounded-lg max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 text-rosso mb-3">
                <AlertTriangle size={20} />
                <h3 className="font-display text-base font-semibold">Elimina account</h3>
              </div>
              <p className="text-sm text-grigio mb-4">
                Confermi l'eliminazione definitiva dell'account di <strong className="text-foreground">{confirmDelete.email}</strong>? Tutti i dati associati (attività, scuole, anni scolastici) verranno cancellati.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="text-grigio border border-bordo rounded px-4 py-1.5 text-sm hover:bg-[#F4E8D0]">Annulla</button>
                <button
                  onClick={() => handleAction('delete', confirmDelete.id)}
                  disabled={!!actionLoading}
                  className="bg-rosso text-white rounded px-4 py-1.5 text-sm font-semibold hover:bg-[#8e2e26] disabled:opacity-50"
                >
                  {actionLoading ? 'Eliminazione…' : 'Elimina definitivamente'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}