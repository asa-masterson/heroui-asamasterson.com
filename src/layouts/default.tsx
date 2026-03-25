import { Link } from "@heroui/link";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewCount, setViewCount] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://a.bigfluffy.monster/counter/id/asamastersoncom")
      .then((response) => response.json())
      .then((data) => {
        setViewCount("Views — " + data.Users);
      })
      .catch(() => {
        setViewCount(null);
      });
  }, []);

  return (
    // min-h-screen (not h-screen) — h-screen squishes long pages into the viewport
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-between px-6 py-3 border-t border-default-100">
        <div className="text-sm text-default-400" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
          {viewCount ?? ""}
        </div>
        {/* Link to own site, not heroui.com */}
        <Link
          className="flex items-center gap-1 text-current"
          href="/"
          title="Asa Masterson"
        >
          <span className="text-default-500" style={{ fontSize: "0.8rem" }}>Made with ❤️ by</span>
          <p className="text-primary" style={{ fontSize: "0.8rem" }}>Asa Masterson</p>
        </Link>
        <div className="text-sm text-default-400" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}