import { describe, expect, it } from "vitest";

import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube-embed";

describe("youtube-embed", () => {
  it("parses watch URLs", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=yGwleUa_itw")).toBe(
      "yGwleUa_itw",
    );
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=yGwleUa_itw")).toBe(
      "https://www.youtube.com/embed/yGwleUa_itw?playsinline=1&rel=0&modestbranding=1",
    );
  });

  it("parses embed URLs", () => {
    expect(
      youtubeVideoId(
        "https://www.youtube.com/embed/yGwleUa_itw?si=jtUu67kKPT5uOg-7",
      ),
    ).toBe("yGwleUa_itw");
  });

  it("adds origin and privacy-enhanced host when requested", () => {
    expect(
      youtubeEmbedUrl("https://www.youtube.com/watch?v=yGwleUa_itw", {
        origin: "https://mamer3119.github.io",
        privacyEnhanced: true,
      }),
    ).toBe(
      "https://www.youtube-nocookie.com/embed/yGwleUa_itw?playsinline=1&rel=0&modestbranding=1&origin=https%3A%2F%2Fmamer3119.github.io",
    );
  });

  it("returns null for invalid URLs", () => {
    expect(youtubeVideoId("https://example.com")).toBeNull();
    expect(youtubeEmbedUrl("not-a-url")).toBeNull();
  });
});
