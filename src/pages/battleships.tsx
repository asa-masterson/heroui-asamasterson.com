import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";

// ── Constants ──────────────────────────────────────────────────────────────────

const GRID = 10;
const TOTAL = GRID * GRID;
const AI_DELAY = 800;

const SHIP_DEFS = [
  { name: "Carrier",    size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser",    size: 3 },
  { name: "Submarine",  size: 3 },
  { name: "Destroyer",  size: 2 },
];

// ── Types ──────────────────────────────────────────────────────────────────────

type Cell = "water" | "ship" | "miss" | "hit" | "sunk";

type Phase =
  | "mode"
  // 1P
  | "1p_setup" | "1p_player" | "1p_ai" | "1p_won" | "1p_lost"
  // 2P
  | "2p_p1setup" | "2p_p2setup" | "2p_p1fire" | "2p_p2fire" | "2p_over"
  // Generic cover (pass the device in 2P)
  | "cover";

interface Ship {
  name: string;
  size: number;
  cells: number[];
  hitCount: number;
}

interface GS {
  phase: Phase;
  // P1 boards
  p1Board: Cell[];
  p1Sight: Cell[];   // P1's view of enemy waters
  p1Ships: Ship[];
  // P2 / AI boards
  p2Board: Cell[];
  p2Sight: Cell[];   // P2's view of P1's waters (2P only)
  p2Ships: Ship[];
  // Cover screen (2P pass-device)
  coverMsg: string;
  coverBtn: string;
  coverNext: Phase;
  // Stats
  shots: number;
  hits: number;
  winner: 0 | 1 | 2;
  message: string;
}

// ── Game logic ─────────────────────────────────────────────────────────────────

function placeShips(): { board: Cell[]; ships: Ship[] } {
  const board: Cell[] = Array(TOTAL).fill("water");
  const ships: Ship[] = [];
  for (const def of SHIP_DEFS) {
    let placed = false, tries = 0;
    while (!placed && tries++ < 1000) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? GRID : GRID - def.size + 1));
      const c = Math.floor(Math.random() * (horiz ? GRID - def.size + 1 : GRID));
      const cells: number[] = [];
      let ok = true;
      for (let i = 0; i < def.size; i++) {
        const idx = (r + (horiz ? 0 : i)) * GRID + (c + (horiz ? i : 0));
        if (board[idx] !== "water") { ok = false; break; }
        cells.push(idx);
      }
      if (ok) {
        cells.forEach(i => { board[i] = "ship"; });
        ships.push({ name: def.name, size: def.size, cells, hitCount: 0 });
        placed = true;
      }
    }
  }
  return { board, ships };
}

function make1P(): GS {
  const p = placeShips(), e = placeShips();
  return {
    phase: "1p_setup",
    p1Board: p.board, p1Sight: Array(TOTAL).fill("water") as Cell[], p1Ships: p.ships,
    p2Board: e.board, p2Sight: Array(TOTAL).fill("water") as Cell[], p2Ships: e.ships,
    coverMsg: "", coverBtn: "", coverNext: "mode",
    shots: 0, hits: 0, winner: 0,
    message: "Randomize your fleet, then hit Start Battle!",
  };
}

function make2P(): GS {
  const p1 = placeShips(), p2 = placeShips();
  return {
    phase: "2p_p1setup",
    p1Board: p1.board, p1Sight: Array(TOTAL).fill("water") as Cell[], p1Ships: p1.ships,
    p2Board: p2.board, p2Sight: Array(TOTAL).fill("water") as Cell[], p2Ships: p2.ships,
    coverMsg: "", coverBtn: "", coverNext: "mode",
    shots: 0, hits: 0, winner: 0,
    message: "Player 1: randomize your fleet, then hit Done!",
  };
}

// ── Fire logic (shared 1P/2P) ─────────────────────────────────────────────────

type FireResult = GS;

