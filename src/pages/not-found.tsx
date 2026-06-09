import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";

// ── Constants (same as Block Dash) ────────────────────────────────────────────

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

const notFoundMeta = {
  title: "404 — Page Not Found · Asa Masterson",
  description: "This page doesn't exist — but Block Dash does. Play while you figure out where to go.",
  canonical: "https://asamasterson.com/404/",
  ogTitle: "404 — Asa Masterson",
  ogDescription: "Page not found. Play Block Dash while you find your way back.",
  ogImage: "https://minio-s3.bigfluffy.monster/pigsare-pink/assets/og-image.png",
  ogType: "website" as const,
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface Obs    { x: number; topH: number; gap: number; }
interface Bolt   { x: number; y: number; }
interface Star   { x: number; y: number; r: number; a: number; }
interface Streak { x: number; y: number; len: number; spd: number; alpha: number; }
interface TrPt   { x: number; y: number; }

interface GS {
  frame: number; spawnN: number;
  px: number; py: number; vx: number; vy: number;
  obs: Obs[]; bolts: Bolt[];
  stars: Star[]; streaks: Streak[]; trail: TrPt[];
  mode: "idle" | "playing" | "over";
}

function makeStars(): Star[] {
  return Array.from({ length: NUM_STARS }, () => ({
    x: Math.random() * CW, y: Math.random() * CH,
    r: Math.random() < 0.65 ? 1 : 2, a: Math.random() * 0.22 + 0.05,
  }));
}

function makeStreaks(): Streak[] {
  return Array.from({ length: NUM_STREAKS }, () => ({
    x: Math.random() * CW, y: Math.random() * CH,
    len: Math.random() * 38 + 10, spd: Math.random() * 1.2 + 0.35,
    alpha: Math.random() * 0.065 + 0.018,
  }));
}

function freshGS(): GS {
  return { frame: 0, spawnN: 0, px: START_X, py: START_Y, vx: 0, vy: 0,
    obs: [], bolts: [], stars: makeStars(), streaks: makeStreaks(), trail: [], mode: "idle" };
}

function obsSpeed(frame: number) { return Math.min(4.5, 1.5 + Math.floor(frame / 600) * 0.35); }
function obsGap(n: number)       { return Math.max(78, 168 - n * 7); }

// ── Draw ──────────────────────────────────────────────────────────────────────

function drawPillar(ctx: CanvasRenderingContext2D, ox: number, oy: number, oh: number, capAtBottom: boolean) {
  if (oh <= 0) return;
  const g = ctx.createLinearGradient(ox, 0, ox + OBS_W, 0);
  g.addColorStop(0, "#0b0526"); g.addColorStop(0.5, "#180c35"); g.addColorStop(1, "#0b0526");
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, OBS_W, oh);
  ctx.strokeStyle = "rgba(255,84,255,.13)"; ctx.lineWidth = 1;
  for (let ry = oy + 8; ry < oy + oh; ry += 12) {
    ctx.beginPath(); ctx.moveTo(ox + 2, ry); ctx.lineTo(ox + OBS_W - 2, ry); ctx.stroke();
  }
  ctx.save();
  ctx.shadowColor = BRAND; ctx.shadowBlur = 7;
  ctx.strokeStyle = BRAND; ctx.lineWidth = 1.5;
  ctx.strokeRect(ox + 0.75, oy, OBS_W - 1.5, oh);
  ctx.restore();
  const capY = capAtBottom ? oy + oh - 3 : oy;
  ctx.save();
  ctx.shadowColor = BRAND; ctx.shadowBlur = 14;
  ctx.fillStyle = BRAND; ctx.fillRect(ox, capY, OBS_W, 3);
  ctx.restore();
}

