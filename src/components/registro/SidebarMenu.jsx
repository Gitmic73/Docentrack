import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, User as UserIcon, School, Settings, Crown } from 'lucide-react';
import { PIANI } from '@/lib/plans';

export default function SidebarMenu({ open, nomeDocente, piano, onClose, onNavigate }) {
  const pianoInfo = PIANI[piano] || PIANI.free;
  const items = [
    { k: 'piani', label: 'I miei piani', icon: CreditCard, desc: 'Piani, licenze e opzioni' },
    { k: 'dati', label: 'Dati personali', icon: UserIcon, desc: 'Nome e profilo' },
    { k: 'scuola', label: 'Dati scuola', icon: School, desc: 'Istituto scolastico' },
    { k: 'profilo', label: 'Impostazioni profilo', icon: Settings, desc: 'Account, logout, elimina' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            <div className="bg-blu text-white px-4 pt-[env(safe-area-inset-top,12px)] pb-4">
              <div className="flex items-center justify-between mt-2">
                <span className="font-display text-base font-semibold">Menu</span>
                <button onClick={onClose} className="p-1 rounded hover:bg-white/15" aria-label="Chiudi menu">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <UserIcon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{nomeDocente || '—'}</div>
                  <div className="text-[11px] text-white/70 flex items-center gap-1">
                    <Crown size={11} /> {pianoInfo.label}
                  </div>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {items.map((it) => (
                <button
                  key={it.k}
                  onClick={() => onNavigate(it.k)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blu-light transition-colors text-left"
                >
                  <it.icon size={18} className="text-blu shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{it.label}</div>
                    <div className="text-[11px] text-grigio">{it.desc}</div>
                  </div>
                </button>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-bordo text-[10px] text-grigio">DocentTrack · v1.0</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}