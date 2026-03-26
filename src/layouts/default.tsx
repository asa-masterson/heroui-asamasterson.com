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
    <div className="relative flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full border-t border-default-100 px-6 py-4">
        <div className="flex justify-center mb-2">
          <Link
            className="flex items-center gap-1 text-current"
            href="/"
            title="Asa Masterson"
          >
            <span className="text-default-500" style={{ fontSize: "0.8rem" }}>Made with ❤️ by</span>
            <p className="text-primary" style={{ fontSize: "0.8rem" }}>Asa Masterson</p>
          </Link>
        </div>
        <div
          className="flex items-center justify-between"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.08em" }}
        >
          <span className="text-default-400">{viewCount ?? ""}</span>
          <span className="text-default-400">© {new Date().getFullYear()} Asa Masterson</span>
        </div>
      </footer>
    </div>
  );
}