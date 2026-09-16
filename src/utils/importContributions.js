import Papa from 'papaparse';

const HEADER_ALIASES = {
  name: ['name', 'member', 'member name', 'contributor', 'person'],
  amount: ['amount', 'paid', 'contribution', 'total'],
};

export const normalizeName = (value) => String(value || '')
  .normalize('NFKC')
  .replace(/[._-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export const cleanDisplayName = (value) => String(value || '')
  .normalize('NFKC')
  .replace(/\s+/g, ' ')
  .trim();

export const parseAmount = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return { value: null, reason: 'Missing amount' };

  if (/^-|\(.*\)/.test(raw) || /-\s*\d/.test(raw)) {
    return { value: null, reason: 'Negative amounts are not allowed' };
  }

  let normalized = raw
    .replace(/^(?:₹|rs\.?|inr)\s*/i, '')
    .replace(/[₹,\s]/g, '')
    .toLowerCase();
  let multiplier = 1;

  if (normalized.endsWith('k')) {
    multiplier = 1000;
    normalized = normalized.slice(0, -1);
  } else if (normalized.endsWith('m')) {
    multiplier = 1000000;
    normalized = normalized.slice(0, -1);
  }

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return { value: null, reason: 'Invalid amount' };
  }

  const parsed = Number(normalized) * multiplier;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { value: null, reason: 'Amount must be greater than zero' };
  }

  return { value: parsed, reason: null };
};

const findHeaderIndex = (headers, aliases) => headers.findIndex((header) => aliases.includes(normalizeName(header)));

const formatOriginalRow = (fields) => fields.map((field) => String(field ?? '').trim()).join(', ');

export const parseContributionCSV = (csvText) => {
  const parsed = Papa.parse(String(csvText || ''), {
    skipEmptyLines: false,
  });
  const rows = Array.isArray(parsed.data) ? parsed.data : [];
  const headerRow = rows.find((row) => Array.isArray(row) && row.some((cell) => String(cell || '').trim()));

  if (!headerRow) {
    return { ok: false, error: 'The CSV file is empty.', report: null };
  }

  const headers = headerRow.map((header) => String(header || '').trim());
  const nameIndex = findHeaderIndex(headers, HEADER_ALIASES.name);
  const amountIndex = findHeaderIndex(headers, HEADER_ALIASES.amount);

  if (nameIndex < 0 || amountIndex < 0) {
    return {
      ok: false,
      error: 'The CSV must include Name and Amount columns.',
      report: null,
    };
  }

  const headerIndex = rows.indexOf(headerRow);
  const imported = [];
  const deduplicated = [];
  const rejected = [];
  const seen = new Map();

  rows.slice(headerIndex + 1).forEach((row, index) => {
    const rowNumber = headerIndex + index + 2;
    const fields = Array.isArray(row) ? row : [];
    const original = formatOriginalRow(fields);

    if (!fields.length || !original) {
      rejected.push({ rowNumber, original: original || '(empty row)', reason: 'Empty row' });
      return;
    }

    const rawName = fields[nameIndex];
    const rawAmount = fields.slice(amountIndex).join(',');
    const displayName = cleanDisplayName(rawName);
    const normalizedName = normalizeName(rawName);

    if (!displayName) {
      rejected.push({ rowNumber, original, reason: 'Missing name' });
      return;
    }

    const parsedAmount = parseAmount(rawAmount);
    if (parsedAmount.reason) {
      rejected.push({ rowNumber, original, reason: parsedAmount.reason });
      return;
    }

    const record = {
      rowNumber,
      original,
      name: displayName,
      normalizedName,
      amount: parsedAmount.value,
    };
    const duplicateKey = `${normalizedName}|${parsedAmount.value}`;
    const firstRecord = seen.get(duplicateKey);

    if (firstRecord) {
      deduplicated.push({
        ...record,
        duplicateOf: firstRecord.rowNumber,
        reason: 'Same normalized name and amount as an earlier row',
      });
      return;
    }

    seen.set(duplicateKey, record);
    imported.push(record);
  });

  const grouped = new Map();
  imported.forEach((record) => {
    const group = grouped.get(record.normalizedName) || {
      name: record.name,
      normalizedName: record.normalizedName,
      records: [],
      total: 0,
    };
    group.records.push(record);
    group.total += record.amount;
    grouped.set(record.normalizedName, group);
  });

  const merged = Array.from(grouped.values())
    .filter((group) => group.records.length > 1)
    .map((group) => ({
      name: group.name,
      records: group.records,
      total: group.total,
      expression: group.records.map((record) => record.amount).join(' + '),
    }));

  return {
    ok: true,
    members: Array.from(grouped.values()).map((group) => ({
      name: group.name,
      normalizedName: group.normalizedName,
      paid: group.total,
    })),
    report: {
      totalRows: rows.length - headerIndex - 1,
      imported,
      importedCount: imported.length,
      deduplicated,
      duplicateCount: deduplicated.length,
      merged,
      mergedCount: merged.length,
      rejected,
      rejectedCount: rejected.length,
    },
  };
};