function draw(ctx: CanvasRenderingContext2D, gs: GS) {
  const bg = ctx.createLinearGradient(0, 0, 0, CH);
  bg.addColorStop(0, "#060213"); bg.addColorStop(0.5, "#07050e"); bg.addColorStop(1, "#060213");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);

  ctx.strokeStyle = "rgba(255,84,255,.04)"; ctx.lineWidth = 0.5;
  for (let x = 48; x < CW; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
  for (let y = 45; y < CH; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }

  for (const s of gs.stars) { ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fillRect(s.x, s.y, s.r, s.r); }

  for (const st of gs.streaks) {
    ctx.strokeStyle = `rgba(255,84,255,${st.alpha})`; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x + st.len, st.y); ctx.stroke();
  }

  const topGlow = ctx.createLinearGradient(0, 0, 0, 18);
  topGlow.addColorStop(0, "rgba(255,84,255,.12)"); topGlow.addColorStop(1, "transparent");
  ctx.fillStyle = topGlow; ctx.fillRect(0, 0, CW, 18);
  const botGlow = ctx.createLinearGradient(0, CH - 18, 0, CH);
  botGlow.addColorStop(0, "transparent"); botGlow.addColorStop(1, "rgba(255,84,255,.12)");
  ctx.fillStyle = botGlow; ctx.fillRect(0, CH - 18, CW, 18);
  ctx.strokeStyle = "rgba(255,84,255,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.lineTo(CW, 0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, CH - 0.5); ctx.lineTo(CW, CH - 0.5); ctx.stroke();

  for (const o of gs.obs) {
    drawPillar(ctx, o.x, 0, o.topH, true);
    const botY = o.topH + o.gap;
    drawPillar(ctx, o.x, botY, CH - botY, false);
    const grd = ctx.createLinearGradient(o.x, 0, o.x + OBS_W, 0);
    grd.addColorStop(0, "transparent"); grd.addColorStop(0.5, "rgba(255,84,255,.05)"); grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd; ctx.fillRect(o.x, o.topH, OBS_W, o.gap);
  }

  for (const b of gs.bolts) {
    ctx.save();
    ctx.shadowColor = CYAN; ctx.shadowBlur = 12;
    ctx.fillStyle = CYAN; ctx.fillRect(b.x, b.y, BOLT_W, BOLT_H);
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(b.x + 2, b.y + 1, BOLT_W - 4, BOLT_H - 2);
    ctx.restore();
  }

  for (let i = 0; i < gs.trail.length; i++) {
    const t = gs.trail[i];
    const a = ((i + 1) / gs.trail.length) * 0.2;
    ctx.fillStyle = `rgba(255,84,255,${a.toFixed(2)})`; ctx.fillRect(t.x + 3, t.y + 3, PW - 6, PH - 6);
  }

  ctx.save();
  ctx.shadowColor = BRAND; ctx.shadowBlur = 18;
  ctx.fillStyle = BRAND; ctx.fillRect(gs.px, gs.py, PW, PH);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,215,255,.5)"; ctx.fillRect(gs.px + 5, gs.py + 5, PW - 10, PH - 10);
  ctx.restore();

  if (gs.mode === "playing") {
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "600 12px 'DM Mono', monospace";
    ctx.textAlign = "right"; ctx.fillText(String(gs.frame), CW - 10, 18); ctx.textAlign = "left";
  }

  if (gs.mode === "idle") {
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, CH - 38, CW, 38);
    ctx.fillStyle = "rgba(255,84,255,.7)"; ctx.font = "bold 12px 'DM Mono', monospace";
    ctx.textAlign = "center"; ctx.fillText("CLICK OR PRESS SPACE TO START", CW / 2, CH - 14); ctx.textAlign = "left";
  }
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
  .nf-page  { min-height:100vh; background:#0d0d0d; color:#fff; display:flex; flex-direction:column; align-items:center; }
  .nf-center{ width:100%; max-width:560px; padding:1.25rem 1rem 2rem; display:flex; flex-direction:column; align-items:center; gap:1.25rem; flex:1; }

  .nf-hero      { width:100%; display:flex; flex-direction:column; gap:.35rem; }
  .nf-hero-top  { display:flex; align-items:baseline; gap:.9rem; flex-wrap:wrap; }
  .nf-code  { font-family:'DM Serif Display',serif; font-size:clamp(3.5rem,14vw,7rem); line-height:1; color:${BRAND};
               text-shadow:0 0 50px rgba(255,84,255,.5),0 0 100px rgba(255,84,255,.2); margin:0; }
  .nf-msg   { font-family:'DM Serif Display',serif; font-style:italic; font-size:clamp(1rem,4vw,1.7rem);
               color:rgba(255,255,255,.4); margin:0; }
  .nf-desc  { font-family:'DM Mono',monospace; font-size:.68rem; letter-spacing:.04em; line-height:1.6;
               color:rgba(255,255,255,.32); margin:0; }

  .nf-hint  { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.1em; color:rgba(255,255,255,.28); text-transform:uppercase; }
  .nf-btn   { font-family:'DM Mono',monospace; font-size:.62rem; letter-spacing:.1em; text-transform:uppercase;
               border:none; border-radius:999px; padding:.45rem 1.3rem; cursor:pointer; transition:opacity .15s,transform .1s; }
  .nf-btn:hover { opacity:.85; transform:scale(1.03); }
  .nf-btn-solid   { background:linear-gradient(135deg,${BRAND},#c833c8); color:#fff; }
  .nf-btn-ghost   { background:transparent; color:rgba(255,255,255,.45); border:1px solid rgba(255,255,255,.12); }

  .nf-game-col   { display:flex; flex-direction:column; align-items:center; gap:.5rem; width:100%; }
  .nf-game-header{ width:100%; max-width:480px; display:flex; justify-content:space-between; align-items:center; }

  .nf-canvas-wrap { position:relative; width:100%; max-width:480px; }
  .nf-canvas {
    display:block; width:100%; height:auto;
    border-radius:10px; border:1px solid rgba(255,84,255,.2); cursor:pointer;
  }
  .nf-overlay {
    position:absolute; inset:0;
    background:rgba(5,2,15,.78); backdrop-filter:blur(4px);
    border-radius:10px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:.7rem; padding:1.5rem;
  }
  .nf-ov-eye  { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,84,255,.65); margin:0; }
  .nf-ov-head { font-family:'DM Serif Display',serif; font-size:2rem; color:#fff; margin:0; }
  .nf-ov-score{ font-family:'DM Mono',monospace; font-size:.75rem; color:rgba(255,84,255,.7); margin:0; }
  .nf-ov-btns { display:flex; gap:.6rem; flex-wrap:wrap; justify-content:center; margin-top:.25rem; }

  .nf-dpad  { display:grid; grid-template-columns:repeat(3,44px); grid-template-rows:repeat(3,44px); gap:4px; }
  .nf-dp    { background:rgba(255,84,255,.1); border:1px solid rgba(255,84,255,.22); border-radius:8px;
               color:rgba(255,255,255,.7); font-size:1rem; display:flex; align-items:center; justify-content:center;
               cursor:pointer; touch-action:none; user-select:none; transition:background .08s; }
  .nf-dp:active { background:rgba(255,84,255,.3); }
  .nf-dp-up    { grid-column:2; grid-row:1; }
  .nf-dp-left  { grid-column:1; grid-row:2; }
  .nf-dp-right { grid-column:3; grid-row:2; }
  .nf-dp-down  { grid-column:2; grid-row:3; }

  .nf-nav-footer{ width:100%; margin-top:auto; border-top:1px solid rgba(255,84,255,.12);
                   padding:1rem 1.5rem; display:flex; gap:2rem; flex-wrap:wrap; justify-content:center; align-items:center; }
  .nf-nav-link  { font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
                   color:rgba(255,84,255,.6); text-decoration:none; transition:color .15s; padding:.25rem 0; }
  .nf-nav-link:hover { color:${BRAND}; }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotFoundPage() {
  const [mounted, setMounted]     = useState(false);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const gsRef       = useRef<GS | null>(null);
  const keysRef     = useRef(new Set<string>());
  const btnVxRef    = useRef(0);
  const btnVyRef    = useRef(0);

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
        gs.mode = "playing"; setGameMode("playing"); e.preventDefault(); return;
      }
      keysRef.current.add(e.code);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    const interval = setInterval(() => {
      const g = gsRef.current;
      if (!g || g.mode !== "playing") { if (g) draw(ctx, g); return; }

      const k = keysRef.current;
      const kx = k.has("ArrowLeft")||k.has("KeyA") ? -SPD_MOVE : k.has("ArrowRight")||k.has("KeyD") ? SPD_MOVE : 0;
      const ky = k.has("ArrowUp") ||k.has("KeyW") ? -SPD_MOVE : k.has("ArrowDown") ||k.has("KeyS") ? SPD_MOVE : 0;
      g.vx = btnVxRef.current || kx;
      g.vy = btnVyRef.current || ky;

      g.frame++;

      if (g.frame === 1 || g.frame % 150 === 0) {
        const gap = obsGap(g.spawnN), minH = 20, maxH = CH - gap - 20;
        g.obs.push({ x: CW + 2, topH: Math.floor(Math.random() * (maxH - minH) + minH), gap });
        g.spawnN++;
      }

      const spd = obsSpeed(g.frame);
      g.obs.forEach(o => { o.x -= spd; });
      g.obs = g.obs.filter(o => o.x + OBS_W > -4);

      if (g.frame > 600 && g.frame % 280 === 0) {
        g.bolts.push({ x: CW + 4, y: Math.random() * (CH - BOLT_H - 24) + 12 });
      }
      const boltSpd = Math.min(5.5, spd + 1.5);
      g.bolts.forEach(b => { b.x -= boltSpd; });
      g.bolts = g.bolts.filter(b => b.x + BOLT_W > -4);

      for (const st of g.streaks) {
        st.x -= st.spd;
        if (st.x + st.len < 0) { st.x = CW + Math.random() * 24; st.y = Math.random() * CH; st.len = Math.random() * 38 + 10; }
      }

      g.px = Math.max(0, Math.min(CW - PW, g.px + g.vx));
      g.py = Math.max(0, Math.min(CH - PH, g.py + g.vy));

      g.trail.unshift({ x: g.px, y: g.py });
      if (g.trail.length > TRAIL_LEN) g.trail.length = TRAIL_LEN;

      let hit = false;
      for (const o of g.obs) {
        const inX = g.px + PW > o.x && g.px < o.x + OBS_W;
        if (inX && (g.py < o.topH || g.py + PH > o.topH + o.gap)) { hit = true; break; }
      }
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
        setBest(prev => { const b = Math.max(prev, s); localStorage.setItem("blockdash-best", String(b)); return b; });
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
    const g = freshGS(); g.mode = "playing";
    gsRef.current = g;
    setFinalScore(0); setScore(0); setGameMode("playing");
  }

  function handleCanvasClick() {
    const g = gsRef.current;
    if (g?.mode === "idle") { g.mode = "playing"; setGameMode("playing"); }
  }

  if (!mounted) return (
    <>
      <SEOHead meta={notFoundMeta} />
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <span style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)", margin:-1, padding:0, border:0, whiteSpace:"nowrap" }}>
          404 — Page not found. Play Block Dash while you find your way back to asamasterson.com.
        </span>
      </div>
    </>
  );

  const isOver = gameMode === "over";

  return (
    <>
      <SEOHead meta={notFoundMeta} />
      <style>{css}</style>
      <div className="nf-page">
        <Navbar />
        <div className="nf-center">

          <div className="nf-hero">
            <div className="nf-hero-top">
              <h1 className="nf-code">404</h1>
              <p className="nf-msg">page not found</p>
            </div>
            <p className="nf-desc">This page doesn't exist — but Block Dash does.<br/>Survive the void while you find your way back.</p>
          </div>

          <div className="nf-game-col">
            <div className="nf-game-header">
              <span className="nf-hint">block dash</span>
              <span className="nf-hint">
                {isOver
                  ? `score: ${finalScore} · best: ${best}`
                  : gameMode === "playing"
                    ? `score: ${score}`
                    : best > 0 ? `best: ${best}` : ""}
              </span>
            </div>
              <div className="nf-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  className="nf-canvas"
                  width={CW} height={CH}
                  onClick={handleCanvasClick}
                />
                {isOver && (
                  <div className="nf-overlay">
                    <p className="nf-ov-eye">You hit a wall</p>
                    <p className="nf-ov-head">Game over</p>
                    <p className="nf-ov-score">Score: {finalScore} · Best: {best}</p>
                    <div className="nf-ov-btns">
                      <button className="nf-btn nf-btn-solid" onClick={handlePlayAgain}>Play again</button>
                      <a className="nf-btn nf-btn-ghost" href="/">← Home</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="nf-dpad">
                <div className="nf-dp nf-dp-up"    onPointerDown={() => { btnVyRef.current = -SPD_MOVE; }} onPointerUp={() => { btnVyRef.current = 0; }} onPointerLeave={() => { btnVyRef.current = 0; }}>▲</div>
                <div className="nf-dp nf-dp-left"  onPointerDown={() => { btnVxRef.current = -SPD_MOVE; }} onPointerUp={() => { btnVxRef.current = 0; }} onPointerLeave={() => { btnVxRef.current = 0; }}>◀</div>
                <div className="nf-dp nf-dp-right" onPointerDown={() => { btnVxRef.current = SPD_MOVE;  }} onPointerUp={() => { btnVxRef.current = 0; }} onPointerLeave={() => { btnVxRef.current = 0; }}>▶</div>
                <div className="nf-dp nf-dp-down"  onPointerDown={() => { btnVyRef.current = SPD_MOVE;  }} onPointerUp={() => { btnVyRef.current = 0; }} onPointerLeave={() => { btnVyRef.current = 0; }}>▼</div>
              </div>
          </div>

        </div>
        <footer className="nf-nav-footer">
          <a className="nf-nav-link" href="/">← Home</a>
          <a className="nf-nav-link" href="/projects/">Projects & Games</a>
          <a className="nf-nav-link" href="/about/">About</a>
        </footer>
      </div>
    </>
  );
}