function applyFire(
  idx: number,
  actor: 1 | 2,   // who is firing
  prev: GS,
): FireResult {
  const isP1 = actor === 1;
  const sight  = isP1 ? [...prev.p1Sight]  : [...prev.p2Sight];
  const board  = isP1 ? [...prev.p2Board]  : [...prev.p1Board];  // opponent's board
  const ships  = isP1 ? prev.p2Ships.map(s => ({...s})) : prev.p1Ships.map(s => ({...s}));
  const shots  = prev.shots + 1;
  let   hits   = prev.hits;
  let   winner: 0 | 1 | 2 = 0;
  let   sunkName = "";
  let   isHit = false;

  const si = ships.findIndex(s => s.cells.includes(idx));
  if (si >= 0) {
    isHit = true;
    hits++;
    sight[idx] = "hit";
    board[idx] = "hit";
    ships[si].hitCount++;
    if (ships[si].hitCount >= ships[si].size) {
      ships[si].cells.forEach(c => { sight[c] = "sunk"; board[c] = "sunk"; });
      sunkName = ships[si].name;
      if (ships.every(s => s.hitCount >= s.size)) winner = actor;
    }
  } else {
    sight[idx] = "miss";
    board[idx] = "miss";
  }

  const is1P = ["1p_setup","1p_player","1p_ai","1p_won","1p_lost"].includes(prev.phase) ||
    prev.phase === "1p_setup" || prev.phase === "1p_player" || prev.phase === "1p_ai";

  // Determine next phase
  let phase: Phase;
  let message = "";
  let coverMsg = "";
  let coverBtn = "";
  let coverNext: Phase = "mode";

  if (winner) {
    if (is1P) {
      phase = actor === 1 ? "1p_won" : "1p_lost";
      message = actor === 1
        ? `Victory! You sunk all ships in ${shots} shot${shots !== 1 ? "s" : ""}!`
        : "Your fleet is destroyed. You lose!";
    } else {
      phase = "2p_over";
      message = `Player ${actor} wins! All enemy ships destroyed in ${shots} shots!`;
    }
  } else if (is1P && actor === 1) {
    phase = "1p_ai";
    message = sunkName
      ? `You sunk the enemy ${sunkName}! AI is thinking…`
      : isHit ? "Hit! AI is thinking…" : "Miss. AI is thinking…";
  } else if (!is1P) {
    // 2P — show result on cover screen
    phase = "cover";
    const resultText = winner ? `YOU WIN!`
      : sunkName ? `You sunk the enemy ${sunkName}!`
      : isHit ? "Hit!"
      : "Miss!";
    const nextPlayer = actor === 1 ? 2 : 1;
    coverMsg = `${resultText} — Now hand the device to Player ${nextPlayer}.`;
    coverBtn = `I'm Player ${nextPlayer}, I'm ready`;
    coverNext = actor === 1 ? "2p_p2fire" : "2p_p1fire";
    message = "";
  } else {
    // Should not reach here for 1P AI
    phase = "1p_ai";
    message = isHit ? "AI is thinking…" : "AI missed. Your turn!";
  }

  const result: Partial<GS> = { shots, hits, winner, message, phase, coverMsg, coverBtn, coverNext };
  if (isP1) return { ...prev, p1Sight: sight, p2Board: board, p2Ships: ships, ...result };
  else      return { ...prev, p2Sight: sight, p1Board: board, p1Ships: ships, ...result };
}

// ── AI helpers ─────────────────────────────────────────────────────────────────

function aiPickCell(fired: Set<number>, queue: number[]): number {
  while (queue.length > 0) {
    const c = queue[0];
    if (!fired.has(c)) return c;
    queue.shift();
  }
  const cands: number[] = [];
  for (let i = 0; i < TOTAL; i++)
    if (!fired.has(i) && (Math.floor(i / GRID) + (i % GRID)) % 2 === 0) cands.push(i);
  if (cands.length) return cands[Math.floor(Math.random() * cands.length)];
  for (let i = 0; i < TOTAL; i++) if (!fired.has(i)) return i;
  return 0;
}

function aiOnHit(cell: number, fired: Set<number>, queue: number[], run: number[]) {
  run.push(cell);
  if (run.length < 2) {
    const r = Math.floor(cell / GRID), c = cell % GRID;
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
      const nr = r+dr, nc = c+dc;
      if (nr>=0&&nr<GRID&&nc>=0&&nc<GRID) {
        const n = nr*GRID+nc;
        if (!fired.has(n) && !queue.includes(n)) queue.push(n);
      }
    }
    return;
  }
  const rows = run.map(h=>Math.floor(h/GRID)), cols = run.map(h=>h%GRID);
  const isH = rows.every(rr=>rr===rows[0]);
  queue.length = 0;
  if (isH) {
    const row=rows[0], minC=Math.min(...cols), maxC=Math.max(...cols);
    if (minC>0)        { const n=row*GRID+minC-1; if (!fired.has(n)) queue.push(n); }
    if (maxC<GRID-1)   { const n=row*GRID+maxC+1; if (!fired.has(n)) queue.push(n); }
  } else {
    const col=cols[0], minR=Math.min(...rows), maxR=Math.max(...rows);
    if (minR>0)        { const n=(minR-1)*GRID+col; if (!fired.has(n)) queue.push(n); }
    if (maxR<GRID-1)   { const n=(maxR+1)*GRID+col; if (!fired.has(n)) queue.push(n); }
  }
}

