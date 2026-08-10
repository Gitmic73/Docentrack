import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { suggerisciAnno } from '@/components/registro/registroConstants';

export function useRegistro() {
  const [user, setUser] = useState(null);
  const [anni, setAnni] = useState([]);
  const [annoCorrente, setAnnoCorrente] = useState(null);
  const [attivitaA, setAttivitaA] = useState([]);
  const [attivitaB, setAttivitaB] = useState([]);
  const [scuola, setScuola] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  // Profilo utente
  const profilo = user?.data?.profilo || user?.profilo || null;
  const nomeDocente = user?.data?.nome_docente || user?.full_name || '';

  const loadAnni = useCallback(async () => {
    const list = await base44.entities.AnnoScolastico.list('nome');
    return list.map((a) => a.nome).sort();
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
    setScuola(s[0] || null);
  }, []);

  // Init: utente + anni + dati
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        setUser(null);
      }
      let a = await loadAnni();
      if (a.length === 0) {
        const def = '2025/2026';
        await base44.entities.AnnoScolastico.create({ nome: def });
        a = [def];
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
        await base44.entities.AnnoScolastico.create({ nome });
        const a = await reloadAnni();
        setAnni(a);
      }
      setAnnoCorrente(nome);
    } finally {
      setSaving(false);
    }
  }, [anni, reloadAnni]);

  const addAttivita = useCallback(async (sez, record) => {
    setSaving(true);
    try {
      await base44.entities.Attivita.create({ ...record, sezione: sez, anno_scolastico: annoCorrente });
      await loadData(annoCorrente);
    } finally {
      setSaving(false);
    }
  }, [annoCorrente, loadData]);

  const updateAttivita = useCallback(async (id, record) => {
    setSaving(true);
    try {
      await base44.entities.Attivita.update(id, record);
      await loadData(annoCorrente);
    } finally {
      setSaving(false);
    }
  }, [annoCorrente, loadData]);

  const deleteAttivita = useCallback(async (id) => {
    setSaving(true);
    try {
      await base44.entities.Attivita.delete(id);
      await loadData(annoCorrente);
    } finally {
      setSaving(false);
    }
  }, [annoCorrente, loadData]);

  const svuotaSezione = useCallback(async (sez) => {
    setSaving(true);
    try {
      await base44.entities.Attivita.deleteMany({ sezione: sez, anno_scolastico: annoCorrente });
      await loadData(annoCorrente);
    } finally {
      setSaving(false);
    }
  }, [annoCorrente, loadData]);

  const saveScuola = useCallback(async (data) => {
    setSaving(true);
    try {
      if (scuola?.id) {
        await base44.entities.Scuola.update(scuola.id, data);
      } else {
        await base44.entities.Scuola.create({ ...data, anno_scolastico: annoCorrente });
      }
      await loadData(annoCorrente);
    } finally {
      setSaving(false);
    }
  }, [scuola, annoCorrente, loadData]);

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

  return {
    user, profilo, nomeDocente,
    anni, annoCorrente, setAnnoCorrente,
    attivitaA, attivitaB, scuola,
    loading, saving,
    cambiaAnno, nuovoAnno,
    addAttivita, updateAttivita, deleteAttivita, svuotaSezione,
    saveScuola, saveProfile, updateNomeDocente,
    suggerisciProssimo: () => (anni.length ? suggerisciAnno(anni[anni.length - 1]) : '2026/2027'),
  };
}