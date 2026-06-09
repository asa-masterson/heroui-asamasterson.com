import { useState, useEffect, useRef, useCallback } from "react";
import { trackCustomEvent } from "@/lib/analytics";

const API_BASE = (import.meta.env.VITE_LEADERBOARD_API_URL as string | undefined) ?? "";
const TURNSTILE_SITE_KEY = "0x4AAAAAADhDuGV_yepsTTRy";

interface Entry { rank: number; name: string; score: number; level?: number; }

interface Props {
  game: "dotchomper" | "2048" | "blockdash";
  score: number;
  level?: number;
}

declare global {
  interface Window {
    turnstile?: { reset: (container?: HTMLElement | null) => void };
  }
}

const lbCss = `
  /* ── overlay leaderboard ───────────────────────────────────────── */
  .lb-wrap { margin-top: 1rem; width: 100%; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
  .lb-divider { width: 100%; height: 1px; background: rgba(255,84,255,.25); margin: .25rem 0; }
  .lb-form { display: flex; flex-direction: column; align-items: center; gap: .55rem; width: 100%; }
  .lb-form-title { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,84,255,.8); }
  .lb-input {
    width: 100%; max-width: 220px;
    background: rgba(255,255,255,.07); border: 1px solid rgba(255,84,255,.35);
    border-radius: 8px; padding: .45rem .75rem;
    font-family: 'DM Mono', monospace; font-size: .8rem; color: #fff;
    outline: none; text-align: center;
  }
  .lb-input:focus { border-color: #ff54ff; box-shadow: 0 0 0 2px rgba(255,84,255,.15); }
  .lb-input::placeholder { color: rgba(255,255,255,.25); }
  .lb-captcha-wrap { transform: scale(0.82); transform-origin: center; }
  .lb-submit {
    font-family: 'DM Mono', monospace; font-size: .65rem; letter-spacing: .1em; text-transform: uppercase;
    background: linear-gradient(135deg,#ff54ff,#c833c8); color: #fff; border: none; border-radius: 999px;
    padding: .45rem 1.4rem; cursor: pointer; transition: opacity .2s, transform .1s;
  }
  .lb-submit:hover:not(:disabled) { opacity: .88; transform: scale(1.02); }
  .lb-submit:disabled { opacity: .35; cursor: default; }
  .lb-error { font-family:'DM Mono',monospace; font-size:.6rem; color:#ff6060; text-align:center; }
  .lb-rank { font-family:'DM Serif Display',serif; font-size:1.1rem; color:#ff54ff; text-align:center; text-shadow: 0 0 20px rgba(255,84,255,.4); }
  .lb-board { width:100%; max-width:260px; }
  .lb-board-title { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,84,255,.7); margin-bottom:.4rem; text-align:center; }
  .lb-entries { display:flex; flex-direction:column; gap:.2rem; }
  .lb-entry { display:flex; align-items:center; gap:.5rem; padding:.3rem .5rem; border-radius:6px; background:rgba(255,255,255,.04); }
  .lb-entry-gold { background:rgba(255,210,0,.1); }
  .lb-entry-me { border: 1px solid rgba(255,84,255,.5); background:rgba(255,84,255,.07); }
  .lb-pos { font-family:'DM Mono',monospace; font-size:.6rem; color:rgba(255,84,255,.6); width:1.8rem; flex-shrink:0; }
  .lb-name { font-size:.75rem; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:rgba(255,255,255,.9); }
  .lb-pts { font-family:'DM Mono',monospace; font-size:.65rem; color:#ff54ff; flex-shrink:0; }

  /* ── always-visible sidebar ────────────────────────────────────── */
  .lb-side {
    width: 210px; flex-shrink: 0;
    display: flex; flex-direction: column; gap: .45rem;
    padding: 1.1rem 1rem;
    background: rgba(0,0,0,.4);
    border: 1px solid rgba(255,84,255,.22);
    border-radius: 14px;
    align-self: flex-start;
    backdrop-filter: blur(8px);
  }
  .lb-side-heading {
    font-family: 'DM Mono', monospace;
    font-size: .6rem; letter-spacing: .16em; text-transform: uppercase;
    color: #ff54ff; margin-bottom: .5rem;
    padding-bottom: .5rem;
    border-bottom: 1px solid rgba(255,84,255,.18);
  }
  .lb-side-row {
    display: flex; align-items: center; gap: .55rem;
    padding: .35rem .45rem; border-radius: 7px;
    transition: background .15s;
  }
  .lb-side-row:hover { background: rgba(255,84,255,.07); }
  .lb-side-row-gold { background: rgba(255,200,0,.1); }
  .lb-side-pos {
    font-family: 'DM Mono', monospace; font-size: .65rem;
    color: rgba(255,84,255,.6); width: 1.6rem; flex-shrink: 0;
  }
  .lb-side-name {
    font-size: .8rem; flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: rgba(255,255,255,.88);
  }
  .lb-side-pts {
    font-family: 'DM Mono', monospace; font-size: .7rem;
    color: #ff54ff; flex-shrink: 0;
  }
  .lb-side-empty {
    font-family: 'DM Mono', monospace; font-size: .65rem;
    color: rgba(255,255,255,.2); text-align: center; padding: .75rem 0;
    font-style: italic;
  }
`;

