import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import Leaderboard, { LeaderboardSidebar } from "@/components/Leaderboard";

// ── Constants ──────────────────────────────────────────────────────────────────

const CW = 480, CH = 270;
const PW = 26, PH = 26;
const START_X = 32, START_Y = CH / 2 - PH / 2;
const OBS_W = 14;
const TICK = 20;      // ms per frame (~50 fps)
const SPD_MOVE = 2.5; // player speed px/frame
const BRAND = "#ff54ff";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Obs { x: number; topH: number; gap: number; }

interface GS {
  frame: number;
  spawnN: number;      // how many obstacle pairs spawned
  px: number; py: number;
  vx: number; vy: number;
  obs: Obs[];
  mode: "idle" | "playing" | "over";
}

function freshGS(): GS {
  return { frame: 0, spawnN: 0, px: START_X, py: START_Y, vx: 0, vy: 0, obs: [], mode: "idle" };
}

// Difficulty: speed and gap shrink as game progresses
function obsSpeed(frame: number) { return Math.min(4.5, 1.5 + Math.floor(frame / 600) * 0.35); }
function obsGap(n: number)       { return Math.max(78, 168 - n * 7); }

// ── Draw ───────────────────────────────────────────────────────────────────────

function draw(ctx: CanvasRenderingContext2D, gs: GS) {
  // Background
  ctx.fillStyle = "#07050e";
  ctx.fillRect(0, 0, CW, CH);

  // Subtle grid
  ctx.strokeStyle = "rgba(255,84,255,.04)";
  ctx.lineWidth = 0.5;
  for (let x = 48; x < CW; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
  }
  for (let y = 45; y < CH; y += 45) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
  }

  // Obstacles — dark pillars with neon border
  for (const o of gs.obs) {
    // top pillar
    if (o.topH > 0) {
      ctx.fillStyle = "#11082a";
      ctx.fillRect(o.x, 0, OBS_W, o.topH);
      ctx.strokeStyle = BRAND;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x + 0.75, 0, OBS_W - 1.5, o.topH);
    }
    // bottom pillar
    const botY = o.topH + o.gap, botH = CH - botY;
    if (botH > 0) {
      ctx.fillStyle = "#11082a";
      ctx.fillRect(o.x, botY, OBS_W, botH);
      ctx.strokeStyle = BRAND;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x + 0.75, botY, OBS_W - 1.5, botH);
    }
    // gap glow
    ctx.save();
    const grd = ctx.createLinearGradient(o.x, 0, o.x + OBS_W, 0);
    grd.addColorStop(0, "transparent");
    grd.addColorStop(0.5, "rgba(255,84,255,.04)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(o.x, o.topH, OBS_W, o.gap);
    ctx.restore();
  }

  // Player — glowing pink square
  ctx.save();
  ctx.shadowColor = BRAND;
  ctx.shadowBlur = 18;
  ctx.fillStyle = BRAND;
  ctx.fillRect(gs.px, gs.py, PW, PH);
  ctx.shadowBlur = 0;
  // inner highlight
  ctx.fillStyle = "rgba(255,215,255,.5)";
  ctx.fillRect(gs.px + 5, gs.py + 5, PW - 10, PH - 10);
  ctx.restore();

  // Score overlay (top-right, during play)
  if (gs.mode === "playing") {
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = "600 12px 'DM Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(String(gs.frame), CW - 10, 18);
    ctx.textAlign = "left";
  }

  // Idle prompt
  if (gs.mode === "idle") {
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(0, CH - 38, CW, 38);
    ctx.fillStyle = "rgba(255,84,255,.7)";
    ctx.font = "bold 12px 'DM Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CLICK OR PRESS SPACE TO START", CW / 2, CH - 14);
    ctx.textAlign = "left";
  }
}

// ── CSS ────────────────────────────────────────────────────────────────────────