// ── CSS ────────────────────────────────────────────────────────────────────────

const css = `
  .bs-page { min-height:100vh; background:#0d0d0d; color:#fff; display:flex; flex-direction:column; align-items:center; }
  .bs-center { width:100%; max-width:940px; padding:1.25rem 1rem 3rem; display:flex; flex-direction:column; align-items:center; gap:1.1rem; }

  /* Mode select */
  .bs-mode { display:flex; flex-direction:column; align-items:center; gap:1.5rem; padding:3rem 1rem; width:100%; }
  .bs-mode-title { font-family:'DM Serif Display',serif; font-size:2.4rem; color:#ff54ff; margin:0; text-shadow:0 0 30px rgba(255,84,255,.4); }
  .bs-mode-sub { font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.12em; color:rgba(255,255,255,.3); text-transform:uppercase; margin:0; }
  .bs-mode-btns { display:flex; gap:1rem; flex-wrap:wrap; justify-content:center; margin-top:.5rem; }
  .bs-mode-card {
    display:flex; flex-direction:column; align-items:center; gap:.5rem;
    padding:1.5rem 2rem; border-radius:16px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,84,255,.2);
    cursor:pointer; transition:border-color .2s, transform .15s, background .2s;
    min-width:150px;
  }
  .bs-mode-card:hover { border-color:#ff54ff; background:rgba(255,84,255,.06); transform:translateY(-2px); }
  .bs-mode-icon { font-size:2rem; }
  .bs-mode-lbl { font-family:'DM Serif Display',serif; font-size:1.1rem; color:#fff; }
  .bs-mode-desc { font-family:'DM Mono',monospace; font-size:.55rem; letter-spacing:.1em; color:rgba(255,255,255,.3); text-transform:uppercase; }

  /* Cover screen */
  .bs-cover {
    min-height:70vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:1.5rem; padding:3rem 1rem; width:100%;
    background:#0d0d0d;
  }
  .bs-cover-icon { font-size:3rem; }
  .bs-cover-msg {
    font-family:'DM Mono',monospace; font-size:.85rem; letter-spacing:.06em;
    color:rgba(255,255,255,.6); text-align:center; max-width:380px; line-height:1.7;
  }
  .bs-cover-btn { font-size:.72rem !important; padding:.65rem 2rem !important; }

  /* Header */
  .bs-header { width:100%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; }
  .bs-title-wrap { display:flex; flex-direction:column; gap:2px; }
  .bs-title { font-family:'DM Serif Display',serif; font-size:1.6rem; color:#ff54ff; margin:0; text-shadow:0 0 24px rgba(255,84,255,.35); }
  .bs-who { font-family:'DM Mono',monospace; font-size:.52rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,.3); }
  .bs-stats { display:flex; gap:1.3rem; }
  .bs-stat { display:flex; flex-direction:column; align-items:flex-end; gap:1px; }
  .bs-stat-lbl { font-family:'DM Mono',monospace; font-size:.48rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,84,255,.5); }
  .bs-stat-val { font-family:'DM Mono',monospace; font-size:.9rem; color:#ff54ff; }

  /* Message */
  .bs-msg {
    font-family:'DM Mono',monospace; font-size:.68rem; letter-spacing:.07em;
    color:rgba(255,255,255,.55); text-align:center; padding:.45rem .9rem;
    background:rgba(255,255,255,.03); border-radius:8px; min-height:2rem;
    display:flex; align-items:center; justify-content:center;
    width:100%; max-width:600px; border:1px solid rgba(255,255,255,.05);
  }
  .bs-msg-win  { color:#ff54ff; border-color:rgba(255,84,255,.2); }
  .bs-msg-lose { color:#ff5050; border-color:rgba(255,50,50,.2); }
  .bs-msg-ai   { color:rgba(255,255,255,.3); font-style:italic; }

  /* Controls */
  .bs-controls { display:flex; gap:.7rem; flex-wrap:wrap; justify-content:center; min-height:2rem; }
  .bs-btn { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; border:none; border-radius:999px; padding:.48rem 1.3rem; cursor:pointer; transition:opacity .15s, transform .1s; }
  .bs-btn:hover:not(:disabled) { opacity:.85; transform:scale(1.03); }
  .bs-btn:disabled { opacity:.28; cursor:default; }
  .bs-btn-solid { background:linear-gradient(135deg,#ff54ff,#c833c8); color:#fff; }
  .bs-btn-ghost { background:transparent; color:rgba(255,84,255,.8); border:1px solid rgba(255,84,255,.3); }

  /* Arena */
  .bs-arena { display:flex; align-items:flex-start; gap:1.75rem; flex-wrap:wrap; justify-content:center; width:100%; }
  .bs-vs { font-family:'DM Serif Display',serif; font-size:1rem; color:rgba(255,84,255,.25); align-self:center; padding-top:1.5rem; }
  @media(max-width:680px) { .bs-vs { display:none; } }
  .bs-board-wrap { display:flex; flex-direction:column; align-items:center; gap:.6rem; }
  .bs-board-lbl { font-family:'DM Mono',monospace; font-size:.52rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,84,255,.55); margin:0; }

  /* Grid */
  .bs-grid { --cs:30px; display:grid; grid-template-columns:repeat(10,var(--cs)); grid-template-rows:repeat(10,var(--cs)); gap:2px; }
  @media(max-width:720px) { .bs-grid { --cs:26px; } }
  @media(max-width:560px) { .bs-grid { --cs:min(24px,calc((100vw - 5.5rem)/10)); } }
  .bs-cell { width:var(--cs); height:var(--cs); border-radius:2px; display:flex; align-items:center; justify-content:center; font-size:.55rem; font-family:'DM Mono',monospace; transition:background .1s; position:relative; user-select:none; }
  .bs-cw-p  { background:rgba(0,55,110,.38); border:1px solid rgba(0,90,160,.2); }
  .bs-cs-p  { background:rgba(255,84,255,.15); border:1px solid rgba(255,84,255,.38); }
  .bs-cw-e  { background:rgba(0,55,110,.28); border:1px solid rgba(0,90,160,.15); cursor:crosshair; }
  .bs-cw-e:hover { background:rgba(255,84,255,.12); border-color:rgba(255,84,255,.32); }
  .bs-cw-e-off { cursor:default; }
  .bs-cw-e-off:hover { background:rgba(0,55,110,.28); border-color:rgba(0,90,160,.15); }
  .bs-cm { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); cursor:default; }
  .bs-cm::after { content:''; width:4px; height:4px; border-radius:50%; background:rgba(255,255,255,.25); position:absolute; }
  .bs-ch { background:rgba(220,55,55,.42); border:1px solid rgba(255,80,80,.55); color:rgba(255,130,130,.9); cursor:default; }
  .bs-ck { background:rgba(120,0,0,.5);   border:1px solid rgba(170,0,0,.6);   color:rgba(255,90,90,.8);  cursor:default; }

  /* Fleet status */
  .bs-fleet { display:flex; flex-direction:column; gap:.38rem; width:100%; }
  .bs-fleet-hd { font-family:'DM Mono',monospace; font-size:.47rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,84,255,.4); margin:0 0 .1rem; }
  .bs-ship-row { display:flex; align-items:center; gap:.45rem; }
  .bs-ship-nm { font-family:'DM Mono',monospace; font-size:.57rem; color:rgba(255,255,255,.5); width:5.6rem; flex-shrink:0; }
  .bs-ship-nm-sunk { color:rgba(255,255,255,.18); text-decoration:line-through; }
  .bs-ship-sqs { display:flex; gap:2px; }
  .bs-sq     { width:9px; height:9px; border-radius:1px; background:rgba(255,84,255,.3); border:1px solid rgba(255,84,255,.45); }
  .bs-sq-h   { background:rgba(200,50,50,.55); border-color:rgba(255,80,80,.6); }
  .bs-sq-k   { background:rgba(90,0,0,.55);   border-color:rgba(140,0,0,.65); }
  .bs-back { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.1em; color:rgba(255,84,255,.35); text-decoration:none; text-transform:uppercase; transition:color .15s; margin-top:.75rem; }
  .bs-back:hover { color:rgba(255,84,255,.8); }
`;

