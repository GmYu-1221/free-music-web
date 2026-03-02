export type Platform = "itunes" | "deezer" | "netease" | "qqmusic" | "kugou" | "kuwo";

export type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSec?: number;
  artworkUrl?: string;
  platformLinks: Array<{
    platform: Platform;
    url: string;
    externalId: string;
  }>;
};
