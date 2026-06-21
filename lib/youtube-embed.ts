/** Extract YouTube video ID from watch, embed, or youtu.be URLs. */
export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.slice(7).split("/")[0];
        return id || null;
      }
      const v = parsed.searchParams.get("v");
      return v || null;
    }
  } catch {
    return null;
  }

  return null;
}

export type YoutubeEmbedOptions = {
  /** Page origin — required by YouTube for some mobile / nested iframe contexts. */
  origin?: string;
  /** Privacy-enhanced host; same player, fewer third-party cookies. */
  privacyEnhanced?: boolean;
};

/**
 * Build a cross-device YouTube embed URL.
 * - playsinline=1 — inline playback on iOS (user tap still required)
 * - rel=0 — related videos from same channel
 * - modestbranding=1 — cleaner chrome on small screens
 */
export function youtubeEmbedUrl(
  watchOrEmbedUrl: string,
  options: YoutubeEmbedOptions = {},
): string | null {
  const id = youtubeVideoId(watchOrEmbedUrl);
  if (!id) {
    return null;
  }

  const host =
    options.privacyEnhanced ? "www.youtube-nocookie.com" : "www.youtube.com";
  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });

  if (options.origin) {
    params.set("origin", options.origin);
  }

  return `https://${host}/embed/${id}?${params.toString()}`;
}
