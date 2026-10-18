import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { suggerisciAnno, annoScolasticoDaData } from '@/components/registro/registroConstants';
import { schoolYearFromDate, canCreateYear as canCreateYearFn } from '@/lib/plans';

export function useRegistro() {
  const [user, setUser] = useState(null);
  const [anni, setAnni] = useState([]);
  const [annoCorrente, setAnnoCorrente] = useState(null);
  const [attivitaA, setAttivitaA] = useState([]);
  const [attivitaB, setAttivitaB] = useState([]);
  const [scuola, setScuola] = useState(null);
  const [scuolaSeconda, setScuolaSeconda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  // Profilo utente — i campi custom vivono al top-level dell'oggetto User (non in .data)
  const profilo = user?.profilo || null;
  const nomeDocente = user?.nome_docente || user?.full_name || '';
  const [entitlement, setEntitlement] = useState({ piano: 'free', anno_gratuito: null, anni_licenza: [], ads_removed: false, disabled: false });
  const piano = entitlement.piano || 'free';
  const annoGratuito = entitlement.anno_gratuito || null;
  const anniLicenza = entitlement.anni_licenza || [];
  const adsRemoved = !!entitlement.ads_removed;
  const email = user?.email || '';
  const telefono = user?.telefono || '';
  const docenteDi = user?.docente_di || '';

  const loadAnni = useCallback(async () => {
    const list = await base44.entities.AnnoScolastico.list('nome');
    return list.map((a) => a.nome).sort();
  }, []);

  const controllaNotifiche = useCallback(async (anno, sez, aMin, bMin) => {
    try {
      await base44.functions.invoke('checkNotifications', { anno, sez, totaleMinA: aMin, totaleMinB: bMin });
    } catch (e) { /* notifiche non bloccanti */ }
  }, []);

  const refreshEntitlement = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('getEntitlement', {});
      setEntitlement(res.data);
    } catch (e) { /* ignore */ }
  }, []);

  // Migrazione una-tantum: ricolloca ogni attività nell'anno scolastico corretto in base alla data
  const redistributeByDate = useCallback(async () => {
    const all = await base44.entities.Attivita.list('-data', 1000);
    const updates = [];
    const yearsNeeded = new Set();
    for (const a of all) {
      const correct = annoScolasticoDaData(a.data);
      if (!correct) continue;
      yearsNeeded.add(correct);
      if (correct !== a.anno_scolastico) {
        updates.push({ id: a.id, anno_scolastico: correct });
      }
    }
    if (updates.length) {
      await base44.entities.Attivita.bulkUpdate(updates);
    }
    const existing = await base44.entities.AnnoScolastico.list();
    const have = new Set(existing.map((x) => x.nome));
    const toCreate = [...yearsNeeded].filter((y) => !have.has(y));
    for (const y of toCreate) {
      try { await base44.functions.invoke('createAnnoScolastico', { nome: y }); } catch (e) { /* anno non in piano: salta */ }
    }
    return updates.length;
  }, []);

  const loadData = useCallback(async (anno) => {
    if (!anno) return;
    const [a, b, s] = await Promise.all([
      base44.entities.Attivita.filter({ sezione: 'a', anno_scolastico: anno }, 'data'),
      base44.entities.Attivita.filter({ sezione: 'b', anno_scolastico: anno }, 'data'),
      base44.entities.Scuola.filter({ anno_scolastico: anno }),
    ]);
    setAttivitaA(a);
    setAttivitaB(b);
    setScuola(s.find(x => (x.tipo || 'prima') === 'prima') || null);
    setScuolaSeconda(s.find(x => x.tipo === 'seconda') || null);
    const aMin = a.reduce((sum, v) => sum + (v.durata_min || 0), 0);
    const bMin = b.reduce((sum, v) => sum + (v.durata_min || 0), 0);
    controllaNotifiche(anno, null, aMin, bMin);
  }, [controllaNotifiche]);

  // Init: utente + anni + dati
  useEffect(() => {
    (async () => {
      let u = null;
      try { u = await base44.auth.me(); } catch (e) { setUser(null); }
      let freeYear = schoolYearFromDate();
      if (u) {
        // Entitlements are authoritative server-side (protected Entitlement entity).
        try {
          const entRes = await base44.functions.invoke('getEntitlement', {});
          setEntitlement(entRes.data);
          freeYear = entRes.data?.anno_gratuito || freeYear;
        } catch (e) { /* ignore */ }
        setUser(u);
        }
        if (u && !u?.data?.mig_date_range_v1) {
        try { await redistributeByDate(); } catch (e) { /* ignore */ }
        try { await base44.auth.updateMe({ mig_date_range_v1: true }); } catch (e) { /* ignore */ }
        u = await base44.auth.me();
        setUser(u);
        }
        let a = await loadAnni();
      if (a.length === 0) {
        try { await base44.functions.invoke('createAnnoScolastico', { nome: freeYear }); } catch (e) { /* ignore */ }
        a = [freeYear];
      }
      setAnni(a);
      const ac = a[a.length - 1];
      setAnnoCorrente(ac);
      await loadData(ac);
      initialized.current = true;
      setLoading(false);
    })();
  }, []);

  // Ricarica dati quando l'anno cambia (dopo init)
  useEffect(() => {
    if (initialized.current && annoCorrente) {
      loadData(annoCorrente);
    }
  }, [annoCorrente]);

  const reloadAnni = useCallback(async () => {
    const a = await loadAnni();
    setAnni(a);
    return a;
  }, []);

  const cambiaAnno = useCallback((dir) => {
    setAnnoCorrente((cur) => {
      if (!cur) return cur;
      const idx = anni.indexOf(cur);
      const ni = idx + dir;
      if (ni < 0 || ni >= anni.length) return cur;
      return anni[ni];
    });
  }, [anni]);

  const nuovoAnno = useCallback(async (nome) => {
    setSaving(true);
    try {
      if (!anni.includes(nome)) {
        // Paywall enforced server-side via createAnnoScolastico (entitlement-checked).
        await base44.functions.invoke('createAnnoScolastico', { nome });
        const a = await reloadAnni();
        setAnni(a);
      }
      setAnnoCorrente(nome);
    } finally {
      setSaving(false);
    }
  }, [anni, reloadAnni]);

  const cancellaAnno = useCallback(async (anno) => {
    setSaving(true);
    try {
      await base44.entities.Attivita.deleteMany({ anno_scolastico: anno });
      await base44.entities.Scuola.deleteMany({ anno_scolastico: anno });
      await base44.entities.AnnoScolastico.deleteMany({ nome: anno });
    } catch (e) { /* ignore */ }
    const a = await reloadAnni();
    setAnni(a);
    if (annoCorrente === anno) {
      const nuovo = a[a.length - 1] || null;
      setAnnoCorrente(nuovo);
      if (!nuovo) { setAttivitaA([]); setAttivitaB([]); setScuola(null); }
    }
    setSaving(false);
  }, [annoCorrente, reloadAnni]);

  const addAttivita = useCallback(async (sez, record) => {
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const tempRec = { ...record, sezione: sez, anno_scolastico: annoCorrente, id: tempId, created_date: new Date().toISOString() };
    const setter = sez === 'a' ? setAttivitaA : setAttivitaB;
    setter((prev) => [...prev, tempRec]);
    setSaving(true);
    try {
      const created = await base44.entities.Attivita.create({ ...record, sezione: sez, anno_scolastico: annoCorrente });
      setter((prev) => prev.map((x) => (x.id === tempId ? created : x)));
      const aMin = attivitaA.reduce((sum, v) => sum + (v.durata_min || 0), 0) + (sez === 'a' ? (record.durata_min || 0) : 0);
      const bMin = attivitaB.reduce((sum, v) => sum + (v.durata_min || 0), 0) + (sez === 'b' ? (record.durata_min || 0) : 0);
      controllaNotifiche(annoCorrente, sez, aMin, bMin);
    } catch (e) {
      setter((prev) => prev.filter((x) => x.id !== tempId));
    } finally {
      setSaving(false);
    }
  }, [annoCorrente, attivitaA, attivitaB, controllaNotifiche]);

  const updateAttivita = useCallback(async (id, record) => {
    const inA = attivitaA.some((x) => x.id === id);
    const setter = inA ? setAttivitaA : setAttivitaB;
    const prev = (inA ? attivitaA : attivitaB).find((x) => x.id === id);
    setter((p) => p.map((x) => (x.id === id ? { ...x, ...record } : x)));
    setSaving(true);
    try {
      await base44.entities.Attivita.update(id, record);
      const sez = inA ? 'a' : 'b';
      const updated = (inA ? attivitaA : attivitaB).map((x) => (x.id === id ? { ...x, ...record } : x));
      const aMin = (inA ? updated : attivitaA).reduce((s, v) => s + (v.durata_min || 0), 0);
      const bMin = (inA ? attivitaB : updated).reduce((s, v) => s + (v.durata_min || 0), 0);
      controllaNotifiche(annoCorrente, sez, aMin, bMin);
    } catch (e) {
      setter((p) => p.map((x) => (x.id === id ? prev : x)));
    } finally {
      setSaving(false);
    }
  }, [attivitaA, attivitaB, annoCorrente, controllaNotifiche]);

  const deleteAttivita = useCallback(async (id) => {
    const inA = attivitaA.some((x) => x.id === id);
    const setter = inA ? setAttivitaA : setAttivitaB;
    const prev = (inA ? attivitaA : attivitaB).find((x) => x.id === id);
    setter((p) => p.filter((x) => x.id !== id));
    setSaving(true);
    try {
      await base44.entities.Attivita.delete(id);
      const sez = inA ? 'a' : 'b';
      const remaining = (inA ? attivitaA : attivitaB).filter((x) => x.id !== id);
      const aMin = (inA ? remaining : attivitaA).reduce((s, v) => s + (v.durata_min || 0), 0);
      const bMin = (inA ? attivitaB : remaining).reduce((s, v) => s + (v.durata_min || 0), 0);
      controllaNotifiche(annoCorrente, sez, aMin, bMin);
    } catch (e) {
      setter((p) => [...p, prev]);
    } finally {
      setSaving(false);
    }
  }, [attivitaA, attivitaB, annoCorrente, controllaNotifiche]);

  const svuotaSezione = useCallback(async (sez) => {
    const setter = sez === 'a' ? setAttivitaA : setAttivitaB;
    const backup = sez === 'a' ? [...attivitaA] : [...attivitaB];
    setter([]);
    setSaving(true);
    try {
      await base44.entities.Attivita.deleteMany({ sezione: sez, anno_scolastico: annoCorrente });
    } catch (e) {
      setter(backup);
    } finally {
      setSaving(false);
    }
  }, [attivitaA, attivitaB, annoCorrente]);

  const saveScuolaBoth = useCallback(async (primaData, secondaData) => {
    setSaving(true);
    try {
      // Prima scuola
      if (primaData && primaData.nome && primaData.nome.trim()) {
        if (scuola?.id) {
          await base44.entities.Scuola.update(scuola.id, { ...primaData, tipo: 'prima' });
        } else {
          await base44.entities.Scuola.create({ ...primaData, tipo: 'prima', anno_scolastico: annoCorrente });
        }
      }
      // Seconda scuola
      const hasSeconda = secondaData && secondaData.nome && secondaData.nome.trim();
      if (hasSeconda) {
        if (scuolaSeconda?.id) {
          await base44.entities.Scuola.update(scuolaSeconda.id, { ...secondaData, tipo: 'seconda' });
        } else {
          await base44.entities.Scuola.create({ ...secondaData, tipo: 'seconda', anno_scolastico: annoCorrente });
        }
      } else if (scuolaSeconda?.id) {
        await base44.entities.Scuola.delete(scuolaSeconda.id);
      }
      // Reload both
      const s = await base44.entities.Scuola.filter({ anno_scolastico: annoCorrente });
      setScuola(s.find(x => (x.tipo || 'prima') === 'prima') || null);
      setScuolaSeconda(s.find(x => x.tipo === 'seconda') || null);
    } finally { setSaving(false); }
  }, [scuola, scuolaSeconda, annoCorrente]);

  const saveProfile = useCallback(async (p, nome) => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ profilo: p, nome_docente: nome });
      const u = await base44.auth.me();
      setUser(u);
    } finally {
      setSaving(false);
    }
  }, []);

  const updateNomeDocente = useCallback(async (nome) => {
    try {
      await base44.auth.updateMe({ nome_docente: nome, profilo: profilo || 'docente' });
      const u = await base44.auth.me();
      setUser(u);
    } catch (e) { /* ignore */ }
  }, [profilo]);

  const deleteAccount = useCallback(async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('deleteAccount', {});
      await base44.auth.logout();
    } catch (e) {
      setSaving(false);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    base44.auth.logout();
  }, []);

  const canCreateYear = useCallback(
    (anno) => canCreateYearFn(anno, { piano, anno_gratuito: annoGratuito, anni_licenza: anniLicenza }),
    [piano, annoGratuito, anniLicenza]
  );

  const acquistaAnno = useCallback(async (anno) => {
    setSaving(true);
    try {
      await base44.functions.invoke('grantEntitlement', { action: 'anno', anno });
      await refreshEntitlement();
    } finally { setSaving(false); }
  }, []);

  const acquistaPermanente = useCallback(async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('grantEntitlement', { action: 'permanente' });
      await refreshEntitlement();
    } finally { setSaving(false); }
  }, []);

  const acquistaRimozioneAds = useCallback(async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('grantEntitlement', { action: 'ads' });
      await refreshEntitlement();
    } finally { setSaving(false); }
  }, []);

  const saveDatiPersonali = useCallback(async (data) => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ nome_docente: data.nome, telefono: data.telefono, docente_di: data.docente_di });
      const u = await base44.auth.me();
      setUser(u);
    } finally { setSaving(false); }
  }, []);

  return {
    user, profilo, nomeDocente, email, telefono, docenteDi,
    piano, annoGratuito, anniLicenza, adsRemoved,
    canCreateYear, acquistaAnno, acquistaPermanente, acquistaRimozioneAds, saveDatiPersonali,
    anni, annoCorrente, setAnnoCorrente,
    attivitaA, attivitaB, scuola, scuolaSeconda,
    loading, saving,
    cambiaAnno, nuovoAnno, cancellaAnno,
    addAttivita, updateAttivita, deleteAttivita, svuotaSezione,
    saveScuolaBoth, saveProfile, updateNomeDocente,
    deleteAccount, logout,
    refresh: () => loadData(annoCorrente),
    suggerisciProssimo: () => (anni.length ? suggerisciAnno(anni[anni.length - 1]) : '2026/2027'),
  };
}