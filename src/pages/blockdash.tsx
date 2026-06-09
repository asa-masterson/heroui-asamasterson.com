import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import Leaderboard, { LeaderboardSidebar } from "@/components/Leaderboard";
import GameStaticPreview from "@/components/GameStaticPreview";
import GameFooter from "@/components/GameFooter";

// ── Constants ──────────────────────────────────────────────────────────────────

const CW = 480, CH = 270;
const PW = 26, PH = 26;
const START_X = 32, START_Y = CH / 2 - PH / 2;
const OBS_W = 14;
const TICK = 20;
const SPD_MOVE = 2.5;
const BRAND = "#ff54ff";
const CYAN = "#00e5ff";
const BOLT_W = 26, BOLT_H = 5;
const TRAIL_LEN = 6;
const NUM_STARS = 45;
const NUM_STREAKS = 20;

// ── Types ──────────────────────────────────────────────────────────────────────

interface Obs    { x: number; topH: number; gap: number; }
interface Bolt   { x: number; y: number; }
interface Star   { x: number; y: number; r: number; a: number; }
interface Streak { x: number; y: number; len: number; spd: number; alpha: number; }
interface TrPt   { x: number; y: number; }

interface GS {
  frame: number;
  spawnN: number;
  px: number; py: number;
  vx: number; vy: number;
  obs: Obs[];
  bolts: Bolt[];
  stars: Star[];
  streaks: Streak[];
  trail: TrPt[];
  mode: "idle" | "playing" | "over";
}

function makeStars(): Star[] {
  return Array.from({ length: NUM_STARS }, () => ({
    x: Math.random() * CW,
    y: Math.random() * CH,
    r: Math.random() < 0.65 ? 1 : 2,
    a: Math.random() * 0.22 + 0.05,
  }));
}

function makeStreaks(): Streak[] {
  return Array.from({ length: NUM_STREAKS }, () => ({
    x: Math.random() * CW,
    y: Math.random() * CH,
    len: Math.random() * 38 + 10,
    spd: Math.random() * 1.2 + 0.35,
    alpha: Math.random() * 0.065 + 0.018,
  }));
}

function freshGS(): GS {
  return {
    frame: 0, spawnN: 0,
    px: START_X, py: START_Y,
    vx: 0, vy: 0,
    obs: [], bolts: [],
    stars: makeStars(),
    streaks: makeStreaks(),
    trail: [],
    mode: "idle",
  };
}

function obsSpeed(frame: number) { return Math.min(4.5, 1.5 + Math.floor(frame / 600) * 0.35); }
function obsGap(n: number)       { return Math.max(78, 168 - n * 7); }

// ── Draw ───────────────────────────────────────────────────────────────────────

function drawPillar(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, oh: number,
  capAtBottom: boolean,
) {
  if (oh <= 0) return;

  // gradient fill
  const g = ctx.createLinearGradient(ox, 0, ox + OBS_W, 0);
  g.addColorStop(0, "#0b0526");
  g.addColorStop(0.5, "#180c35");
  g.addColorStop(1, "#0b0526");
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, OBS_W, oh);

  // horizontal ridge lines
  ctx.strokeStyle = "rgba(255,84,255,.13)";
  ctx.lineWidth = 1;
  for (let ry = oy + 8; ry < oy + oh; ry += 12) {
    ctx.beginPath(); ctx.moveTo(ox + 2, ry); ctx.lineTo(ox + OBS_W - 2, ry); ctx.stroke();
  }

  // glowing border
  ctx.save();
  ctx.shadowColor = BRAND;
  ctx.shadowBlur = 7;
  ctx.strokeStyle = BRAND;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ox + 0.75, oy, OBS_W - 1.5, oh);
  ctx.restore();

  // bright neon cap at the gap-facing edge
  const capY = capAtBottom ? oy + oh - 3 : oy;
  ctx.save();
  ctx.shadowColor = BRAND;
  ctx.shadowBlur = 14;
  ctx.fillStyle = BRAND;
  ctx.fillRect(ox, capY, OBS_W, 3);
  ctx.restore();
}

