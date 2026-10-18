import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { ChevronDown, Check } from 'lucide-react';

export default function DrawerSelect({ value, onChange, options, placeholder, label, className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  const selectedLabel = value || placeholder || '';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${className} text-left flex items-center justify-between truncate`}
      >
        <span className={`flex-1 min-w-0 truncate ${value ? 'text-foreground' : 'text-[#C5CDD9]'}`}>{selectedLabel}</span>
        <ChevronDown size={14} className="shrink-0 ml-1 text-grigio" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[72vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="font-display text-base text-blu">{label || 'Seleziona'}</DrawerTitle>
            <DrawerDescription className="text-xs text-grigio">Scegli un&apos;opzione</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {placeholder && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className={`w-full text-left text-sm px-3 py-3.5 rounded-lg mb-1.5 transition-colors ${!value ? 'bg-blu-light text-blu font-semibold' : 'text-grigio hover:bg-[#E8EEF6]'}`}
              >
                {placeholder}
              </button>
            )}
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left text-sm px-3 py-3.5 rounded-lg mb-1.5 flex items-center justify-between transition-colors ${value === o ? 'bg-blu-light text-blu font-semibold' : 'text-foreground hover:bg-[#E8EEF6]'}`}
              >
                <span className="flex-1 min-w-0">{o}</span>
                {value === o && <Check size={16} className="text-blu shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}