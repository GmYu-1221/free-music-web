import type { Song } from "./types";

function qForSong(song: Song) {
  return `${song.title} ${song.artist}`.trim();
}

export function cnSearchLinks(song: Song) {
  const q = encodeURIComponent(qForSong(song));
  return [
    { platform: "netease" as const, url: `https://music.163.com/#/search/m/?s=${q}`, externalId: q },
    { platform: "qqmusic" as const, url: `https://y.qq.com/portal/search.html#w=${q}`, externalId: q },
    { platform: "kugou" as const, url: `https://www.kugou.com/yy/html/search.html#searchType=song&searchKeyWord=${q}`, externalId: q },
    { platform: "kuwo" as const, url: `https://www.kuwo.cn/search/list?key=${q}`, externalId: q }
  ];
}