function draw(ctx: CanvasRenderingContext2D, gs: GS) {
  // 1. Gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, CH);
  bg.addColorStop(0, "#060213");
  bg.addColorStop(0.5, "#07050e");
  bg.addColorStop(1, "#060213");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  // 2. Faint grid
  ctx.strokeStyle = "rgba(255,84,255,.04)";
  ctx.lineWidth = 0.5;
  for (let x = 48; x < CW; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
  }
  for (let y = 45; y < CH; y += 45) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
  }

  // 3. Stars
  for (const s of gs.stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }

  // 4. Speed streaks
  for (const st of gs.streaks) {
    ctx.strokeStyle = `rgba(255,84,255,${st.alpha})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(st.x, st.y);
    ctx.lineTo(st.x + st.len, st.y);
    ctx.stroke();
  }

  // 5. Floor / ceiling accent
  const topGlow = ctx.createLinearGradient(0, 0, 0, 18);
  topGlow.addColorStop(0, "rgba(255,84,255,.12)");
  topGlow.addColorStop(1, "transparent");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, CW, 18);

  const botGlow = ctx.createLinearGradient(0, CH - 18, 0, CH);
  botGlow.addColorStop(0, "transparent");
  botGlow.addColorStop(1, "rgba(255,84,255,.12)");
  ctx.fillStyle = botGlow;
  ctx.fillRect(0, CH - 18, CW, 18);

  ctx.strokeStyle = "rgba(255,84,255,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.lineTo(CW, 0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, CH - 0.5); ctx.lineTo(CW, CH - 0.5); ctx.stroke();

  // 6. Obstacles
  for (const o of gs.obs) {
    drawPillar(ctx, o.x, 0, o.topH, true);
    const botY = o.topH + o.gap;
    drawPillar(ctx, o.x, botY, CH - botY, false);

    // gap centre glow
    const grd = ctx.createLinearGradient(o.x, 0, o.x + OBS_W, 0);
    grd.addColorStop(0, "transparent");
    grd.addColorStop(0.5, "rgba(255,84,255,.05)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(o.x, o.topH, OBS_W, o.gap);
  }

  // 7. Laser bolts
  for (const b of gs.bolts) {
    ctx.save();
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 12;
    ctx.fillStyle = CYAN;
    ctx.fillRect(b.x, b.y, BOLT_W, BOLT_H);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillRect(b.x + 2, b.y + 1, BOLT_W - 4, BOLT_H - 2);
    ctx.restore();
  }

  // 8. Player trail
  for (let i = 0; i < gs.trail.length; i++) {
    const t = gs.trail[i];
    const a = ((i + 1) / gs.trail.length) * 0.2;
    ctx.fillStyle = `rgba(255,84,255,${a.toFixed(2)})`;
    ctx.fillRect(t.x + 3, t.y + 3, PW - 6, PH - 6);
  }

  // 9. Player
  ctx.save();
  ctx.shadowColor = BRAND;
  ctx.shadowBlur = 18;
  ctx.fillStyle = BRAND;
  ctx.fillRect(gs.px, gs.py, PW, PH);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,215,255,.5)";
  ctx.fillRect(gs.px + 5, gs.py + 5, PW - 10, PH - 10);
  ctx.restore();

  // 10. Score overlay
  if (gs.mode === "playing") {
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = "600 12px 'DM Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(String(gs.frame), CW - 10, 18);
    ctx.textAlign = "left";
  }

  // 11. Idle prompt
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
  .bd-center{ width:100%; max-width:900px; padding:1.25rem 1rem 2rem; display:flex; flex-direction:column; align-items:center; gap:1rem; flex:1; }

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

`;

// ── Component ──────────────────────────────────────────────────────────────────

export default function BlockDashPage() {
  const [mounted, setMounted] = useState(false);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const gsRef      = useRef<GS | null>(null);
  const keysRef    = useRef(new Set<string>());
  const btnVxRef   = useRef(0);
  const btnVyRef   = useRef(0);

  const [gameMode,   setGameMode]   = useState<"idle"|"playing"|"over">("idle");
  const [score,      setScore]      = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [best,       setBest]       = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const stored = parseInt(localStorage.getItem("blockdash-best") || "0", 10);
    setBest(stored);

    const gs = freshGS();
    gsRef.current = gs;
    draw(ctx, gs);

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

    const interval = setInterval(() => {
      const g = gsRef.current;
      if (!g || g.mode !== "playing") {
        if (g) draw(ctx, g);
        return;
      }

      // Input
      const k = keysRef.current;
      const kx = k.has("ArrowLeft")||k.has("KeyA") ? -SPD_MOVE : k.has("ArrowRight")||k.has("KeyD") ? SPD_MOVE : 0;
      const ky = k.has("ArrowUp") ||k.has("KeyW") ? -SPD_MOVE : k.has("ArrowDown") ||k.has("KeyS") ? SPD_MOVE : 0;
      g.vx = btnVxRef.current || kx;
      g.vy = btnVyRef.current || ky;

      g.frame++;

      // Spawn pillar pair every 150 frames
      if (g.frame === 1 || g.frame % 150 === 0) {
        const gap  = obsGap(g.spawnN);
        const minH = 20, maxH = CH - gap - 20;
        const topH = Math.floor(Math.random() * (maxH - minH) + minH);
        g.obs.push({ x: CW + 2, topH, gap });
        g.spawnN++;
      }

      // Move pillars
      const spd = obsSpeed(g.frame);
      g.obs.forEach(o => { o.x -= spd; });
      g.obs = g.obs.filter(o => o.x + OBS_W > -4);

      // Spawn laser bolt: one every 280 frames after frame 600
      if (g.frame > 600 && g.frame % 280 === 0) {
        g.bolts.push({ x: CW + 4, y: Math.random() * (CH - BOLT_H - 24) + 12 });
      }

      // Move bolts (fixed speed, slightly faster than pillars)
      const boltSpd = Math.min(5.5, spd + 1.5);
      g.bolts.forEach(b => { b.x -= boltSpd; });
      g.bolts = g.bolts.filter(b => b.x + BOLT_W > -4);

      // Update streaks (cosmetic)
      for (const st of g.streaks) {
        st.x -= st.spd;
        if (st.x + st.len < 0) {
          st.x = CW + Math.random() * 24;
          st.y = Math.random() * CH;
          st.len = Math.random() * 38 + 10;
        }
      }

      // Move player
      g.px = Math.max(0, Math.min(CW - PW, g.px + g.vx));
      g.py = Math.max(0, Math.min(CH - PH, g.py + g.vy));

      // Update trail
      g.trail.unshift({ x: g.px, y: g.py });
      if (g.trail.length > TRAIL_LEN) g.trail.length = TRAIL_LEN;

      // Pillar collision
      let hit = false;
      for (const o of g.obs) {
        const inX = g.px + PW > o.x && g.px < o.x + OBS_W;
        if (inX && (g.py < o.topH || g.py + PH > o.topH + o.gap)) { hit = true; break; }
      }

      // Bolt collision
      if (!hit) {
        for (const b of g.bolts) {
          const inX = g.px + PW > b.x && g.px < b.x + BOLT_W;
          const inY = g.py + PH > b.y && g.py < b.y + BOLT_H;
          if (inX && inY) { hit = true; break; }
        }
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

      if (g.frame % 6 === 0) setScore(g.frame);

      draw(ctx, g);
    }, TICK);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, [mounted]);

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

  if (!mounted) return (
    <GameStaticPreview
      meta={pageMeta.blockdash}
      title="Block Dash"
      description="Navigate a glowing neon block through an endless corridor of obstacles. Speed increases and gaps narrow as you progress. Cyan laser bolts appear in the later stages for extra challenge. Beat your high score and climb the global leaderboard."
      tags={["1 Player", "Arcade", "Leaderboard", "Canvas"]}
    />
  );

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

              <div className="bd-dpad">
                <div className="bd-dp bd-dp-up"
                  onPointerDown={() => { btnVyRef.current = -SPD_MOVE; }}
                  onPointerUp={()   => { btnVyRef.current = 0; }}
                  onPointerLeave={()=> { btnVyRef.current = 0; }}
                >▲</div>
                <div className="bd-dp bd-dp-left"
                  onPointerDown={() => { btnVxRef.current = -SPD_MOVE; }}
                  onPointerUp={()   => { btnVxRef.current = 0; }}
                  onPointerLeave={()=> { btnVxRef.current = 0; }}
                >◀</div>
                <div className="bd-dp bd-dp-right"
                  onPointerDown={() => { btnVxRef.current = SPD_MOVE; }}
                  onPointerUp={()   => { btnVxRef.current = 0; }}
                  onPointerLeave={()=> { btnVxRef.current = 0; }}
                >▶</div>
                <div className="bd-dp bd-dp-down"
                  onPointerDown={() => { btnVyRef.current = SPD_MOVE; }}
                  onPointerUp={()   => { btnVyRef.current = 0; }}
                  onPointerLeave={()=> { btnVyRef.current = 0; }}
                >▼</div>
              </div>
            </div>

            <LeaderboardSidebar game="blockdash" />
          </div>

        </div>
        <GameFooter />
      </div>
    </>
  );
}
