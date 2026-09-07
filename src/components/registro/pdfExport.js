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

export function esportaPDF({ docente, profilo, scuola, scuolaSeconda, anno, attivitaA, attivitaB }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  let y = 20;

  // Strip blu/oro
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(120, 53, 15);
  doc.rect(W / 2, 0, W / 2, 2, 'F');

  // Titolo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(217, 119, 6);
  doc.text('DocenTrack', W / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("Registro Attività Funzionali all'Insegnamento", W / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Anno Scolastico ${anno}`, W / 2, y, { align: 'center' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(34, 34, 34);
  doc.text(`Docente: ${docente || '—'}   (${profilo === 'ata' ? 'ATA' : 'Docente'})`, M, y);
  y += 6;
  if (scuola && scuola.nome) {
    doc.text(`Istituto: ${scuola.nome}${scuola.codice ? '  —  cod. ' + scuola.codice : ''}`, M, y);
    y += 6;
    if (scuola.ds) {
      doc.text(`Dirigente Scolastico: ${scuola.ds}`, M, y);
      y += 6;
    }
  }
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
    doc.setTextColor(217, 119, 6);
    doc.text(`Totale ore svolte: ${m2h(tot)}`, M, y);
    if (ecc > 0) {
      doc.setTextColor(176, 58, 46);
      doc.text(`Ore eccedenti: ${m2h(ecc)}`, M + 55, y);
    } else {
      doc.text(`Ore residue: ${m2h(res)}`, M + 55, y);
    }
    y += 11;
  }

  sezione('40 ore — Art. 29 CCNL/2007 (lett. a)', [217, 119, 6], attivitaA);
  sezione('Fino a 40 ore — Art. 29 CCNL/2007 (lett. b)', [120, 53, 15], attivitaB);

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

  // ===== Pagina 2: Report statistico con grafici a torta =====
  doc.addPage();
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(120, 53, 15);
  doc.rect(W / 2, 0, W / 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6);
  doc.text('Report Statistico', W / 2, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`Anno Scolastico ${anno} — ${docente || '—'}`, W / 2, 24, { align: 'center' });

  const pieA = buildPieData(attivitaA);
  const pieB = buildPieData(attivitaB);
  const imgA = pieToDataURL(pieA);
  const imgB = pieToDataURL(pieB);
  const totA = attivitaA.reduce((s, v) => s + (v.durata_min || 0), 0);
  const totB = attivitaB.reduce((s, v) => s + (v.durata_min || 0), 0);

  // La pagina è divisa a metà in altezza: ogni blocco ha un limite fisso,
  // così i due grafici non si sovrappongono mai a prescindere dal numero di voci.
  const contentTop = 32;
  const contentBottom = H - M - 6;
  const blockH = (contentBottom - contentTop) / 2;

  function drawPieBlock(top, titolo, totale, data, img) {
    let yy = top;
    // Titolo centrato
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(217, 119, 6);
    doc.text(titolo, W / 2, yy, { align: 'center' });
    yy += 5;
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Totale: ${m2h(totale)}`, W / 2, yy, { align: 'center' });
    yy += 6;

    // Torta centrata orizzontalmente; il diametro si adatta allo spazio per la legenda
    // (più voci = torta più piccola, per restare entro il blocco)
    const rowH = 5.5;
    const rowsNeeded = Math.ceil(data.length / 2);
    const legendH = rowsNeeded * rowH;
    const pieD = Math.max(45, Math.min(82, blockH - 6 - legendH - 4));
    const px = (W - pieD) / 2;
    if (img) {
      doc.addImage(img, 'PNG', px, yy, pieD, pieD);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(130, 130, 130);
      doc.text('Nessuna attività registrata', W / 2, yy + pieD / 2, { align: 'center' });
    }
    yy += pieD + 4;

    // Legenda sotto la torta, su due colonne, bloccata al limite inferiore del blocco
    const colW = (W - 2 * M) / 2;
    const legendMax = top + blockH - 3;
    let col = 0, row = 0;
    doc.setFontSize(8);
    data.forEach((d) => {
      const lyy = yy + row * rowH;
      if (lyy > legendMax) return;
      const lx = M + col * colW;
      const rgb = hexToRgb(d.color);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(lx, lyy - 2.5, 3, 3, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      let name = d.name;
      const maxName = 36;
      if (name.length > maxName) name = name.slice(0, maxName - 1) + '…';
      doc.text(name, lx + 4.5, lyy);
      const pct = totale ? ((d.value / totale) * 100).toFixed(0) : 0;
      doc.setFont('helvetica', 'bold');
      doc.text(`${pct}%  ${m2h(d.value)}`, lx + colW - 2, lyy, { align: 'right' });
      col++;
      if (col >= 2) { col = 0; row++; }
    });
  }

  drawPieBlock(contentTop, 'Lett. a — 40 ore', totA, pieA, imgA);
  drawPieBlock(contentTop + blockH, 'Lett. b — fino a 40 ore', totB, pieB, imgB);

  // ===== Pagina informativa: calcolo 40+40 ore e riferimenti normativi =====
  doc.addPage();
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, W / 2, 2, 'F');
  doc.setFillColor(120, 53, 15);
  doc.rect(W / 2, 0, W / 2, 2, 'F');
  y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6);
  doc.text('Riferimenti Normativi e Calcolo delle Ore', W / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(120, 53, 15);
  doc.text('Art. 29 CCNL Comparto Scuola 29/11/2007', M, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Il CCNL del Comparto Scuola stabilisce che i docenti sono tenuti a svolgere attività funzionali all'insegnamento per un monte ore complessivo di 40+40 ore annue, distinte in due lettere:", M, y, { maxWidth: W - 2 * M, align: 'left' });
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text('Lett. a) — 40 ore', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Collegio dei Docenti e sue articolazioni, attività di programmazione, formazione e aggiornamento, informazione alle famiglie e ricevimenti collettivi, consegna pagelle. Le 40 ore sono obbligatorie: eventuali eccedenze danno diritto al compenso (Tab. 5 CCNL) o all'esonero da altre attività.", M, y, { maxWidth: W - 2 * M, align: 'left' });
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(120, 53, 15);
  doc.text('Lett. b) — fino a 40 ore', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Consigli di classe, interclasse e intersezione, GLO con genitori. Le ore sono fino a un massimo di 40 annue; il Collegio Docenti delibera la gestione delle eventuali eccedenze.", M, y, { maxWidth: W - 2 * M, align: 'left' });
  y += 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text('Modalità di calcolo', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("La durata di ciascuna attività è calcolata come differenza tra orario di fine e orario di inizio. Le ore vengono sommate separatamente per le due sezioni (lett. a e lett. b) e per ogni anno scolastico (01/09 → 31/08). Il totale di ciascuna sezione non deve superare le 40 ore.", M, y, { maxWidth: W - 2 * M, align: 'left' });
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(120, 53, 15);
  doc.text('Formazione obbligatoria — D.Lgs. n. 81/2008', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("L'art. 37, c. 12 del D.Lgs. 81/2008 stabilisce l'obbligo di formazione in materia di salute e sicurezza per tutti i lavoratori, docenti compresi. Tali ore rientrano nel monte ore della lett. a.", M, y, { maxWidth: W - 2 * M, align: 'left' });
  y += 14;

  if (scuolaSeconda && scuolaSeconda.nome) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(217, 119, 6);
    doc.text('Docenti con doppia sede', M, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("Le attività con il valore 2 nella colonna Sc. sono state svolte presso la seconda sede. Le ore complessive (prima + seconda sede) concorrono al raggiungimento del monte ore annuo.", M, y, { maxWidth: W - 2 * M, align: 'left' });
    y += 14;
  }

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text("Documento generato da DocenTrack — Registro Attività Funzionali all'Insegnamento", W / 2, H - 8, { align: 'center' });

  window.open(doc.output('bloburl'), '_blank');
}