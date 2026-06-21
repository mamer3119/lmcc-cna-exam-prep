"use client";

import { useEffect, useId, useState } from "react";

import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube-embed";

type SkillVideoEmbedProps = {
  videoUrl: string;
  title?: string | null;
};

export default function SkillVideoEmbed({
  videoUrl,
  title,
}: SkillVideoEmbedProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmbedSrc(null);
      return;
    }

    const origin = window.location.origin;
    setEmbedSrc(
      youtubeEmbedUrl(videoUrl, {
        origin,
        privacyEnhanced: false,
      }),
    );
  }, [open, videoUrl]);

  if (!youtubeVideoId(videoUrl)) {
    return null;
  }

  const label = title?.trim() || "Skill demonstration";

  return (
    <section className="video-embed" aria-labelledby={`${panelId}-heading`}>
      <button
        type="button"
        className="video-embed-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="video-embed-toggle-text">
          <span className="video-embed-kicker">Demonstration video</span>
          <span className="video-embed-title" id={`${panelId}-heading`}>
            {label}
          </span>
          <span className="video-embed-hint">
            {open ? "Hide video" : "Show video"}
          </span>
        </span>
        <span
          className={`video-embed-chevron${open ? " video-embed-chevron--open" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        id={panelId}
        className={`video-embed-panel${open ? " video-embed-panel--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="video-embed-panel-inner">
          <div className="video-embed-frame">
            {embedSrc ?
              <iframe
                src={embedSrc}
                title={`YouTube: ${label}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            : null}
          </div>

          {open ?
            <p className="video-embed-fallback">
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                Open on YouTube
              </a>
            </p>
          : null}
        </div>
      </div>
    </section>
  );
}
