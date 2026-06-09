import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import GameStaticPreview from "@/components/GameStaticPreview";
import GameFooter from "@/components/GameFooter";
import Leaderboard, { LeaderboardSidebar } from "@/components/Leaderboard";

// ── Constants ─────────────────────────────────────────────────────
const BRAND = "#ff54ff";
const PAD = 8, GAP = 8, SLIDE_MS = 110;

// Module-level ID counter so IDs survive re-renders
let _uid = 0;
const uid = () => ++_uid;

// ── Tile model ────────────────────────────────────────────────────
interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;     // play appear animation
  isMerged: boolean;  // play pop animation (set AFTER slide completes)
  isDead: boolean;    // absorbed by merge; slide to winner pos then remove
}

type Dir = "left" | "right" | "up" | "down";

// ── Pure game logic ───────────────────────────────────────────────
function mkTile(v: number, r: number, c: number): Tile {
  return { id: uid(), value: v, row: r, col: c, isNew: true, isMerged: false, isDead: false };
}

function spawnRandom(tiles: Tile[]): Tile | null {
  const occ = new Set(tiles.filter(t => !t.isDead).map(t => `${t.row},${t.col}`));
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!occ.has(`${r},${c}`)) empty.push([r, c]);
  if (!empty.length) return null;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  return mkTile(Math.random() < 0.9 ? 2 : 4, r, c);
}

function applyDir(tiles: Tile[], dir: Dir): {
  tiles: Tile[]; pts: number; moved: boolean; mergedIds: Set<number>;
} {
  const grid: (Tile | null)[][] = Array.from({ length: 4 }, () => new Array(4).fill(null));
  tiles.filter(t => !t.isDead).forEach(t => { grid[t.row][t.col] = t; });

  const horiz = dir === "left" || dir === "right";
  const rev   = dir === "right" || dir === "down";

  const updates  = new Map<number, { row: number; col: number; value?: number }>();
  const dead     = new Set<number>();
  const mergedIds = new Set<number>();
  let pts = 0;

  for (let i = 0; i < 4; i++) {
    let line: [number, number][] = Array.from({ length: 4 }, (_, j) =>
      (horiz ? [i, j] : [j, i]) as [number, number],
    );
    if (rev) line = line.slice().reverse();

    const lineTiles = line.map(([r, c]) => grid[r][c]).filter((t): t is Tile => t !== null);
    let out = 0, j = 0;

    while (j < lineTiles.length) {
      const dst = line[out];
      const a = lineTiles[j];
      if (j + 1 < lineTiles.length && a.value === lineTiles[j + 1].value) {
        const b = lineTiles[j + 1];
        const merged = a.value * 2;
        updates.set(a.id, { row: dst[0], col: dst[1], value: merged });
        updates.set(b.id, { row: dst[0], col: dst[1] }); // slide loser to same spot
        dead.add(b.id);
        mergedIds.add(a.id);
        pts += merged;
        j += 2;
      } else {
        updates.set(a.id, { row: dst[0], col: dst[1] });
        j++;
      }
      out++;
    }
  }

  const moved =
    dead.size > 0 ||
    tiles.some(t => {
      const u = updates.get(t.id);
      return u && (u.row !== t.row || u.col !== t.col);
    });

  const next = tiles.map(t => {
    const u = updates.get(t.id);
    if (!u) return { ...t, isNew: false, isMerged: false };
    return {
      ...t,
      row: u.row, col: u.col,
      value: u.value ?? t.value,
      isNew: false, isMerged: false,   // merge pop triggers after slide
      isDead: dead.has(t.id),
    };
  });

  return { tiles: next, pts, moved, mergedIds };
}

function checkCanMove(tiles: Tile[]): boolean {
  const live = tiles.filter(t => !t.isDead);
  if (live.length < 16) return true;
  const g: number[][] = Array.from({ length: 4 }, () => new Array(4).fill(0));
  live.forEach(t => { g[t.row][t.col] = t.value; });
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const v = g[r][c];
      if (c < 3 && v === g[r][c + 1]) return true;
      if (r < 3 && v === g[r + 1][c]) return true;
    }
  return false;
}

