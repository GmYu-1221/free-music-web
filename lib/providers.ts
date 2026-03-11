import { Song } from "./types";

export async function searchItunes(q: string, signal?: AbortSignal): Promise<Song[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", q);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "25");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const items = (data?.results ?? []) as any[];

  return items.map((x) => ({
    id: `itunes:${x.trackId}`,
    title: String(x.trackName ?? ""),
    artist: String(x.artistName ?? ""),
    album: x.collectionName ? String(x.collectionName) : undefined,
    durationSec: typeof x.trackTimeMillis === "number" ? Math.round(x.trackTimeMillis / 1000) : undefined,
    artworkUrl: x.artworkUrl100 ? String(x.artworkUrl100).replace("100x100", "300x300") : undefined,
    platformLinks: [
      { platform: "itunes" as const, url: String(x.trackViewUrl ?? ""), externalId: String(x.trackId ?? "") }
    ]
  }));
}

export async function searchDeezer(q: string, signal?: AbortSignal): Promise<Song[]> {
  const url = new URL("https://api.deezer.com/search");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const items = (data?.data ?? []) as any[];

  return items.slice(0, 25).map((x) => ({
    id: `deezer:${x.id}`,
    title: String(x.title ?? ""),
    artist: String(x.artist?.name ?? ""),
    album: x.album?.title ? String(x.album.title) : undefined,
    durationSec: typeof x.duration === "number" ? x.duration : undefined,
    artworkUrl: x.album?.cover_big ? String(x.album.cover_big) : undefined,
    platformLinks: [{ platform: "deezer" as const, url: String(x.link ?? ""), externalId: String(x.id ?? "") }]
  }));
}

export async function searchMusic(q: string, signal?: AbortSignal): Promise<{ q: string; results: Song[] }> {
  if (!q.trim()) return { q, results: [] };

  const [itunes, deezer] = await Promise.all([
    searchItunes(q, signal),
    searchDeezer(q, signal)
  ]);

  const map = new Map<string, Song>();

  function upsert(song: Song) {
    const key = `${song.title.toLowerCase().trim()}::${song.artist.toLowerCase().trim()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, song);
      return;
    }

    map.set(key, {
      ...existing,
      album: existing.album ?? song.album,
      durationSec: existing.durationSec ?? song.durationSec,
      artworkUrl: existing.artworkUrl ?? song.artworkUrl,
      platformLinks: [
        ...existing.platformLinks,
        ...song.platformLinks.filter(
          (l) => !existing.platformLinks.some((e) => e.platform === l.platform && e.externalId === l.externalId)
        )
      ]
    });
  }

  [...itunes, ...deezer].forEach(upsert);

  return { q, results: Array.from(map.values()).slice(0, 50) };
}
