import { useRef, useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import GameFooter from "@/components/GameFooter";

// ── Logical canvas resolution (CSS scales it down) ───────────────
const W = 800, H = 600;
const PW = 12, PH = 90, BR = 8;
const PSPD = 7, AI_SPD = 5.0, WIN = 5;
const BRAND = "#ff54ff";

type Mode = "1p" | "2p";
type Phase = "menu" | "playing" | "paused" | "won";

interface Ball { x: number; y: number; vx: number; vy: number }
interface GS {
  ball: Ball;
  ly: number; // left paddle center y
  ry: number; // right paddle center y
  score: [number, number];
  phase: Phase;
  winner: 0 | 1 | null;
  mode: Mode;
}

function freshBall(dir: 1 | -1): Ball {
  const a = (Math.random() - 0.5) * 0.55;
  return { x: W / 2, y: H / 2, vx: dir * 5 * Math.cos(a), vy: 5 * Math.sin(a) };
}

function freshGame(mode: Mode): GS {
  return { ball: freshBall(1), ly: H / 2, ry: H / 2, score: [0, 0], phase: "playing", winner: null, mode };
}

// ── AI: predict where ball will be when it reaches the right paddle ──
function predictBallY(ball: Ball): number {
  if (ball.vx <= 0) return ball.y;
  const faceX = W - 20 - PW - BR;
  if (ball.x >= faceX) return ball.y;
  let y = ball.y, vy = ball.vy, x = ball.x;
  // Step forward frame-by-frame, bouncing off top/bottom walls
  while (x < faceX) {
    x += ball.vx;
    y += vy;
    if (y - BR < 0) { y = BR; vy = -vy; }
    if (y + BR > H) { y = H - BR; vy = -vy; }
  }
  return y;
}

// ── Draw ─────────────────────────────────────────────────────────
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

function drawScene(ctx: CanvasRenderingContext2D, g: GS) {
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  ctx.setLineDash([10, 14]);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.setLineDash([]);

  // Score dots — 5 per side, grey until earned
  const DOT_R = 6, DOT_GAP = 20, DOT_Y = 32;
  for (let side = 0; side < 2; side++) {
    const pts = g.score[side];
    const centerX = side === 0 ? W / 4 : 3 * W / 4;
    const startX = centerX - ((WIN - 1) * DOT_GAP) / 2;
    for (let i = 0; i < WIN; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * DOT_GAP, DOT_Y, DOT_R, 0, Math.PI * 2);
      if (i < pts) {
        ctx.fillStyle = BRAND;
        ctx.shadowColor = BRAND;
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.fillStyle = "#ffffff";
  rr(ctx, 20, g.ly - PH / 2, PW, PH, 5);
  rr(ctx, W - 20 - PW, g.ry - PH / 2, PW, PH, 5);

  ctx.shadowColor = BRAND;
  ctx.shadowBlur = 20;
  ctx.fillStyle = BRAND;
  ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, BR, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = "11px 'DM Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.textAlign = "left"; ctx.textBaseline = "bottom";
  ctx.fillText(g.mode === "2p" ? "W / S" : "W / S  or  touch", 22, H - 10);
  if (g.mode === "2p") {
    ctx.textAlign = "right";
    ctx.fillText("↑ / ↓  or  touch", W - 22, H - 10);
  }
}

// ── Overlay helpers ───────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: "absolute", inset: 0,
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  gap: 20,
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.68rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: BRAND,
  margin: 0,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'DM Serif Display', serif",
  fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
  color: "white",
  lineHeight: 1,
  margin: 0,
};

const hintStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.6rem",
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.25)",
  textAlign: "center",
  lineHeight: 1.9,
  margin: 0,
};

const btnStyle = (outline: boolean): React.CSSProperties => ({
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "0.65rem 1.5rem",
  borderRadius: 999,
  border: outline ? `1px solid rgba(255,84,255,0.5)` : "none",
  background: outline ? "transparent" : BRAND,
  color: outline ? BRAND : "white",
  cursor: "pointer",
  transition: "opacity 0.15s",
});

