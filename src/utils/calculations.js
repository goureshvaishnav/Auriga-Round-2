export const currency = (value) => {
  const number = Number(value) || 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);

  if (number < 0) {
    return `-${formatted.replace('-', '')}`;
  }

  return formatted;
};

export const formatMoneyInputValue = (value) => {
  const safeValue = Number(value) || 0;
  if (safeValue <= 0) return '';

  const number = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(safeValue);

  return number;
};

export const parseMoneyInput = (value) => {
  if (!value) return 0;
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export const toNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, num);
};

export const getFairShare = (targetAmount, memberCount) => {
  const safeTarget = Math.max(0, Number(targetAmount) || 0);
  if (!safeTarget || memberCount <= 0) return 0;
  return safeTarget / memberCount;
};

export const getCollectedTotal = (members = []) =>
  members.reduce((total, member) => total + toNumber(member.paid), 0);

export const getRemaining = (targetAmount, members = []) => {
  const total = getCollectedTotal(members);
  const safeTarget = Math.max(0, Number(targetAmount) || 0);
  return safeTarget - total;
};

export const getProgress = (targetAmount, members = []) => {
  const amount = Math.max(0, Number(targetAmount) || 0);
  if (amount <= 0) return 0;
  const total = getCollectedTotal(members);
  const value = (total / amount) * 100;
  if (value > 100) return 100;
  return Math.max(0, value);
};

export const buildMembersView = (members = [], targetAmount) => {
  const safeMembers = Array.isArray(members) ? members : [];
  const memberCount = safeMembers.length;
  const fairShare = getFairShare(targetAmount, memberCount);

  return safeMembers.map((member) => {
    const paid = toNumber(member.paid);
    const balance = paid - fairShare;

    let status = 'Settled';
    if (balance > 0) status = 'Receives';
    else if (balance < 0) status = 'Owes';

    return {
      ...member,
      fairShare,
      paid,
      balance,
      status,
    };
  });
};

export const generateSettlementPlan = (members = [], targetAmount) => {
  const items = buildMembersView(members, targetAmount);
  const debtors = items
    .filter((member) => member.balance < 0)
    .map((member) => ({ ...member, amount: Math.abs(member.balance) }));
  const creditors = items
    .filter((member) => member.balance > 0)
    .map((member) => ({ ...member, amount: member.balance }));

  const transactions = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    if (!debtor || !creditor) break;

    const transfer = Math.min(debtor.amount, creditor.amount);

    if (transfer > 0) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: transfer,
      });
    }

    debtor.amount -= transfer;
    creditor.amount -= transfer;

    if (debtor.amount <= 0) debtorIndex += 1;
    if (creditor.amount <= 0) creditorIndex += 1;
  }

  return transactions;
};
