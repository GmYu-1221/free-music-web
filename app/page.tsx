"use client";

import { useEffect, useMemo, useState } from "react";
import type { Song } from "@/lib/types";
import { cnSearchLinks } from "@/lib/cnLinks";

function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Page() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  async function runSearch() {
    const query = q.trim();
    if (query.length < 2) return;

    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (canSearch) runSearch();
      else setResults([]);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 20, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Free Music Web</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        合法音乐聚合：只展示元数据与原平台链接（可扩展 embed/预览），不抓取或分发音频。
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索歌名 / 歌手（至少 2 个字符）"
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          onClick={runSearch}
          disabled={!canSearch || loading}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: loading ? "#f6f6f6" : "white",
            cursor: !canSearch || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "搜索中…" : "搜索"}
        </button>
      </div>

      {err && <div style={{ marginTop: 12, color: "crimson" }}>错误：{err}</div>}

      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {results.map((song) => {
          const links = [...song.platformLinks, ...cnSearchLinks(song)];
          return (
            <div
              key={song.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 14,
                padding: 14,
                display: "flex",
                gap: 14,
                alignItems: "center"
              }}
            >
              <div style={{ width: 72, height: 72, flex: "0 0 auto" }}>
                {song.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={song.artworkUrl}
                    alt=""
                    style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 12, background: "#f2f2f2" }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {song.title}
                </div>
                <div
                  style={{
                    color: "#444",
                    marginTop: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {song.artist}
                  {song.album ? ` · ${song.album}` : ""}
                  {song.durationSec ? ` · ${formatDuration(song.durationSec)}` : ""}
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {links.map((l) => (
                    <a
                      key={`${l.platform}:${l.externalId}`}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #ddd",
                        borderRadius: 999,
                        textDecoration: "none",
                        color: "#111",
                        fontSize: 13
                      }}
                    >
                      去 {l.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && q.trim().length >= 2 && results.length === 0 && (
          <div style={{ marginTop: 12, color: "#666" }}>暂无结果（试试换个关键词）。</div>
        )}
      </div>

      <hr style={{ margin: "28px 0", border: "none", borderTop: "1px solid #eee" }} />
      <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>
        Non-goals: 不提供音频下载/搬运；不绕过平台鉴权或 DRM；不存储或转发音频流。
      </p>
    </main>
  );
}
