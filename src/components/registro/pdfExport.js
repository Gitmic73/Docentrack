import { jsPDF } from 'jspdf';
import { m2h, fmtD, MAX_ORE, coloreTipologia } from './registroConstants';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

async function loadImageAsDataURL(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Scrive un paragrafo wrappato e restituisce l'altezza occupata
function wrappedText(doc, text, x, y, maxWidth, fontSize = 9) {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y, { align: 'left' });
  return lines.length * (fontSize * 0.35 + 1.2);
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

function pieToDataURL(data, size = 500) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
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
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    start += slice;
  });
  return canvas.toDataURL('image/png');
}

export async function esportaPDF({ docente, profilo, scuola, scuolaSeconda, anno, attivitaA, attivitaB }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  let y = 20;

  // Carica logo scuola se presente
  let logoDataUrl = null;
  if (scuola?.logo_url) {
    logoDataUrl = await loadImageAsDataURL(scuola.logo_url);
  }

  // Strip blu/oro
  doc.setFillColor(194, 141, 67);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(111, 85, 54);
  doc.rect(W / 2, 0, W / 2, 2, 'F');

  // Intestazione formale: logo + dati scuola
  const logoSize = 22;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', M, 10, logoSize, logoSize);
    } catch (e) {
      try { doc.addImage(logoDataUrl, 'JPEG', M, 10, logoSize, logoSize); } catch (e2) { /* skip */ }
    }
  }
  const textX = logoDataUrl ? M + logoSize + 4 : M;
  let yInfo = 14;
  if (scuola && scuola.nome) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    doc.text(scuola.nome, textX, yInfo);
    yInfo += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    if (scuola.indirizzo) { doc.text(scuola.indirizzo, textX, yInfo); yInfo += 4; }
    if (scuola.codice) { doc.text(`Cod. mecc. ${scuola.codice}`, textX, yInfo); yInfo += 4; }
    if (scuola.tel) { doc.text(`Tel. ${scuola.tel}`, textX, yInfo); yInfo += 4; }
    if (scuola.mail) { doc.text(`Email: ${scuola.mail}`, textX, yInfo); yInfo += 4; }
    if (scuola.ds) { doc.text(`Dirigente Scolastico: ${scuola.ds}`, textX, yInfo); yInfo += 4; }
  }
  y = Math.max(10 + logoSize + 4, yInfo + 2);

  // Linea separatrice
  doc.setDrawColor(208, 213, 221);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // Branding DocenTrack
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(194, 141, 67);
  doc.text('DocenTrack', W / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text("Registro Attività Funzionali all'Insegnamento", W / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(9);
  doc.text(`Anno Scolastico ${anno}`, W / 2, y, { align: 'center' });
  y += 7;

  // Docente
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(34, 34, 34);
  doc.text(`Docente: ${docente || '—'}   (${profilo === 'ata' ? 'ATA' : 'Docente'})`, M, y);
  y += 6;
  if (scuolaSeconda && scuolaSeconda.nome) {
    doc.text(`Seconda sede: ${scuolaSeconda.nome}${scuolaSeconda.codice ? '  —  cod. ' + scuolaSeconda.codice : ''}`, M, y);
    y += 6;
    if (scuolaSeconda.ds) {
      doc.text(`Dirigente Scolastico (2ª sede): ${scuolaSeconda.ds}`, M, y);
      y += 6;
    }
  }
  y += 5;

  function sezione(titolo, colore, dati) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(colore[0], colore[1], colore[2]);
    doc.rect(M, y, W - 2 * M, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(titolo, M + 2, y + 5.5);
    const tot = dati.reduce((s, v) => s + (v.durata_min || 0), 0);
    doc.text(`${m2h(tot)} / 40 ore`, W - M - 2, y + 5.5, { align: 'right' });
    y += 12;

    // intestazione tabella
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', M + 1, y);
    doc.text('Orario', M + 28, y);
    doc.text('Tipologia', M + 50, y);
    doc.text('Sc.', M + 142, y);
    doc.text('Durata', W - M - 1, y, { align: 'right' });
    y += 4.5;
    doc.setDrawColor(208, 213, 221);
    doc.line(M, y, W - M, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 34, 34);
    if (dati.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(130, 130, 130);
      doc.text('Nessuna attività registrata per questo anno scolastico', W / 2, y, { align: 'center' });
      y += 7;
    } else {
      const sorted = [...dati].sort((a, b) => (a.data || '').localeCompare(b.data || ''));
      sorted.forEach((v) => {
        if (y > 272) { doc.addPage(); y = 20; }
        doc.setFontSize(8);
        doc.text(fmtD(v.data), M + 1, y);
        doc.text(`${v.inizio}-${v.fine}`, M + 28, y);
        let tipo = v.tipo || '';
        if (tipo.length > 52) tipo = tipo.slice(0, 49) + '…';
        doc.text(tipo, M + 50, y);
        doc.text(v.scuola_tipo === 'seconda' ? '2' : '', M + 142, y);
        doc.text(m2h(v.durata_min), W - M - 1, y, { align: 'right' });
        y += 5;
        if (v.note) {
          doc.setFontSize(7);
          doc.setTextColor(102, 102, 102);
          const note = v.note.length > 70 ? v.note.slice(0, 67) + '…' : v.note;
          doc.text('Note: ' + note, M + 50, y);
          doc.setTextColor(34, 34, 34);
          y += 4.5;
        }
      });
    }

    y += 3;
    const ecc = Math.max(0, tot - MAX_ORE);
    const res = Math.max(0, MAX_ORE - tot);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(194, 141, 67);
    doc.text(`Totale ore svolte: ${m2h(tot)}`, M, y);
    if (ecc > 0) {
      doc.setTextColor(176, 58, 46);
      doc.text(`Ore eccedenti: ${m2h(ecc)}`, M + 55, y);
    } else {
      doc.text(`Ore residue: ${m2h(res)}`, M + 55, y);
    }
    y += 11;
  }

  sezione('40 ore — Art. 29 CCNL/2007 (lett. a)', [194, 141, 67], attivitaA);
  sezione('Fino a 40 ore — Art. 29 CCNL/2007 (lett. b)', [111, 85, 54], attivitaB);

  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Riferimenti normativi: Art. 29 CCNL Comparto Scuola 29/11/2007 — D.Lgs. n. 81/2008 art. 37 c. 12', M, y);
  y += 5;
  doc.text(
    "Le ore eccedenti le 40 (lett. a) danno diritto al compenso (Tab. 5 CCNL) o all'esonero. Per le ore ex lett. b, il Collegio Docenti delibera la gestione.",
    M, y, { maxWidth: W - 2 * M, align: 'left' }
  );

  // ===== Pagina statistica: due torte affiancate + tabella riepilogo =====
  const pieA = buildPieData(attivitaA);
  const pieB = buildPieData(attivitaB);
  const imgA = pieToDataURL(pieA);
  const imgB = pieToDataURL(pieB);
  const totA = attivitaA.reduce((s, v) => s + (v.durata_min || 0), 0);
  const totB = attivitaB.reduce((s, v) => s + (v.durata_min || 0), 0);

  doc.addPage();
  doc.setFillColor(194, 141, 67);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(111, 85, 54);
  doc.rect(W / 2, 0, W / 2, 2, 'F');

  // Intestazione pagina
  let sy = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(194, 141, 67);
  doc.text('Report Statistico', W / 2, sy, { align: 'center' });
  sy += 5;
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`Anno Scolastico ${anno} — ${docente || '—'}`, W / 2, sy, { align: 'center' });
  sy += 7;

  // Layout: due colonne, ciascuna larga metà pagina
  const colW = (W - 2 * M) / 2;
  const pieD = 72; // diametro torta
  const halfL = M;
  const halfR = M + colW;

  // --- Torta sinistra: Lett. a ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(194, 141, 67);
  doc.text('Lett. a — 40 ore', halfL + colW / 2, sy, { align: 'center' });
  sy += 4;
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`Totale: ${m2h(totA)} / 40 ore`, halfL + colW / 2, sy, { align: 'center' });
  sy += 3;

  const pieL_y = sy;
  const pieL_x = halfL + (colW - pieD) / 2;
  if (imgA) {
    doc.addImage(imgA, 'PNG', pieL_x, pieL_y, pieD, pieD);
  } else {
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('Nessuna attività', halfL + colW / 2, pieL_y + pieD / 2, { align: 'center' });
  }

  // --- Torta destra: Lett. b ---
  let syR = sy;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(111, 85, 54);
  doc.text('Lett. b — fino a 40 ore', halfR + colW / 2, syR, { align: 'center' });
  syR += 4;
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`Totale: ${m2h(totB)} / 40 ore`, halfR + colW / 2, syR, { align: 'center' });
  syR += 3;

  const pieR_y = syR;
  const pieR_x = halfR + (colW - pieD) / 2;
  if (imgB) {
    doc.addImage(imgB, 'PNG', pieR_x, pieR_y, pieD, pieD);
  } else {
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('Nessuna attività', halfR + colW / 2, pieR_y + pieD / 2, { align: 'center' });
  }

  // --- Legende sotto le torte, una per colonna ---
  let legY = Math.max(pieL_y + pieD + 6, pieR_y + pieD + 6);

  function drawLegend(x, colWidth, data, totale) {
    let yy = legY;
    const rowH = 5;
    doc.setFontSize(7);
    data.forEach((d, i) => {
      const rgb = hexToRgb(d.color);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(x, yy - 2, 2.5, 2.5, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      let name = d.name;
      if (name.length > 32) name = name.slice(0, 31) + '…';
      doc.text(name, x + 4, yy);
      const pct = totale ? ((d.value / totale) * 100).toFixed(0) : 0;
      doc.setFont('helvetica', 'bold');
      doc.text(`${pct}% ${m2h(d.value)}`, x + colWidth - 1, yy, { align: 'right' });
      yy += rowH;
    });
  }

  drawLegend(halfL, colW, pieA, totA);
  drawLegend(halfR, colW, pieB, totB);

  // --- Tabella riepilogo tipologie (sotto le legende) ---
  const maxLegendRows = Math.max(pieA.length, pieB.length);
  let tableY = legY + maxLegendRows * 5 + 8;

  if (tableY > H - M - 40) { tableY = H - M - 40; }

  // Intestazione tabella
  doc.setFillColor(194, 141, 67);
  doc.rect(M, tableY, W - 2 * M, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Riepilogo ore per tipologia', M + 2, tableY + 5);
  doc.text('Totale generale: ' + m2h(totA + totB), W - M - 2, tableY + 5, { align: 'right' });
  tableY += 9;

  // Colonne: Tipologia | Sez. | Ore | % 40h
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipologia', M + 1, tableY);
  doc.text('Sez.', M + 120, tableY);
  doc.text('Ore', M + 140, tableY);
  doc.text('% 40h', W - M - 1, tableY, { align: 'right' });
  tableY += 3;
  doc.setDrawColor(208, 213, 221);
  doc.line(M, tableY, W - M, tableY);
  tableY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(7);

  function drawRigaRiepilogo(d, sez, totale) {
    if (tableY > H - M - 5) { doc.addPage(); tableY = 20; }
    const rgb = hexToRgb(d.color);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(M + 1, tableY - 1.8, 2, 2, 'F');
    let name = d.name;
    if (name.length > 60) name = name.slice(0, 59) + '…';
    doc.text(name, M + 5, tableY);
    doc.text(sez, M + 120, tableY);
    doc.text(m2h(d.value), M + 140, tableY);
    const pct = ((d.value / MAX_ORE) * 100).toFixed(1);
    doc.text(pct + '%', W - M - 1, tableY, { align: 'right' });
    tableY += 4.5;
  }

  pieA.forEach((d) => drawRigaRiepilogo(d, 'a', totA));
  if (pieA.length > 0 && pieB.length > 0) { tableY += 2; }
  pieB.forEach((d) => drawRigaRiepilogo(d, 'b', totB));

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text("Documento generato da DocenTrack — Registro Attività Funzionali all'Insegnamento", W / 2, H - 8, { align: 'center' });

  // ===== Pagina informativa: calcolo 40+40 ore e riferimenti normativi =====
  doc.addPage();
  doc.setFillColor(194, 141, 67);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(111, 85, 54);
  doc.rect(W / 2, 0, W / 2, 2, 'F');
  y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(194, 141, 67);
  doc.text('Riferimenti Normativi e Calcolo delle Ore', W / 2, y, { align: 'center' });
  y += 12;

  const maxW = W - 2 * M;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(111, 85, 54);
  doc.text('Art. 29 CCNL Comparto Scuola 29/11/2007', M, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, "Il CCNL del Comparto Scuola stabilisce che i docenti sono tenuti a svolgere attività funzionali all'insegnamento per un monte ore complessivo di 40+40 ore annue, distinte in due lettere:", M, y, maxW, 9);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(194, 141, 67);
  doc.text('Lett. a) — 40 ore', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, "Collegio dei Docenti e sue articolazioni, attività di programmazione, formazione e aggiornamento, informazione alle famiglie e ricevimenti collettivi, consegna pagelle. Le 40 ore sono obbligatorie: eventuali eccedenze danno diritto al compenso (Tab. 5 CCNL) o all'esonero da altre attività.", M, y, maxW, 9);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(111, 85, 54);
  doc.text('Lett. b) — fino a 40 ore', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, "Consigli di classe, interclasse e intersezione, GLO con genitori. Le ore sono fino a un massimo di 40 annue; il Collegio Docenti delibera la gestione delle eventuali eccedenze.", M, y, maxW, 9);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(194, 141, 67);
  doc.text('Modalità di calcolo', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, "La durata di ciascuna attività è calcolata come differenza tra orario di fine e orario di inizio. Le ore vengono sommate separatamente per le due sezioni (lett. a e lett. b) e per ogni anno scolastico (01/09 → 31/08). Il totale di ciascuna sezione non deve superare le 40 ore.", M, y, maxW, 9);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(111, 85, 54);
  doc.text('Formazione obbligatoria — D.Lgs. n. 81/2008', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, "L'art. 37, c. 12 del D.Lgs. 81/2008 stabilisce l'obbligo di formazione in materia di salute e sicurezza per tutti i lavoratori, docenti compresi. Tali ore rientrano nel monte ore della lett. a.", M, y, maxW, 9);
  y += 8;

  if (scuolaSeconda && scuolaSeconda.nome) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(194, 141, 67);
    doc.text('Docenti con doppia sede', M, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    y += wrappedText(doc, "Le attività con il valore 2 nella colonna Sc. sono state svolte presso la seconda sede. Le ore complessive (prima + seconda sede) concorrono al raggiungimento del monte ore annuo.", M, y, maxW, 9);
  }

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text("Documento generato da DocenTrack — Registro Attività Funzionali all'Insegnamento", W / 2, H - 8, { align: 'center' });

  // ===== Pagina firma: dichiarazione e spazio per firme =====
  doc.addPage();
  doc.setFillColor(194, 141, 67);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(111, 85, 54);
  doc.rect(W / 2, 0, W / 2, 2, 'F');

  y = 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(194, 141, 67);
  doc.text('Dichiarazione delle Attività Svolte', W / 2, y, { align: 'center' });
  y += 10;

  const sigTotA = attivitaA.reduce((s, v) => s + (v.durata_min || 0), 0);
  const sigTotB = attivitaB.reduce((s, v) => s + (v.durata_min || 0), 0);
  const sigMaxW = W - 2 * M;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, `Il sottoscritto/a ${docente || '___'}, ${profilo === 'ata' ? 'ATA' : 'docente'}${scuola?.nome ? ' presso ' + scuola.nome : ''},`, M, y, sigMaxW, 10);
  y += 4;
  y += wrappedText(doc, `dichiara di aver svolto nell'anno scolastico ${anno} le attività funzionali all'insegnamento di cui all'Art. 29 CCNL Comparto Scuola 29/11/2007, per i seguenti monte ore:`, M, y, sigMaxW, 10);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(`• Lett. a) — 40 ore: ${m2h(sigTotA)} su 40 ore`, M, y);
  y += 6;
  doc.text(`• Lett. b) — fino a 40 ore: ${m2h(sigTotB)} su 40 ore`, M, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += wrappedText(doc, "Si allega alla presente dichiarazione il dettaglio delle singole attività registrate, suddivise per le sezioni di cui all'Art. 29 CCNL.", M, y, sigMaxW, 10);
  y += 15;

  // Luogo e data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text('Luogo e data: _______________________________', M, y);
  y += 25;

  // Firme
  const firmW = (W - 2 * M) / 2 - 5;
  const firmY = y;

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.4);
  doc.line(M, firmY, M + firmW, firmY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text('Firma del docente', M, firmY + 5);

  const firmX2 = M + firmW + 10;
  doc.line(firmX2, firmY, firmX2 + firmW, firmY);
  doc.text('Firma del Dirigente Scolastico', firmX2, firmY + 5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text("Documento generato da DocenTrack — Registro Attività Funzionali all'Insegnamento", W / 2, H - 8, { align: 'center' });

  window.open(doc.output('bloburl'), '_blank');
}