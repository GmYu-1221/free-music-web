import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Music Web",
  description: "Legal music metadata + platform links aggregator"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