// ── Tile visuals ──────────────────────────────────────────────────
const TIERS  = [0,2,4,8,16,32,64,128,256,512,1024,2048];
const COLORS: [string, string][] = [
  ["rgba(255,255,255,0.05)","transparent"],
  ["rgba(255,255,255,0.10)","rgba(255,255,255,0.45)"],
  ["rgba(255,255,255,0.17)","rgba(255,255,255,0.65)"],
  ["rgba(255,140,40,0.28)","#ff8c28"],
  ["rgba(255,110,20,0.40)","#ff6e14"],
  ["rgba(255,80,160,0.30)","#ff50a0"],
  ["rgba(255,84,255,0.30)",BRAND],
  ["rgba(255,84,255,0.48)",BRAND],
  ["rgba(255,84,255,0.64)",BRAND],
  ["rgba(255,84,255,0.82)","#fff"],
  ["rgba(255,84,255,0.94)","#fff"],
  [BRAND,"#fff"],
];

function tileColors(v: number): [string, string] {
  const i = TIERS.indexOf(v);
  return i >= 0 ? COLORS[i] : COLORS[COLORS.length - 1];
}

function tileFontSize(v: number, cs: number): string {
  if (v < 100)   return `${cs * 0.42}px`;
  if (v < 1000)  return `${cs * 0.33}px`;
  if (v < 10000) return `${cs * 0.26}px`;
  return `${cs * 0.21}px`;
}

// ── CSS ────────────────────────────────────────────────────────────
const css = `
  .g48-page  { display:flex; flex-direction:column; min-height:100svh; background:#0d0d0d; }
  .g48-center { flex:1; display:flex; align-items:center; justify-content:center; padding:.75rem; }
  .g48-layout { display:flex; gap:1.25rem; align-items:flex-start; justify-content:center; }
  .g48-wrap  { display:flex; flex-direction:column; align-items:center; gap:1rem;
               width:100%; max-width:460px; }
  @media (max-width:760px) { .g48-layout { flex-direction:column; align-items:center; } .lb-side { width:100%; max-width:460px; } }

  /* Header */
  .g48-header { display:flex; width:100%; align-items:flex-end;
                justify-content:space-between; gap:.75rem; }
  .g48-title  { font-family:'DM Serif Display',serif;
                font-size:clamp(2.6rem,10vw,4rem);
                color:${BRAND}; line-height:1; margin:0; }
  .g48-scores { display:flex; gap:.5rem; }
  .g48-sbox   { background:rgba(255,255,255,.05);
                border:1px solid rgba(255,255,255,.07);
                border-radius:10px; padding:.35rem .7rem;
                text-align:center; min-width:62px; }
  .g48-slabel { font-family:'DM Mono',monospace; font-size:.52rem;
                letter-spacing:.15em; text-transform:uppercase;
                color:rgba(255,255,255,.3); display:block; margin-bottom:1px; }
  .g48-sval   { font-family:'DM Mono',monospace; font-size:1rem;
                color:#fff; line-height:1; }

  /* Sub row */
  .g48-sub  { display:flex; width:100%; align-items:center;
               justify-content:space-between; gap:.5rem; }
  .g48-hint { font-family:'DM Mono',monospace; font-size:.56rem;
               letter-spacing:.06em; color:rgba(255,255,255,.18); }

  /* Board */
  .g48-board { width:100%; aspect-ratio:1;
               background:rgba(255,255,255,.03);
               border:1px solid rgba(255,84,255,.1);
               border-radius:14px; position:relative;
               touch-action:none; user-select:none; }

  /* Background cells */
  .g48-bg   { position:absolute; inset:${PAD}px;
               display:grid; grid-template-columns:repeat(4,1fr);
               gap:${GAP}px; pointer-events:none; }
  .g48-cell { border-radius:7px; background:rgba(255,255,255,.04); }

  /* Tiles */
  .g48-tile {
    position:absolute;
    border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Serif Display',serif; font-weight:bold;
    will-change:left,top;
    /* position transitions — overridden to 'none' for isNew tiles */
  }
  .g48-tile-sliding {
    transition: left ${SLIDE_MS}ms ease, top ${SLIDE_MS}ms ease;
  }

  /* Appear: scale up from nothing (position is already final) */
  .g48-tile-new {
    animation: g48appear .13s ease-out forwards;
  }
  @keyframes g48appear {
    from { transform:scale(.35); opacity:0; }
    to   { transform:scale(1);   opacity:1; }
  }

  /* Merge pop (plays after slide lands) */
  .g48-tile-merged {
    animation: g48pop .18s ease-out forwards;
    z-index:2;
  }
  @keyframes g48pop {
    0%   { transform:scale(1); }
    45%  { transform:scale(1.18); }
    100% { transform:scale(1); }
  }

  /* Overlay */
  .g48-overlay {
    position:absolute; inset:0; z-index:20; border-radius:14px;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:14px;
    background:rgba(13,13,13,.88);
  }
  .g48-ov-eye  { font-family:'DM Mono',monospace; font-size:.65rem;
                 letter-spacing:.22em; text-transform:uppercase;
                 color:${BRAND}; margin:0; }
  .g48-ov-head { font-family:'DM Serif Display',serif;
                 font-size:clamp(2rem,7vw,3.2rem);
                 color:#fff; margin:0; line-height:1; }
  .g48-ov-btns { display:flex; gap:10px; margin-top:4px; }

  /* Buttons */
  .g48-btn {
    font-family:'DM Mono',monospace; font-size:.68rem;
    letter-spacing:.12em; text-transform:uppercase;
    padding:.55rem 1.25rem; border-radius:999px; cursor:pointer;
    transition:opacity .15s;
  }
  .g48-btn:hover { opacity:.82; }
  .g48-btn-solid   { background:${BRAND}; color:#fff; border:none; }
  .g48-btn-outline { background:transparent; color:${BRAND};
                     border:1px solid rgba(255,84,255,.5); }
`;

