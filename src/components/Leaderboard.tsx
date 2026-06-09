import { useState, useEffect, useRef, useCallback } from "react";
import { trackCustomEvent } from "@/lib/analytics";

const API_BASE = (import.meta.env.VITE_LEADERBOARD_API_URL as string | undefined) ?? "";
const CAPTCHA_PROJECT_ID = "sjFU3ryURYdB";

interface Entry { rank: number; name: string; score: number; }

interface Props {
  game: "dotchomper" | "2048";
  score: number;
}

declare global {
  interface Window { swetrixCaptchaForceLoad?: () => void; }
}

const lbCss = `
  .lb-wrap { margin-top: 1rem; width: 100%; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
  .lb-divider { width: 100%; height: 1px; background: rgba(255,84,255,.2); margin: .25rem 0; }
  .lb-form { display: flex; flex-direction: column; align-items: center; gap: .55rem; width: 100%; }
  .lb-form-title { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,84,255,.7); }
  .lb-input {
    width: 100%; max-width: 220px;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,84,255,.3);
    border-radius: 8px; padding: .45rem .75rem;
    font-family: 'DM Mono', monospace; font-size: .8rem; color: #fff;
    outline: none; text-align: center;
  }
  .lb-input:focus { border-color: #ff54ff; }
  .lb-input::placeholder { color: rgba(255,255,255,.3); }
  .lb-captcha-wrap { transform: scale(0.88); transform-origin: center; }
  .lb-submit {
    font-family: 'DM Mono', monospace; font-size: .65rem; letter-spacing: .1em; text-transform: uppercase;
    background: #ff54ff; color: #fff; border: none; border-radius: 999px;
    padding: .45rem 1.4rem; cursor: pointer; transition: opacity .2s;
  }
  .lb-submit:disabled { opacity: .4; cursor: default; }
  .lb-error { font-family:'DM Mono',monospace; font-size:.6rem; color:#ff6060; text-align:center; }
  .lb-rank { font-family:'DM Serif Display',serif; font-size:1rem; color:#ff54ff; text-align:center; }
  .lb-board { width:100%; max-width:260px; }
  .lb-board-title { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,84,255,.7); margin-bottom:.4rem; text-align:center; }
  .lb-entries { display:flex; flex-direction:column; gap:.2rem; }
  .lb-entry { display:flex; align-items:center; gap:.5rem; padding:.3rem .5rem; border-radius:6px; background:rgba(255,255,255,.04); }
  .lb-entry-gold { background:rgba(255,210,0,.1); }
  .lb-entry-me { border: 1px solid rgba(255,84,255,.5); }
  .lb-pos { font-family:'DM Mono',monospace; font-size:.6rem; color:rgba(255,84,255,.6); width:1.8rem; flex-shrink:0; }
  .lb-name { font-size:.75rem; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .lb-pts { font-family:'DM Mono',monospace; font-size:.65rem; color:#ff54ff; flex-shrink:0; }
`;

let cssInjected = false;

export default function Leaderboard({ game, score }: Props) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myName, setMyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Inject styles once
  useEffect(() => {
    if (cssInjected) return;
    const s = document.createElement("style");
    s.textContent = lbCss;
    document.head.appendChild(s);
    cssInjected = true;
  }, []);

  // Load leaderboard
  const fetchBoard = useCallback(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/leaderboard/${game}`)
      .then(r => r.json())
      .then((data: Entry[]) => setEntries(data))
      .catch(() => {});
  }, [game]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // Load CAPTCHA script and (re)init widget when overlay opens
  useEffect(() => {
    const existing = document.querySelector('script[src*="captcha-loader"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://cdn.swetrixcaptcha.com/captcha-loader.js";
      s.defer = true;
      document.head.appendChild(s);
    }
    // Give the script a tick to load, then force-init
    const t = setTimeout(() => window.swetrixCaptchaForceLoad?.(), 400);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !API_BASE) return;

    const token = captchaRef.current
      ?.querySelector<HTMLInputElement>('input[name="swetrix-captcha-response"]')?.value;
    if (!token) { setError("Please complete the CAPTCHA first"); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/leaderboard/${game}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, score, captcha_token: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Submission failed");

      setMyRank(data.rank);
      setMyName(trimmed);
      setSubmitted(true);
      trackCustomEvent(`${game}_leaderboard_submit`, { score, rank: data.rank });
      fetchBoard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
      window.swetrixCaptchaForceLoad?.();
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
              className="swecaptcha"
              data-project-id={CAPTCHA_PROJECT_ID}
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
                <span className="lb-pts">{e.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
