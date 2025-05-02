import { Link } from "@heroui/link";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewCount, setViewCount] = useState<string | null>("Loading...");

  useEffect(() => {
    fetch("https://counter.bigfluffy.monster/id/asamastersoncom")
      .then((response) => response.json())
      .then(data => {
        setViewCount("Views - " + data.Users);
      })
      .catch(function() {
        setViewCount(null);
      });
  }, []);
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-between px-6 py-3">
      <div className="text-sm text-default-500">
      </div>
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com"
          title="heroui.com homepage"
        >
          <span className="text-default-600">Made with ❤️ by</span>
          <p className="text-primary">Asa Masterson</p>
        </Link>
        {viewCount && (
          <div className="text-sm text-default-500">
            {viewCount}
          </div>
        )}
      </footer>
    </div>
  );
}
