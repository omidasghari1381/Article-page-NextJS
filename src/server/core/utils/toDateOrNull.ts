function toDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? null : d;
}
function has<O extends object, K extends PropertyKey>(o: O, k: K): boolean {
  return Object.prototype.hasOwnProperty.call(o, k);
}
