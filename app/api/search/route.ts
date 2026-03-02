import { NextRequest, NextResponse } from "next/server";
import { searchDeezer, searchItunes } from "@/lib/providers";
import { dedupeKey } from "@/lib/normalize";
import type { Song } from "@/lib/types";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ q, results: [] as Song[] });

  const [itunes, deezer] = await Promise.all([
    searchItunes(q),
    searchDeezer(q)
  ]);

  const map = new Map<string, Song>();

  function upsert(song: Song) {
    const key = dedupeKey(song.title, song.artist);
    const existing = map.get(key);
    if (!existing) return void map.set(key, song);

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

  return NextResponse.json({ q, results: Array.from(map.values()).slice(0, 50) });
}
