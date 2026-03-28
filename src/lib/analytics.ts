import { useEffect } from "react";
import * as Swetrix from "swetrix";

type EventMeta = {
  [key: string]: string | number | boolean | null | undefined;
};

export function trackCustomEvent(ev: string, meta?: EventMeta) {
  void Swetrix.track({ ev, meta });
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
        void Swetrix.track({ ev: `${page}_funnel_bottom` });
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [page]);
}