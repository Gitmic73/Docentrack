import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportToolbar({ onPDF, onCSV, disabled }) {
  return (
    <div className="flex justify-end gap-1.5 mb-3 select-none">
      <button
        onClick={onPDF}
        disabled={disabled}
        className="flex items-center gap-1.5 text-blu border border-blu rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-blu hover:text-white transition-colors disabled:opacity-40"
      >
        <FileText size={14} /> Esporta PDF
      </button>
      <button
        onClick={onCSV}
        disabled={disabled}
        className="flex items-center gap-1.5 text-verde border border-verde rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-verde hover:text-white transition-colors disabled:opacity-40"
      >
        <FileSpreadsheet size={14} /> Esporta CSV
      </button>
    </div>
  );
}