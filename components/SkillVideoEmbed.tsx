"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Play, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube-embed";

gsap.registerPlugin(useGSAP);

type SkillVideoEmbedProps = {
  videoUrl: string;
  title?: string | null;
};

function isVitest(): boolean {
  return typeof process !== "undefined" && process.env.VITEST === "true";
}

export default function SkillVideoEmbed({
  videoUrl,
  title,
}: SkillVideoEmbedProps) {
  const headingId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setEmbedSrc(null);
      return;
    }

    setEmbedSrc(
      youtubeEmbedUrl(videoUrl, {
        origin: window.location.origin,
        privacyEnhanced: false,
      }),
    );
  }, [open, videoUrl]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !open) return;
      const dock = root.querySelector<HTMLElement>("[data-video-pip-dock]");
      if (!dock) return;

      if (isVitest()) {
        gsap.set(dock, { autoAlpha: 1, y: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions?.reduceMotion) {
            gsap.set(dock, { autoAlpha: 1, y: 0 });
            return;
          }
          gsap.from(dock, {
            autoAlpha: 0,
            y: 12,
            duration: 0.32,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          });
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [open], revertOnUpdate: true },
  );

  if (!youtubeVideoId(videoUrl)) {
    return null;
  }

  const label = title?.trim() || "Skill demonstration";

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div ref={rootRef} className="video-pip">
      {!open ?
        <button
          type="button"
          className="video-pip__launch"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <Play size={16} strokeWidth={2} aria-hidden="true" />
          <span className="video-pip__launch-text">
            <span className="video-pip__kicker">This skill</span>
            <span className="video-pip__watch">Watch {label}</span>
          </span>
        </button>
      : <div
          className="video-pip__dock"
          data-video-pip-dock
          role="dialog"
          aria-modal="false"
          aria-labelledby={headingId}
        >
          <div className="video-pip__bar">
            <p className="video-pip__title" id={headingId}>
              {label}
            </p>
            <a
              className="video-pip__link"
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
            <button
              type="button"
              className="video-pip__close"
              aria-label="Close video"
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className="video-pip__frame">
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
        </div>
      }
    </div>,
    document.body,
  );
}