const css = `
  .bd-page  { min-height:100vh; background:#0d0d0d; color:#fff; display:flex; flex-direction:column; align-items:center; }
  .bd-center{ width:100%; max-width:900px; padding:1.25rem 1rem 3rem; display:flex; flex-direction:column; align-items:center; gap:1rem; }

  .bd-header { width:100%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; }
  .bd-title  { font-family:'DM Serif Display',serif; font-size:1.6rem; color:${BRAND}; margin:0; text-shadow:0 0 24px rgba(255,84,255,.35); }
  .bd-scores { display:flex; gap:1.2rem; }
  .bd-sbox   { display:flex; flex-direction:column; align-items:flex-end; gap:1px; }
  .bd-slbl   { font-family:'DM Mono',monospace; font-size:.48rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,84,255,.5); }
  .bd-sval   { font-family:'DM Mono',monospace; font-size:.9rem; color:${BRAND}; }

  .bd-sub    { width:100%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.5rem; }
  .bd-hint   { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.1em; color:rgba(255,255,255,.28); text-transform:uppercase; }
  .bd-btn    { font-family:'DM Mono',monospace; font-size:.62rem; letter-spacing:.1em; text-transform:uppercase; border:none; border-radius:999px; padding:.45rem 1.3rem; cursor:pointer; transition:opacity .15s, transform .1s; }
  .bd-btn:hover  { opacity:.85; transform:scale(1.03); }
  .bd-btn-outline{ background:transparent; color:rgba(255,84,255,.8); border:1px solid rgba(255,84,255,.35); }
  .bd-btn-solid  { background:linear-gradient(135deg,${BRAND},#c833c8); color:#fff; }

  .bd-layout{ display:flex; align-items:flex-start; gap:1.5rem; flex-wrap:wrap; justify-content:center; width:100%; }

  .bd-game-col { display:flex; flex-direction:column; align-items:center; gap:.85rem; }

  .bd-canvas-wrap { position:relative; width:100%; max-width:480px; }
  .bd-canvas {
    display:block; width:100%; height:auto;
    border-radius:10px;
    border:1px solid rgba(255,84,255,.2);
    cursor:pointer;
  }
  .bd-overlay {
    position:absolute; inset:0;
    background:rgba(5,2,15,.78);
    backdrop-filter:blur(4px);
    border-radius:10px;
    display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
    padding:1rem .75rem .75rem;
    overflow-y:auto;
  }
  .bd-ov-eye  { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,84,255,.65); margin:0 0 .15rem; }
  .bd-ov-head { font-family:'DM Serif Display',serif; font-size:2rem; color:#fff; margin:0 0 .6rem; }
  .bd-ov-btns { display:flex; gap:.6rem; flex-wrap:wrap; justify-content:center; margin-bottom:.15rem; }

  .bd-dpad  { display:grid; grid-template-columns:repeat(3,44px); grid-template-rows:repeat(3,44px); gap:4px; }
  .bd-dp    { background:rgba(255,84,255,.1); border:1px solid rgba(255,84,255,.22); border-radius:8px; color:rgba(255,255,255,.7); font-size:1rem; display:flex; align-items:center; justify-content:center; cursor:pointer; touch-action:none; user-select:none; transition:background .08s; }
  .bd-dp:active { background:rgba(255,84,255,.3); }
  .bd-dp-up   { grid-column:2; grid-row:1; }
  .bd-dp-left { grid-column:1; grid-row:2; }
  .bd-dp-right{ grid-column:3; grid-row:2; }
  .bd-dp-down { grid-column:2; grid-row:3; }

  .bd-back { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.1em; color:rgba(255,84,255,.35); text-decoration:none; text-transform:uppercase; transition:color .15s; margin-top:.5rem; }
  .bd-back:hover { color:rgba(255,84,255,.8); }
`;

// ── Component ──────────────────────────────────────────────────────────────────

