// Renders a simulated social media post or news article.
// No AI-generated images: photos are drawn as labeled placeholders,
// so nothing in the game can be mistaken for a real photo.
import type { CaseContent } from "@/lib/types";

const AVATAR_COLORS = ["#2ec4b6", "#ff5d73", "#ff9f1c", "#9b5de5", "#ffd23f", "#4cc9f0"];

function initials(name: string) {
  return name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K` : String(n));

function Photo({ photo }: { photo: NonNullable<CaseContent["photo"]> }) {
  return (
    <figure className="mt-3">
      <div
        className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border border-graphite/15"
        style={{
          background:
            "linear-gradient(135deg, #3d3a52 0%, #5b5577 50%, #3d3a52 100%), repeating-linear-gradient(45deg, transparent 0 10px, rgb(255 255 255 / .04) 10px 20px)",
        }}
      >
        <div className="px-6 text-center text-chalk">
          <div className="text-3xl" aria-hidden="true">📷</div>
          <p className="mt-1 font-type text-sm leading-snug opacity-90">[Photo: {photo.description}]</p>
        </div>
      </div>
      <figcaption className="mt-1.5 text-sm text-graphite/80">{photo.caption}</figcaption>
    </figure>
  );
}

export function PostCard({ content }: { content: CaseContent }) {
  if (content.format === "news") {
    return (
      <article className="paper rounded-2xl p-5 shadow-[0_10px_0_0_rgb(0_0_0/0.35)]">
        <div className="flex items-center justify-between border-b-4 border-double border-graphite/70 pb-2">
          <span className="font-news text-xl font-bold tracking-tight">{content.platform}</span>
          <span className="text-xs text-graphite/70">{content.accountHandle}</span>
        </div>
        <h3 className="mt-3 font-news text-2xl font-bold leading-tight sm:text-3xl">{content.headline}</h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-graphite/60">
          By {content.accountName} · {content.postedAgo}
        </p>
        {content.photo && <Photo photo={content.photo} />}
        <p className="mt-3 font-news text-[1.05rem] leading-relaxed">{content.body}</p>
        <p className="mt-4 text-xs text-graphite/60">
          {fmt(content.stats.shares)} shares · {fmt(content.stats.comments)} comments
        </p>
      </article>
    );
  }

  return (
    <article className="paper rounded-2xl p-5 shadow-[0_10px_0_0_rgb(0_0_0/0.35)]">
      <header className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-extrabold text-ink"
          style={{ background: colorFor(content.accountName) }}
          aria-hidden="true"
        >
          {initials(content.accountName) || "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold leading-tight">{content.accountName}</p>
          <p className="truncate text-sm text-graphite/60">
            {content.accountHandle} · {content.postedAgo} · {content.platform}
          </p>
        </div>
      </header>
      <p className="mt-3 text-lg font-extrabold leading-snug">{content.headline}</p>
      <p className="mt-1 whitespace-pre-line leading-relaxed">{content.body}</p>
      {content.photo && <Photo photo={content.photo} />}
      <footer className="mt-3 flex gap-5 border-t border-graphite/10 pt-2 text-sm font-bold text-graphite/70">
        <span>👍 {fmt(content.stats.likes)}</span>
        <span>💬 {fmt(content.stats.comments)}</span>
        <span>↗ {fmt(content.stats.shares)}</span>
      </footer>
    </article>
  );
}
