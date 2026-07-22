// Omani Rial uses 3 decimal places (1 OMR = 1000 baisa).
export function formatOMR(amount) {
  return `${Number(amount || 0).toFixed(3)} OMR`;
}
