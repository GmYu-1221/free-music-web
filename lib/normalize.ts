export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/feat\.|ft\./g, " ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function dedupeKey(title: string, artist: string): string {
  return `${norm(title)}::${norm(artist)}`;
}