// ── Component ──────────────────────────────────────────────────────────────────

export default function BattleshipsPage() {
  const [mounted, setMounted] = useState(false);
  const [gs, setGs] = useState<GS | null>(null);

  const aiShotSet = useRef<Set<number>>(new Set());
  const aiQueue   = useRef<number[]>([]);
  const aiRun     = useRef<number[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // AI turn (1P only)
  useEffect(() => {
    if (!gs || gs.phase !== "1p_ai") return;
    const t = setTimeout(() => {
      setGs(prev => {
        if (!prev || prev.phase !== "1p_ai") return prev;
        const cell = aiPickCell(aiShotSet.current, aiQueue.current);
        aiShotSet.current.add(cell);

        // AI fires at p1Board
        const board = [...prev.p1Board];
        const ships = prev.p1Ships.map(s => ({...s}));
        let phase: Phase = "1p_player";
        let message = "";

        if (prev.p1Board[cell] === "ship") {
          board[cell] = "hit";
          const si = ships.findIndex(s => s.cells.includes(cell));
          if (si >= 0) {
            ships[si].hitCount++;
            if (ships[si].hitCount >= ships[si].size) {
              ships[si].cells.forEach(c => { board[c] = "sunk"; });
              aiRun.current = []; aiQueue.current.length = 0;
              message = `AI sunk your ${ships[si].name}!`;
              if (ships.every(s => s.hitCount >= s.size)) { phase = "1p_lost"; message = "Your fleet is gone. You lose!"; }
            } else {
              aiOnHit(cell, aiShotSet.current, aiQueue.current, aiRun.current);
              message = "AI hit your ship!";
            }
          }
        } else {
          board[cell] = "miss";
          message = "AI missed — your turn!";
        }
        return { ...prev, p1Board: board, p1Ships: ships, phase, message };
      });
    }, AI_DELAY);
    return () => clearTimeout(t);
  }, [gs?.phase, gs?.shots]);

  const resetAi = useCallback(() => {
    aiShotSet.current = new Set();
    aiQueue.current   = [];
    aiRun.current     = [];
  }, []);

  const handleRandomize = useCallback(() => {
    setGs(prev => {
      if (!prev) return prev;
      if (prev.phase === "1p_setup") {
        const p = placeShips(), e = placeShips();
        return { ...prev, p1Board: p.board, p1Ships: p.ships, p2Board: e.board, p2Ships: e.ships };
      }
      if (prev.phase === "2p_p1setup") {
        const p = placeShips();
        return { ...prev, p1Board: p.board, p1Ships: p.ships };
      }
      if (prev.phase === "2p_p2setup") {
        const p = placeShips();
        return { ...prev, p2Board: p.board, p2Ships: p.ships };
      }
      return prev;
    });
  }, []);

  const handleStart = useCallback(() => {
    setGs(prev => {
      if (!prev) return prev;
      if (prev.phase === "1p_setup") {
        resetAi();
        return { ...prev, phase: "1p_player", message: "Your turn — click enemy waters to fire!" };
      }
      if (prev.phase === "2p_p1setup") {
        return {
          ...prev, phase: "cover",
          coverMsg: "Player 1 is done. Hand the device to Player 2 so they can place their fleet.",
          coverBtn: "I'm Player 2 — I'm ready",
          coverNext: "2p_p2setup",
          message: "",
        };
      }
      if (prev.phase === "2p_p2setup") {
        return {
          ...prev, phase: "cover",
          coverMsg: "All ships placed! Hand the device to Player 1 to begin the battle.",
          coverBtn: "I'm Player 1 — Let's battle!",
          coverNext: "2p_p1fire",
          message: "",
        };
      }
      return prev;
    });
  }, [resetAi]);

  const coverContinue = useCallback(() => {
    setGs(prev => {
      if (!prev || prev.phase !== "cover") return prev;
      const next = prev.coverNext;
      const msg =
        next === "2p_p2setup"  ? "Player 2: Randomize your fleet, then hit Done!" :
        next === "2p_p1fire"   ? "Player 1's turn — click enemy waters to fire!" :
        next === "2p_p2fire"   ? "Player 2's turn — click enemy waters to fire!" : "";
      return { ...prev, phase: next, message: msg };
    });
  }, []);

  const handleFire = useCallback((idx: number) => {
    setGs(prev => {
      if (!prev) return prev;
      if (prev.phase === "1p_player") {
        if (prev.p1Sight[idx] !== "water") return prev;
        return applyFire(idx, 1, { ...prev, phase: "1p_player" });
      }
      if (prev.phase === "2p_p1fire") {
        if (prev.p1Sight[idx] !== "water") return prev;
        return applyFire(idx, 1, prev);
      }
      if (prev.phase === "2p_p2fire") {
        if (prev.p2Sight[idx] !== "water") return prev;
        return applyFire(idx, 2, prev);
      }
      return prev;
    });
  }, []);

  const newGame = useCallback(() => {
    resetAi();
    setGs(prev => prev && { ...make1P(), phase: "mode" } as GS);
  }, [resetAi]);

  // ── SSR guard ──────────────────────────────────────────────────────────────────
  if (!mounted) return <><SEOHead meta={pageMeta.battleships} /></>;
  if (!gs) return null;

  // ── Derived state ──────────────────────────────────────────────────────────────
  const showingP1 = ["1p_setup","1p_player","1p_ai","1p_won","1p_lost","2p_p1setup","2p_p1fire"].includes(gs.phase);
  const homeBoard  = showingP1 ? gs.p1Board  : gs.p2Board;
  const homeSight  = showingP1 ? gs.p1Sight  : gs.p2Sight;
  const homeShips  = showingP1 ? gs.p1Ships  : gs.p2Ships;
  const enemyShips = showingP1 ? gs.p2Ships  : gs.p1Ships;
  const is1P = !gs.phase.startsWith("2p") && gs.phase !== "cover";
  const canFire = gs.phase === "1p_player" || gs.phase === "2p_p1fire" || gs.phase === "2p_p2fire";
  const isOver = gs.phase === "1p_won" || gs.phase === "1p_lost" || gs.phase === "2p_over";
  const whoLabel = gs.phase.startsWith("2p_p2") ? "Player 2" : gs.phase.startsWith("2p") ? "Player 1" : "";
  const accuracy = gs.shots > 0 ? Math.round((gs.hits / gs.shots) * 100) : 0;

  // ── Sub-components ─────────────────────────────────────────────────────────────

  function cellPClass(c: Cell) {
    if (c === "water") return "bs-cell bs-cw-p";
    if (c === "ship")  return "bs-cell bs-cs-p";
    if (c === "miss")  return "bs-cell bs-cm";
    if (c === "hit")   return "bs-cell bs-ch";
    return "bs-cell bs-ck";
  }
  function cellEClass(c: Cell) {
    if (c === "water") return `bs-cell bs-cw-e${canFire ? "" : " bs-cw-e-off"}`;
    if (c === "miss")  return "bs-cell bs-cm";
    if (c === "hit")   return "bs-cell bs-ch";
    return "bs-cell bs-ck";
  }
  function ShipList({ ships, label }: { ships: Ship[]; label: string }) {
    return (
      <div className="bs-fleet">
        <p className="bs-fleet-hd">{label}</p>
        {ships.map(ship => {
          const sunk = ship.hitCount >= ship.size;
          return (
            <div key={ship.name} className="bs-ship-row">
              <span className={`bs-ship-nm${sunk ? " bs-ship-nm-sunk" : ""}`}>{ship.name}</span>
              <div className="bs-ship-sqs">
                {Array.from({ length: ship.size }).map((_, k) => (
                  <div key={k} className={`bs-sq${sunk ? " bs-sq-k" : k < ship.hitCount ? " bs-sq-h" : ""}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────────

  // Mode selection
  if (gs.phase === "mode") {
    return (
      <>
        <SEOHead meta={pageMeta.battleships} />
        <style>{css}</style>
        <div className="bs-page">
          <Navbar />
          <div className="bs-center">
            <div className="bs-mode">
              <h1 className="bs-mode-title">BATTLESHIPS</h1>
              <p className="bs-mode-sub">Choose your battle</p>
              <div className="bs-mode-btns">
                <button className="bs-mode-card" onClick={() => setGs(make1P())}>
                  <span className="bs-mode-icon">🤖</span>
                  <span className="bs-mode-lbl">1 Player</span>
                  <span className="bs-mode-desc">vs AI</span>
                </button>
                <button className="bs-mode-card" onClick={() => setGs(make2P())}>
                  <span className="bs-mode-icon">👥</span>
                  <span className="bs-mode-lbl">2 Players</span>
                  <span className="bs-mode-desc">Pass & play</span>
                </button>
              </div>
              <a className="bs-back" href="/projects/">← Back to Projects</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Cover screen
  if (gs.phase === "cover") {
    return (
      <>
        <SEOHead meta={pageMeta.battleships} />
        <style>{css}</style>
        <div className="bs-page">
          <Navbar />
          <div className="bs-center">
            <div className="bs-cover">
              <div className="bs-cover-icon">🛡️</div>
              <p className="bs-cover-msg">{gs.coverMsg}</p>
              <button className="bs-btn bs-btn-solid bs-cover-btn" onClick={coverContinue}>
                {gs.coverBtn}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const setupPhase = gs.phase === "1p_setup" || gs.phase === "2p_p1setup" || gs.phase === "2p_p2setup";
  const startBtnLabel = gs.phase === "2p_p1setup" ? "Done — Pass to P2" : gs.phase === "2p_p2setup" ? "Done — Start Battle!" : "Start Battle";

  return (
    <>
      <SEOHead meta={pageMeta.battleships} />
      <style>{css}</style>
      <div className="bs-page">
        <Navbar />
        <div className="bs-center">

          <div className="bs-header">
            <div className="bs-title-wrap">
              <h1 className="bs-title">BATTLESHIPS</h1>
              {whoLabel && <span className="bs-who">{whoLabel}'s turn</span>}
            </div>
            <div className="bs-stats">
              <div className="bs-stat"><span className="bs-stat-lbl">Shots</span><span className="bs-stat-val">{gs.shots}</span></div>
              <div className="bs-stat"><span className="bs-stat-lbl">Hits</span><span className="bs-stat-val">{gs.hits}</span></div>
              <div className="bs-stat"><span className="bs-stat-lbl">Accuracy</span><span className="bs-stat-val">{gs.shots > 0 ? `${accuracy}%` : "--"}</span></div>
            </div>
          </div>

          <p className={`bs-msg${gs.phase === "1p_won" || gs.phase === "2p_over" ? " bs-msg-win" : gs.phase === "1p_lost" ? " bs-msg-lose" : gs.phase === "1p_ai" ? " bs-msg-ai" : ""}`}>
            {gs.message}
          </p>

          <div className="bs-controls">
            {setupPhase && (
              <>
                <button className="bs-btn bs-btn-ghost" onClick={handleRandomize}>Randomize Ships</button>
                <button className="bs-btn bs-btn-solid" onClick={handleStart}>{startBtnLabel}</button>
              </>
            )}
            {isOver && <button className="bs-btn bs-btn-solid" onClick={() => setGs(prev => prev && {...prev, phase:"mode"})}>Play Again</button>}
            {!isOver && !setupPhase && <button className="bs-btn bs-btn-ghost" onClick={newGame}>New Game</button>}
          </div>

          <div className="bs-arena">
            <div className="bs-board-wrap">
              <p className="bs-board-lbl">{is1P ? "Your Fleet" : `${showingP1 ? "Player 1" : "Player 2"}'s Fleet`}</p>
              <div className="bs-grid">
                {homeBoard.map((cell, i) => (
                  <div key={i} className={cellPClass(cell)}>{(cell==="hit"||cell==="sunk") && "×"}</div>
                ))}
              </div>
              <ShipList ships={homeShips} label="Fleet" />
            </div>

            <div className="bs-vs">VS</div>

            <div className="bs-board-wrap">
              <p className="bs-board-lbl">{is1P ? "Enemy Waters" : `${showingP1 ? "Player 2" : "Player 1"}'s Waters`}</p>
              <div className="bs-grid">
                {homeSight.map((cell, i) => (
                  <div
                    key={i}
                    className={cellEClass(cell)}
                    onClick={cell === "water" && canFire ? () => handleFire(i) : undefined}
                  >
                    {(cell==="hit"||cell==="sunk") && "×"}
                  </div>
                ))}
              </div>
              <ShipList ships={enemyShips} label="Enemy Ships" />
            </div>
          </div>

          <a className="bs-back" href="/projects/">← Back to Projects</a>
        </div>
      </div>
    </>
  );
}