let cssInjected = false;

function injectCss() {
  if (cssInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = lbCss;
  document.head.appendChild(s);
  cssInjected = true;
}

export default function Leaderboard({ game, score, level }: Props) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myName, setMyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectCss();
    setMounted(true);
    const saved = localStorage.getItem("lb-player-name");
    if (saved) setName(saved);
  }, []);

  const fetchBoard = useCallback(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/leaderboard/${game}`)
      .then(r => r.json())
      .then((data: Entry[]) => setEntries(data))
      .catch(() => {});
  }, [game]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  useEffect(() => {
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !API_BASE) return;

    const token = captchaRef.current
      ?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value;
    if (!token) { setError("Please complete the CAPTCHA first"); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/leaderboard/${game}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, score, level: level ?? 1, captcha_token: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Submission failed");

      setMyRank(data.rank);
      setMyName(trimmed);
      setSubmitted(true);
      localStorage.setItem("lb-player-name", trimmed);
      trackCustomEvent(`${game}_leaderboard_submit`, { score, rank: data.rank });
      fetchBoard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
      window.turnstile?.reset(captchaRef.current);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !API_BASE) return null;

  return (
    <div className="lb-wrap">
      <div className="lb-divider" />

      {!submitted ? (
        <form className="lb-form" onSubmit={handleSubmit}>
          <p className="lb-form-title">Submit your score</p>
          <input
            className="lb-input"
            maxLength={20}
            placeholder="Your name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="lb-captcha-wrap">
            <div
              ref={captchaRef}
              className="cf-turnstile"
              data-sitekey={TURNSTILE_SITE_KEY}
              data-theme="dark"
            />
          </div>
          {error && <p className="lb-error">{error}</p>}
          <button className="lb-submit" disabled={loading || !name.trim()} type="submit">
            {loading ? "Submitting…" : "Submit"}
          </button>
        </form>
      ) : (
        <p className="lb-rank">
          {myRank === 1 ? "🥇 New #1!" : `#${myRank} on the board`}
        </p>
      )}

      {entries.length > 0 && (
        <div className="lb-board">
          <p className="lb-board-title">Top 10</p>
          <div className="lb-entries">
            {entries.map((e) => (
              <div
                key={e.rank}
                className={[
                  "lb-entry",
                  e.rank === 1 ? "lb-entry-gold" : "",
                  submitted && e.name === myName && e.score === score ? "lb-entry-me" : "",
                ].filter(Boolean).join(" ")}
              >
                <span className="lb-pos">#{e.rank}</span>
                <span className="lb-name">{e.name}</span>
                {e.level && e.level > 1 && <span className="lb-pts" style={{opacity:.55, marginRight:".15rem"}}>L{e.level}</span>}
                <span className="lb-pts">{e.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LeaderboardSidebar({ game }: { game: "dotchomper" | "2048" | "blockdash" }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => { injectCss(); }, []);

  const load = useCallback(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/leaderboard/${game}`)
      .then(r => r.json())
      .then((data: Entry[]) => setEntries(data))
      .catch(() => {});
  }, [game]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  if (!API_BASE) return null;

  return (
    <div className="lb-side">
      <p className="lb-side-heading">Top Players</p>
      {entries.length === 0 ? (
        <p className="lb-side-empty">No scores yet</p>
      ) : (
        entries.slice(0, 7).map(e => (
          <div
            key={e.rank}
            className={`lb-side-row${e.rank === 1 ? " lb-side-row-gold" : ""}`}
          >
            <span className="lb-side-pos">#{e.rank}</span>
            <span className="lb-side-name">{e.name}</span>
            {e.level && e.level > 1 && <span className="lb-side-pts" style={{opacity:.5, marginRight:".1rem"}}>L{e.level}</span>}
            <span className="lb-side-pts">{e.score.toLocaleString()}</span>
          </div>
        ))
      )}
    </div>
  );
}
