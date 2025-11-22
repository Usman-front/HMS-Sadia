export function formatTime(value) {
  if (!value) return '';
  const parts = String(value).split(':');
  const hStr = parts[0];
  const mStr = parts[1] ?? '00';
  const hNum = parseInt(hStr, 10);
  if (isNaN(hNum)) return String(value);
  const ampm = hNum >= 12 ? 'PM' : 'AM';
  let h12 = hNum % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${mStr} ${ampm}`;
}

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}