// ── Component ─────────────────────────────────────────────────────
function initTiles(): Tile[] {
  const t1 = mkTile(Math.random() < 0.9 ? 2 : 4, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
  const t2 = spawnRandom([t1]);
  return t2 ? [t1, t2] : [t1];
}

export default function Game2048Page() {
  const [mounted, setMounted] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest]   = useState(0);
  const [won, setWon]     = useState(false);
  const [over, setOver]   = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);

  // Refs for game loop (avoid stale closures in doMove)
  const tilesRef      = useRef<Tile[]>([]);
  const animating     = useRef(false);
  const wonRef        = useRef(false);
  const overRef       = useRef(false);
  const keepRef       = useRef(false);

  // Board measurement for tile positioning
  const boardRef  = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(100);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!boardRef.current) return;
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setCellSize((w - 2 * PAD - 3 * GAP) / 4);
    });
    obs.observe(boardRef.current);
    return () => obs.disconnect();
  }, [mounted]);

  // Client-only init
  useEffect(() => {
    if (!mounted) return;
    const t = initTiles();
    tilesRef.current = t;
    setTiles(t);
    setBest(parseInt(localStorage.getItem("2048-best") || "0", 10));
  }, [mounted]);

  // Persist best
  useEffect(() => {
    if (!score) return;
    setBest(prev => {
      if (score > prev) { localStorage.setItem("2048-best", String(score)); return score; }
      return prev;
    });
  }, [score]);

  // ── Core move ─────────────────────────────────────────────────
  const doMove = useCallback((dir: Dir) => {
    if (animating.current || overRef.current || (wonRef.current && !keepRef.current)) return;

    const { tiles: moved, pts, moved: didMove, mergedIds } = applyDir(tilesRef.current, dir);
    if (!didMove) return;

    animating.current = true;
    tilesRef.current = moved;
    setTiles(moved);                                 // triggers slide transitions
    if (pts) setScore(s => s + pts);

    // After slide completes: remove losers, spawn new tile, trigger merge pop
    setTimeout(() => {
      const alive = moved
        .filter(t => !t.isDead)
        .map(t => ({ ...t, isMerged: mergedIds.has(t.id), isNew: false }));
      const spawn = spawnRandom(alive);
      const next  = spawn ? [...alive, spawn] : alive;
      tilesRef.current = next;
      setTiles(next);

      // Check game-over / win
      if (!wonRef.current && next.some(t => t.value === 2048)) {
        wonRef.current = true; setWon(true);
      }
      if (!checkCanMove(next)) { overRef.current = true; setOver(true); }

      // Clear animation flags so next move re-triggers them
      setTimeout(() => {
        const clean = tilesRef.current.map(t => ({ ...t, isNew: false, isMerged: false }));
        tilesRef.current = clean;
        setTiles(clean);
        animating.current = false;
      }, 200);
    }, SLIDE_MS + 30);
  }, []); // empty: everything accessed via refs

  // ── New game ──────────────────────────────────────────────────
  const startNew = useCallback(() => {
    const t = initTiles();
    tilesRef.current = t;
    wonRef.current   = false;
    overRef.current  = false;
    keepRef.current  = false;
    animating.current = false;
    setTiles(t); setScore(0);
    setWon(false); setOver(false); setKeepPlaying(false);
  }, []);

  // ── Keyboard ──────────────────────────────────────────────────
  useEffect(() => {
    const MAP: Record<string, Dir> = {
      ArrowLeft:"left", ArrowRight:"right", ArrowUp:"up", ArrowDown:"down",
      a:"left", d:"right", w:"up", s:"down",
      A:"left", D:"right", W:"up", S:"down",
    };
    const fn = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (MAP[e.key]) { e.preventDefault(); doMove(MAP[e.key]); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [doMove]);

  // ── Touch swipe ───────────────────────────────────────────────
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
    doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  };

  // ── Tile position helpers ─────────────────────────────────────
  const tileLeft = (c: number) => PAD + c * (cellSize + GAP);
  const tileTop  = (r: number) => PAD + r * (cellSize + GAP);

  if (!mounted) {
    return (
      <GameStaticPreview
        meta={pageMeta.game2048}
        title="2048"
        description="Slide tiles on a 4×4 grid to merge matching numbers and reach the 2048 tile. Arrow keys or WASD on desktop, swipe on mobile. Your best score is saved locally and you can submit it to the global leaderboard to compete against other players."
        tags={["1 Player", "Puzzle", "Leaderboard"]}
      />
    );
  }

  return (
    <>
      <SEOHead meta={pageMeta.game2048} />
      <style>{css}</style>
      <div className="g48-page">
        <Navbar />
        <div className="g48-center">
          <div className="g48-layout">
          <div className="g48-wrap">

            {/* Header */}
            <div className="g48-header">
              <h1 className="g48-title">2048</h1>
              <div className="g48-scores">
                <div className="g48-sbox">
                  <span className="g48-slabel">Score</span>
                  <span className="g48-sval">{score}</span>
                </div>
                <div className="g48-sbox">
                  <span className="g48-slabel">Best</span>
                  <span className="g48-sval">{best}</span>
                </div>
              </div>
            </div>

            {/* Sub row */}
            <div className="g48-sub">
              <span className="g48-hint">Arrows · WASD · Swipe</span>
              <button className="g48-btn g48-btn-outline" onClick={startNew}>New game</button>
            </div>

            {/* Board */}
            <div
              ref={boardRef}
              className="g48-board"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Static background cells */}
              <div className="g48-bg">
                {Array(16).fill(null).map((_, i) => <div key={i} className="g48-cell" />)}
              </div>

              {/* Animated tiles */}
              {tiles.map(tile => {
                const [bg, color] = tileColors(tile.value);
                const fs = tileFontSize(tile.value, cellSize);
                const glow = tile.value >= 2048
                  ? "0 0 24px rgba(255,84,255,.6)"
                  : tile.value >= 512
                    ? "0 0 12px rgba(255,84,255,.3)"
                    : undefined;
                const cls = [
                  "g48-tile",
                  tile.isNew    ? "g48-tile-new"    : "g48-tile-sliding",
                  tile.isMerged ? "g48-tile-merged"  : "",
                ].filter(Boolean).join(" ");

                return (
                  <div
                    key={tile.id}
                    className={cls}
                    style={{
                      left:       tileLeft(tile.col),
                      top:        tileTop(tile.row),
                      width:      cellSize,
                      height:     cellSize,
                      background: bg,
                      color,
                      fontSize:   fs,
                      boxShadow:  glow,
                      zIndex:     tile.isDead ? 0 : 1,
                    }}
                  >
                    {tile.value}
                  </div>
                );
              })}

              {/* Win overlay */}
              {won && !keepPlaying && (
                <div className="g48-overlay" style={{ overflowY: "auto", paddingBottom: "1rem" }}>
                  <p className="g48-ov-eye">You reached it!</p>
                  <p className="g48-ov-head">2048!</p>
                  <div className="g48-ov-btns">
                    <button className="g48-btn g48-btn-solid" onClick={() => {
                      keepRef.current = true; setKeepPlaying(true); setWon(false);
                    }}>Keep going</button>
                    <button className="g48-btn g48-btn-outline" onClick={startNew}>New game</button>
                  </div>
                  <Leaderboard game="2048" score={score} />
                </div>
              )}

              {/* Game over overlay */}
              {over && (
                <div className="g48-overlay" style={{ overflowY: "auto", paddingBottom: "1rem" }}>
                  <p className="g48-ov-eye">No moves left</p>
                  <p className="g48-ov-head">Game over</p>
                  <button className="g48-btn g48-btn-solid" onClick={startNew}>Try again</button>
                  <Leaderboard game="2048" score={score} />
                </div>
              )}
            </div>

          </div>
          <LeaderboardSidebar game="2048" />
          </div>
        </div>
        <GameFooter />
      </div>
    </>
  );
}