export default function BlockDashPage() {
  const [mounted, setMounted] = useState(false);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const gsRef      = useRef<GS | null>(null);
  const keysRef    = useRef(new Set<string>());
  const btnVxRef   = useRef(0);
  const btnVyRef   = useRef(0);

  const [gameMode,    setGameMode]    = useState<"idle"|"playing"|"over">("idle");
  const [score,       setScore]       = useState(0);
  const [finalScore,  setFinalScore]  = useState(0);
  const [best,        setBest]        = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Init
    const stored = parseInt(localStorage.getItem("blockdash-best") || "0", 10);
    setBest(stored);

    const gs = freshGS();
    gsRef.current = gs;
    draw(ctx, gs);

    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.code === "Space" || e.code === "Enter") && gs.mode === "idle") {
        gs.mode = "playing";
        setGameMode("playing");
        e.preventDefault();
        return;
      }
      keysRef.current.add(e.code);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    // Game tick
    const interval = setInterval(() => {
      const g = gsRef.current;
      if (!g || g.mode !== "playing") {
        if (g) draw(ctx, g);
        return;
      }

      // Resolve speed (keyboard + buttons)
      const k = keysRef.current;
      const kx = k.has("ArrowLeft")||k.has("KeyA") ? -SPD_MOVE : k.has("ArrowRight")||k.has("KeyD") ? SPD_MOVE : 0;
      const ky = k.has("ArrowUp") ||k.has("KeyW") ? -SPD_MOVE : k.has("ArrowDown") ||k.has("KeyS") ? SPD_MOVE : 0;
      g.vx = btnVxRef.current || kx;
      g.vy = btnVyRef.current || ky;

      g.frame++;

      // Spawn obstacle pair every 150 frames
      if (g.frame === 1 || g.frame % 150 === 0) {
        const gap   = obsGap(g.spawnN);
        const minH  = 20, maxH = CH - gap - 20;
        const topH  = Math.floor(Math.random() * (maxH - minH) + minH);
        g.obs.push({ x: CW + 2, topH, gap });
        g.spawnN++;
      }

      // Move obstacles
      const spd = obsSpeed(g.frame);
      g.obs.forEach(o => { o.x -= spd; });
      g.obs = g.obs.filter(o => o.x + OBS_W > -4);

      // Move player (clamped)
      g.px = Math.max(0, Math.min(CW - PW, g.px + g.vx));
      g.py = Math.max(0, Math.min(CH - PH, g.py + g.vy));

      // Collision
      let hit = false;
      for (const o of g.obs) {
        const inX = g.px + PW > o.x && g.px < o.x + OBS_W;
        if (inX && (g.py < o.topH || g.py + PH > o.topH + o.gap)) { hit = true; break; }
      }

      if (hit) {
        g.mode = "over";
        const s = g.frame;
        setFinalScore(s);
        setBest(prev => {
          const b = Math.max(prev, s);
          localStorage.setItem("blockdash-best", String(b));
          return b;
        });
        setGameMode("over");
      }

      // Sync live score to React header
      if (g.frame % 6 === 0) setScore(g.frame);

      draw(ctx, g);
    }, TICK);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, [mounted]);

  // Restart — just swap in a new GS (interval keeps running)
  function handlePlayAgain() {
    const g = freshGS();
    g.mode = "playing";
    gsRef.current = g;
    setFinalScore(0);
    setScore(0);
    setGameMode("playing");
  }

  function handleCanvasClick() {
    const g = gsRef.current;
    if (g?.mode === "idle") {
      g.mode = "playing";
      setGameMode("playing");
    }
  }

  // ── SSR guard ──────────────────────────────────────────────────────────────────
  if (!mounted) return <><SEOHead meta={pageMeta.blockdash} /></>;

  const isOver = gameMode === "over";

  return (
    <>
      <SEOHead meta={pageMeta.blockdash} />
      <style>{css}</style>
      <div className="bd-page">
        <Navbar />
        <div className="bd-center">

          <div className="bd-header">
            <h1 className="bd-title">BLOCK DASH</h1>
            <div className="bd-scores">
              <div className="bd-sbox">
                <span className="bd-slbl">Score</span>
                <span className="bd-sval">{isOver ? finalScore : score}</span>
              </div>
              <div className="bd-sbox">
                <span className="bd-slbl">Best</span>
                <span className="bd-sval">{best}</span>
              </div>
            </div>
          </div>

          <div className="bd-sub">
            <span className="bd-hint">Arrows · WASD · D-pad</span>
            <button className="bd-btn bd-btn-outline" onClick={handlePlayAgain}>New game</button>
          </div>

          <div className="bd-layout">
            <div className="bd-game-col">
              <div className="bd-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  className="bd-canvas"
                  width={CW}
                  height={CH}
                  onClick={handleCanvasClick}
                />
                {isOver && (
                  <div className="bd-overlay" style={{ overflowY: "auto", paddingBottom: "1rem" }}>
                    <p className="bd-ov-eye">You hit a wall</p>
                    <p className="bd-ov-head">Game over</p>
                    <div className="bd-ov-btns">
                      <button className="bd-btn bd-btn-solid" onClick={handlePlayAgain}>Play again</button>
                    </div>
                    <Leaderboard game="blockdash" score={finalScore} />
                  </div>
                )}
              </div>

              {/* D-pad */}
              <div className="bd-dpad">
                <div
                  className="bd-dp bd-dp-up"
                  onPointerDown={() => { btnVyRef.current = -SPD_MOVE; }}
                  onPointerUp={()   => { btnVyRef.current = 0; }}
                  onPointerLeave={()=> { btnVyRef.current = 0; }}
                >▲</div>
                <div
                  className="bd-dp bd-dp-left"
                  onPointerDown={() => { btnVxRef.current = -SPD_MOVE; }}
                  onPointerUp={()   => { btnVxRef.current = 0; }}
                  onPointerLeave={()=> { btnVxRef.current = 0; }}
                >◀</div>
                <div
                  className="bd-dp bd-dp-right"
                  onPointerDown={() => { btnVxRef.current = SPD_MOVE; }}
                  onPointerUp={()   => { btnVxRef.current = 0; }}
                  onPointerLeave={()=> { btnVxRef.current = 0; }}
                >▶</div>
                <div
                  className="bd-dp bd-dp-down"
                  onPointerDown={() => { btnVyRef.current = SPD_MOVE; }}
                  onPointerUp={()   => { btnVyRef.current = 0; }}
                  onPointerLeave={()=> { btnVyRef.current = 0; }}
                >▼</div>
              </div>
            </div>

            <LeaderboardSidebar game="blockdash" />
          </div>

          <a className="bd-back" href="/projects/">← Back to Projects</a>
        </div>
      </div>
    </>
  );
}
