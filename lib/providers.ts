import { Song } from "./types";

export async function searchItunes(q: string, signal?: AbortSignal): Promise<Song[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", q);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "25");

  const res = await fetch(url.toString(), { signal, next: { revalidate: 60 } });
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
      { platform: "itunes", url: String(x.trackViewUrl ?? ""), externalId: String(x.trackId ?? "") }
    ]
  })) satisfies Song[];
}

export async function searchDeezer(q: string, signal?: AbortSignal): Promise<Song[]> {
  const url = new URL("https://api.deezer.com/search");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), { signal, next: { revalidate: 60 } });
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
    platformLinks: [{ platform: "deezer", url: String(x.link ?? ""), externalId: String(x.id ?? "") }]
  })) satisfies Song[];
}
