export function escapeLike(input: string) {
  return input.replace(/[\\%_]/g, (m) => `\\${m}`);
}
