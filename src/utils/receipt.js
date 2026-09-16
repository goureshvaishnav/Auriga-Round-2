import { jsPDF } from 'jspdf';
import { currency } from './calculations';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;

const drawRule = (document, y) => {
  document.setDrawColor(226, 232, 240);
  document.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
};

const ensureSpace = (document, y, height) => {
  if (y + height <= PAGE_HEIGHT - MARGIN) return y;
  document.addPage();
  return MARGIN;
};

const drawSectionTitle = (document, title, y) => {
  const nextY = ensureSpace(document, y, 16);
  document.setTextColor(79, 70, 229);
  document.setFont('helvetica', 'bold');
  document.setFontSize(10);
  document.text(title.toUpperCase(), MARGIN, nextY);
  return nextY + 8;
};

const drawSummaryGrid = (document, items, startY) => {
  const columnWidth = (PAGE_WIDTH - MARGIN * 2 - 8) / 2;
  let y = startY;

  items.forEach((item, index) => {
    const column = index % 2;
    if (column === 0) y = ensureSpace(document, y, 27);
    const x = MARGIN + column * (columnWidth + 8);

    document.setFillColor(248, 250, 252);
    document.roundedRect(x, y, columnWidth, 22, 3, 3, 'F');
    document.setTextColor(100, 116, 139);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8);
    document.text(item.label, x + 5, y + 7);
    document.setTextColor(15, 23, 42);
    document.setFont('helvetica', 'bold');
    document.setFontSize(12);
    document.text(item.value, x + 5, y + 16);

    if (column === 1) y += 29;
  });

  return y;
};

const drawTable = (document, headers, rows, startY, columnWidths) => {
  let y = ensureSpace(document, startY, 16);
  const rowHeight = 9;
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  const drawRow = (cells, fill, bold = false) => {
    y = ensureSpace(document, y, rowHeight + 2);
    if (fill) {
      document.setFillColor(...fill);
      document.rect(MARGIN, y - 6, tableWidth, rowHeight, 'F');
    }
    document.setTextColor(bold ? 71 : 51, bold ? 85 : 65, bold ? 105 : 85);
    document.setFont('helvetica', bold ? 'bold' : 'normal');
    document.setFontSize(7.5);
    let x = MARGIN + 3;
    cells.forEach((cell, index) => {
      document.text(String(cell), x, y, { maxWidth: columnWidths[index] - 6 });
      x += columnWidths[index];
    });
    y += rowHeight;
  };

  drawRow(headers, [241, 245, 249], true);
  rows.forEach((row, index) => drawRow(row, index % 2 === 0 ? [255, 255, 255] : [248, 250, 252]));
  drawRule(document, y - 5);
  return y + 4;
};

export const downloadReceipt = ({ pool, memberRows, settlements, fairShare, totalCollected, remaining, targetReached, importReport }) => {
  const document = new jsPDF({ unit: 'mm', format: 'a4' });
  const generatedAt = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  const safeRemaining = Math.max(0, remaining);
  let y = MARGIN;

  document.setFillColor(79, 70, 229);
  document.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 30, 5, 5, 'F');
  document.setTextColor(255, 255, 255);
  document.setFont('helvetica', 'bold');
  document.setFontSize(24);
  document.text('GiftPool', MARGIN + 8, y + 13);
  document.setFontSize(10);
  document.setFont('helvetica', 'normal');
  document.text('Contribution & Settlement Receipt', MARGIN + 8, y + 21);
  document.setFontSize(8);
  document.text(generatedAt, PAGE_WIDTH - MARGIN - 8, y + 13, { align: 'right' });
  y += 42;

  document.setTextColor(15, 23, 42);
  document.setFont('helvetica', 'bold');
  document.setFontSize(16);
  document.text(pool.name || 'GiftPool', MARGIN, y);
  y += 7;
  document.setTextColor(100, 116, 139);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.text('Contribution & Settlement Tracker', MARGIN, y);
  y += 14;

  y = drawSummaryGrid(document, [
    { label: 'Pool target', value: currency(pool.targetAmount) },
    { label: 'Total collected', value: currency(totalCollected) },
    { label: 'Remaining', value: currency(safeRemaining) },
    { label: 'Members', value: String(memberRows.length) },
    { label: 'Fair share per person', value: currency(fairShare) },
    { label: 'Final status', value: targetReached ? 'Target reached' : 'Target not reached' },
  ], y);

  y += 7;
  y = drawSectionTitle(document, 'Member contributions', y);
  y = drawTable(
    document,
    ['Member', 'Fair share', 'Paid', 'Balance', 'Status'],
    memberRows.map((member) => [
      member.name,
      currency(member.fairShare),
      currency(member.paid),
      currency(member.balance),
      member.status,
    ]),
    y,
    [49, 33, 30, 33, 29],
  );

  y += 7;
  y = drawSectionTitle(document, 'Settlement plan', y);
  if (settlements.length) {
    y = drawTable(
      document,
      ['From', 'Action', 'To', 'Amount'],
      settlements.map((item) => [item.from, 'pays', item.to, currency(item.amount)]),
      y,
      [48, 28, 48, 53],
    );
  } else {
    document.setTextColor(71, 85, 105);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.text('Everyone is settled. No payments required.', MARGIN, y);
    y += 12;
  }

  if (importReport) {
    y += 7;
    y = drawSectionTitle(document, 'Imported contributions', y);
    y = ensureSpace(document, y, 14);
    document.setTextColor(71, 85, 105);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8.5);
    document.text(
      `Rows processed: ${importReport.totalRows}   Imported: ${importReport.importedCount}   De-duplicated: ${importReport.duplicateCount}   Merged: ${importReport.mergedCount}   Rejected: ${importReport.rejectedCount}`,
      MARGIN,
      y,
      { maxWidth: PAGE_WIDTH - MARGIN * 2 },
    );
    y += 10;
  }

  y = ensureSpace(document, y + 8, 22);
  drawRule(document, y);
  document.setTextColor(100, 116, 139);
  document.setFont('helvetica', 'normal');
  document.setFontSize(8);
  document.text('Generated by GiftPool', MARGIN, y + 8);
  document.text('Contribution & Settlement Tracker', MARGIN, y + 14);
  document.text('This receipt reflects the current pool data at generation time.', PAGE_WIDTH - MARGIN, y + 11, { align: 'right' });

  document.save('GiftPool-Receipt.pdf');
};
