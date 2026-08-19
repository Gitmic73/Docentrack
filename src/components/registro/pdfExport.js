import { jsPDF } from 'jspdf';
import { m2h, fmtD, MAX_ORE, coloreTipologia } from './registroConstants';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function buildPieData(attivita) {
  const map = {};
  attivita.forEach((v) => {
    const t = v.tipo || 'Altro';
    map[t] = (map[t] || 0) + (v.durata_min || 0);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, color: coloreTipologia(name) }))
    .sort((a, b) => b.value - a.value);
}

function pieToDataURL(data, size = 400) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size / 2 - 3;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) return null;
  let start = -Math.PI / 2;
  data.forEach((d) => {
    const slice = (d.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    start += slice;
  });
  return canvas.toDataURL('image/png');
}

export function esportaPDF({ docente, profilo, scuola, anno, attivitaA, attivitaB }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 15;
  let y = 20;

  // Strip blu/oro
  doc.setFillColor(26, 58, 107);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(201, 162, 39);
  doc.rect(W / 2, 0, W / 2, 2, 'F');

  // Titolo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(26, 58, 107);
  doc.text("Registro Attività Funzionali all'Insegnamento", W / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Anno Scolastico ${anno}`, W / 2, y, { align: 'center' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(34, 34, 34);
  doc.text(`Docente: ${docente || '—'}   (${profilo === 'ata' ? 'ATA' : 'Docente'})`, M, y);
  y += 5;
  if (scuola && scuola.nome) {
    doc.text(`Istituto: ${scuola.nome}${scuola.codice ? '  —  cod. ' + scuola.codice : ''}`, M, y);
    y += 5;
    if (scuola.ds) {
      doc.text(`Dirigente Scolastico: ${scuola.ds}`, M, y);
      y += 5;
    }
  }
  y += 3;

  function sezione(titolo, colore, dati) {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFillColor(colore[0], colore[1], colore[2]);
    doc.rect(M, y, W - 2 * M, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(titolo, M + 2, y + 5);
    const tot = dati.reduce((s, v) => s + (v.durata_min || 0), 0);
    doc.text(`${m2h(tot)} / 40 ore`, W - M - 2, y + 5, { align: 'right' });
    y += 9;

    // intestazione tabella
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', M + 1, y);
    doc.text('Orario', M + 30, y);
    doc.text('Tipologia', M + 55, y);
    doc.text('Durata', W - M - 1, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(208, 213, 221);
    doc.line(M, y, W - M, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 34, 34);
    if (dati.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(130, 130, 130);
      doc.text('Nessuna attività registrata per questo anno scolastico', W / 2, y, { align: 'center' });
      y += 6;
    } else {
      const sorted = [...dati].sort((a, b) => (a.data || '').localeCompare(b.data || ''));
      sorted.forEach((v) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.setFontSize(8);
        doc.text(fmtD(v.data), M + 1, y);
        doc.text(`${v.inizio}-${v.fine}`, M + 30, y);
        let tipo = v.tipo || '';
        if (tipo.length > 58) tipo = tipo.slice(0, 55) + '…';
        doc.text(tipo, M + 55, y);
        doc.text(m2h(v.durata_min), W - M - 1, y, { align: 'right' });
        y += 4.5;
        if (v.note) {
          doc.setFontSize(7);
          doc.setTextColor(102, 102, 102);
          const note = v.note.length > 70 ? v.note.slice(0, 67) + '…' : v.note;
          doc.text('Note: ' + note, M + 55, y);
          doc.setTextColor(34, 34, 34);
          y += 4;
        }
      });
    }

    y += 2;
    const ecc = Math.max(0, tot - MAX_ORE);
    const res = Math.max(0, MAX_ORE - tot);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text(`Totale ore svolte: ${m2h(tot)}`, M, y);
    if (ecc > 0) {
      doc.setTextColor(176, 58, 46);
      doc.text(`Ore eccedenti: ${m2h(ecc)}`, M + 55, y);
    } else {
      doc.text(`Ore residue: ${m2h(res)}`, M + 55, y);
    }
    y += 9;
  }

  sezione('40 ore — Art. 29 CCNL/2007 (lett. a)', [26, 58, 107], attivitaA);
  sezione('Fino a 40 ore — Art. 29 CCNL/2007 (lett. b)', [201, 162, 39], attivitaB);

  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Riferimenti normativi: Art. 29 CCNL Comparto Scuola 29/11/2007 — D.Lgs. n. 81/2008 art. 37 c. 12', M, y);
  y += 4;
  doc.text(
    "Le ore eccedenti le 40 (lett. a) danno diritto al compenso (Tab. 5 CCNL) o all'esonero. Per le ore ex lett. b, il Collegio Docenti delibera la gestione.",
    M, y, { maxWidth: W - 2 * M }
  );

  // ===== Pagina 2: Report statistico con grafici a torta =====
  doc.addPage();
  y = 20;
  doc.setFillColor(26, 58, 107);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(201, 162, 39);
  doc.rect(W / 2, 0, W / 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 58, 107);
  doc.text('Report Statistico', W / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`Anno Scolastico ${anno} — ${docente || '—'}`, W / 2, y, { align: 'center' });
  y += 10;

  const pieA = buildPieData(attivitaA);
  const pieB = buildPieData(attivitaB);
  const imgA = pieToDataURL(pieA);
  const imgB = pieToDataURL(pieB);
  const pieSize = 55;
  const colW = (W - 2 * M - 4) / 2;

  function drawPieBlock(titolo, totale, data, img, x) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 58, 107);
    doc.text(titolo, x, y);
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Totale: ${m2h(totale)}`, x + colW, y, { align: 'right' });
    const ly = y + 6;
    if (img) {
      doc.addImage(img, 'PNG', x, ly, pieSize, pieSize);
    } else {
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('Nessuna attività registrata', x, ly + 4);
    }
    // legenda
    const lx = x + pieSize + 4;
    const lw = colW - pieSize - 6;
    let lyy = ly + 2;
    doc.setFontSize(7);
    data.forEach((d) => {
      if (lyy > 285) return;
      const rgb = hexToRgb(d.color);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(lx, lyy - 2.5, 3, 3, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      let name = d.name;
      if (name.length > 34) name = name.slice(0, 31) + '…';
      doc.text(name, lx + 4, lyy);
      const pct = totale ? ((d.value / totale) * 100).toFixed(0) : 0;
      doc.setFont('helvetica', 'bold');
      doc.text(`${pct}%  ${m2h(d.value)}`, lx + lw, lyy, { align: 'right' });
      lyy += 5;
    });
  }

  const totA = attivitaA.reduce((s, v) => s + (v.durata_min || 0), 0);
  const totB = attivitaB.reduce((s, v) => s + (v.durata_min || 0), 0);
  drawPieBlock('Lett. a — 40 ore', totA, pieA, imgA, M);
  drawPieBlock('Lett. b — fino a 40 ore', totB, pieB, imgB, M + colW + 4);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Generato da DocentTrack', W / 2, 290, { align: 'center' });

  doc.save(`Registro_Ore_${anno.replace('/', '-')}.pdf`);
}