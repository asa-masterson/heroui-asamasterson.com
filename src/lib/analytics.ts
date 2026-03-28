import { useEffect } from "react";
import * as Swetrix from "swetrix";

type EventMeta = {
  [key: string]: string | number | boolean | null | undefined;
};

export function trackCustomEvent(ev: string, meta?: EventMeta) {
  try {
    void Swetrix.track({ ev, meta });
  } catch (err) {
    console.warn("[analytics] Failed to track event:", err);
  }
}

export function useTrackPageReadBottom(page: string) {
  useEffect(() => {
    let tracked = false;

    const onScroll = () => {
      if (tracked) {
        return;
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollTop + viewportHeight >= pageHeight - 24) {
        tracked = true;
        try {
          void Swetrix.track({ ev: `${page}_funnel_bottom` });
        } catch (err) {
          console.warn("[analytics] Failed to track funnel event:", err);
        }
        window.removeEventListener("scroll", onScroll);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [page]);
}