// ── Component ─────────────────────────────────────────────────────
export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GS | null>(null);
  const keysRef = useRef(new Set<string>());
  const touchRef = useRef<{ l: number | null; r: number | null }>({ l: null, r: null });
  const rafRef = useRef(0);
  const delayRef = useRef(0);
  const aiTargetRef = useRef(H / 2);   // y the AI paddle is tracking
  const aiOffsetRef = useRef(0);        // deliberate hit-point offset for this rally
  const aiApproachingRef = useRef(false); // was ball approaching last frame

  const [phase, setPhase] = useState<Phase>("menu");
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<0 | 1 | null>(null);
  const [mode, setMode] = useState<Mode>("1p");

  function step() {
    const g = gsRef.current;
    const ctx = canvasRef.current?.getContext("2d");
    if (!g || !ctx) return;

    drawScene(ctx, g);

    if (g.phase !== "playing") {
      rafRef.current = requestAnimationFrame(step);
      return;
    }

    // Left paddle
    let ldy = 0;
    if (keysRef.current.has("w") || keysRef.current.has("W")) ldy = -PSPD;
    if (keysRef.current.has("s") || keysRef.current.has("S")) ldy = PSPD;
    if (touchRef.current.l !== null) {
      const d = touchRef.current.l - g.ly;
      ldy = Math.sign(d) * Math.min(Math.abs(d) * 0.25, PSPD * 1.6);
    }
    g.ly = Math.max(PH / 2, Math.min(H - PH / 2, g.ly + ldy));

    // Right paddle
    if (g.mode === "2p") {
      let rdy = 0;
      if (keysRef.current.has("ArrowUp")) rdy = -PSPD;
      if (keysRef.current.has("ArrowDown")) rdy = PSPD;
      if (touchRef.current.r !== null) {
        const d = touchRef.current.r - g.ry;
        rdy = Math.sign(d) * Math.min(Math.abs(d) * 0.25, PSPD * 1.6);
      }
      g.ry = Math.max(PH / 2, Math.min(H - PH / 2, g.ry + rdy));
    } else {
      const approaching = g.ball.vx > 0;
      if (approaching) {
        if (!aiApproachingRef.current) {
          // Ball just turned toward AI — pick a fresh deliberate offset so it hits
          // off-centre, generating an angled return rather than a flat one.
          // Offset is ±(15–45 % of half-paddle height), sign chosen randomly.
          const sign = Math.random() > 0.5 ? 1 : -1;
          const mag = PH * (0.15 + Math.random() * 0.30);
          aiOffsetRef.current = sign * mag;
        }
        // Continuously refine prediction as ball travels; offset stays fixed.
        aiTargetRef.current = predictBallY(g.ball) + aiOffsetRef.current;
      } else {
        // Ball going away — drift back to centre, clear offset for next rally.
        aiTargetRef.current = H / 2;
        aiOffsetRef.current = 0;
      }
      aiApproachingRef.current = approaching;

      const clamped = Math.max(PH / 2, Math.min(H - PH / 2, aiTargetRef.current));
      const d = clamped - g.ry;
      g.ry = Math.max(PH / 2, Math.min(H - PH / 2, g.ry + Math.sign(d) * Math.min(Math.abs(d), AI_SPD)));
    }

    // Ball delay after scoring
    if (delayRef.current > 0) { delayRef.current--; rafRef.current = requestAnimationFrame(step); return; }

    g.ball.x += g.ball.vx;
    g.ball.y += g.ball.vy;

    // Top / bottom walls
    if (g.ball.y - BR < 0) { g.ball.y = BR; g.ball.vy = Math.abs(g.ball.vy); }
    if (g.ball.y + BR > H) { g.ball.y = H - BR; g.ball.vy = -Math.abs(g.ball.vy); }

    // Left paddle collision
    if (
      g.ball.vx < 0 &&
      g.ball.x - BR < 20 + PW &&
      g.ball.x + BR > 20 &&
      g.ball.y + BR > g.ly - PH / 2 &&
      g.ball.y - BR < g.ly + PH / 2
    ) {
      const rel = (g.ball.y - g.ly) / (PH / 2);
      const spd = Math.min(Math.hypot(g.ball.vx, g.ball.vy) * 1.05, 14);
      const angle = rel * (Math.PI / 3.5);
      g.ball.vx = spd * Math.cos(angle);
      g.ball.vy = spd * Math.sin(angle);
      g.ball.x = 20 + PW + BR + 1;
    }

    // Right paddle collision
    if (
      g.ball.vx > 0 &&
      g.ball.x + BR > W - 20 - PW &&
      g.ball.x - BR < W - 20 &&
      g.ball.y + BR > g.ry - PH / 2 &&
      g.ball.y - BR < g.ry + PH / 2
    ) {
      const rel = (g.ball.y - g.ry) / (PH / 2);
      const spd = Math.min(Math.hypot(g.ball.vx, g.ball.vy) * 1.05, 14);
      const angle = rel * (Math.PI / 3.5);
      g.ball.vx = -spd * Math.cos(angle);
      g.ball.vy = spd * Math.sin(angle);
      g.ball.x = W - 20 - PW - BR - 1;
    }

    // Scoring
    if (g.ball.x + BR < 0 || g.ball.x - BR > W) {
      const rScores = g.ball.x + BR < 0; // ball left the left side → right player scores
      g.score[rScores ? 1 : 0]++;
      setScore([g.score[0], g.score[1]]);
      const w = rScores ? 1 : 0;
      if (g.score[w] >= WIN) {
        g.phase = "won"; g.winner = w;
        setPhase("won"); setWinner(w);
      } else {
        g.ball = freshBall(rScores ? 1 : -1);
        g.ly = H / 2; g.ry = H / 2;
        delayRef.current = 55;
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }

  function startGame(m: Mode) {
    cancelAnimationFrame(rafRef.current);
    setMode(m); setPhase("playing"); setScore([0, 0]); setWinner(null);
    gsRef.current = freshGame(m);
    delayRef.current = 45;
    aiTargetRef.current = H / 2; aiOffsetRef.current = 0; aiApproachingRef.current = false;
    rafRef.current = requestAnimationFrame(step);
  }

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (["w", "s", "W", "S", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
      keysRef.current.add(e.key);
      if (e.key === "Escape" && gsRef.current && gsRef.current.phase !== "won") {
        const next: Phase = gsRef.current.phase === "playing" ? "paused" : "playing";
        gsRef.current.phase = next;
        setPhase(next);
      }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Touch — map to canvas coordinates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cy = (clientY: number) => ((clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * H;
    const cx = (clientX: number) => ((clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * W;

    const update = (e: TouchEvent) => {
      e.preventDefault();
      let hasL = false, hasR = false;
      for (const t of Array.from(e.touches)) {
        if (cx(t.clientX) < W / 2) { touchRef.current.l = cy(t.clientY); hasL = true; }
        else { touchRef.current.r = cy(t.clientY); hasR = true; }
      }
      if (!hasL) touchRef.current.l = null;
      if (!hasR) touchRef.current.r = null;
    };

    canvas.addEventListener("touchstart", update, { passive: false });
    canvas.addEventListener("touchmove", update, { passive: false });
    canvas.addEventListener("touchend", update, { passive: false });
    canvas.addEventListener("touchcancel", update, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", update);
      canvas.removeEventListener("touchmove", update);
      canvas.removeEventListener("touchend", update);
      canvas.removeEventListener("touchcancel", update);
    };
  }, []);

  return (
    <>
      <SEOHead meta={pageMeta.pong} />
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh", background: "#0d0d0d" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.75rem" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "min(800px, calc((100svh - 80px) * 4 / 3))" }}>
            <canvas
              ref={canvasRef}
              height={H}
              width={W}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, border: "1px solid rgba(255,84,255,0.15)", touchAction: "none" }}
            />

            {/* Menu */}
            {phase === "menu" && (
              <div style={{ ...overlayStyle, background: "rgba(13,13,13,0.93)", borderRadius: 12 }}>
                <p style={eyebrowStyle}>Ready to play?</p>
                <h1 style={titleStyle}>Paddle Battle.</h1>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <button style={btnStyle(false)} onClick={() => startGame("1p")}>1 Player</button>
                  <button style={btnStyle(true)} onClick={() => startGame("2p")}>2 Players</button>
                </div>
                <p style={hintStyle}>
                  Desktop — W / S  ·  Arrow keys<br />
                  Mobile — drag left or right side
                </p>
              </div>
            )}

            {/* Paused */}
            {phase === "paused" && (
              <div style={{ ...overlayStyle, background: "rgba(13,13,13,0.78)", borderRadius: 12 }}>
                <p style={{ ...titleStyle, fontSize: "2.5rem" }}>Paused</p>
                <button style={btnStyle(false)} onClick={() => {
                  if (!gsRef.current) return;
                  gsRef.current.phase = "playing";
                  setPhase("playing");
                }}>Resume</button>
                <p style={hintStyle}>ESC to toggle</p>
              </div>
            )}

            {/* Won */}
            {phase === "won" && (
              <div style={{ ...overlayStyle, background: "rgba(13,13,13,0.93)", borderRadius: 12 }}>
                <p style={eyebrowStyle}>
                  {mode === "1p" ? (winner === 0 ? "You win!" : "AI wins!") : `Player ${(winner ?? 0) + 1} wins!`}
                </p>
                <p style={{ ...titleStyle, fontSize: "clamp(2rem,6vw,3.5rem)" }}>
                  {score[0]} — {score[1]}
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <button style={btnStyle(false)} onClick={() => startGame(mode)}>Play again</button>
                  <button style={btnStyle(true)} onClick={() => { cancelAnimationFrame(rafRef.current); setPhase("menu"); }}>Menu</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <GameFooter />
      </div>
    </>
  );
}
