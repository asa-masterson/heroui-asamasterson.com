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
type Phase = "setup" | "player" | "ai" | "won" | "lost";

interface Ship {
  name: string;
  size: number;
  cells: number[];
  hitCount: number;
}

interface GS {
  phase: Phase;
  playerBoard: Cell[];
  enemyBoard: Cell[];
  playerShips: Ship[];
  enemyShips: Ship[];
  message: string;
  shots: number;
  hits: number;
}

// ── Game logic ─────────────────────────────────────────────────────────────────

function placeShips(): { board: Cell[]; ships: Ship[] } {
  const board: Cell[] = Array(TOTAL).fill("water");
  const ships: Ship[] = [];

  for (const def of SHIP_DEFS) {
    let placed = false;
    let tries = 0;
    while (!placed && tries < 1000) {
      tries++;
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? GRID : GRID - def.size + 1));
      const c = Math.floor(Math.random() * (horiz ? GRID - def.size + 1 : GRID));
      const cells: number[] = [];
      let valid = true;

      for (let i = 0; i < def.size; i++) {
        const idx = (r + (horiz ? 0 : i)) * GRID + (c + (horiz ? i : 0));
        if (board[idx] !== "water") { valid = false; break; }
        cells.push(idx);
      }

      if (valid) {
        cells.forEach(i => { board[i] = "ship"; });
        ships.push({ name: def.name, size: def.size, cells, hitCount: 0 });
        placed = true;
      }
    }
  }

  return { board, ships };
}

function makeGame(): GS {
  const player = placeShips();
  const enemy  = placeShips();
  return {
    phase: "setup",
    playerBoard: player.board,
    enemyBoard: enemy.board.map(c => (c === "ship" ? "water" : c)) as Cell[],
    playerShips: player.ships,
    enemyShips:  enemy.ships,
    message: "Randomize your fleet, then hit Start Battle!",
    shots: 0,
    hits: 0,
  };
}

// ── AI helpers (mutate refs directly — no React state) ─────────────────────────

function aiPickCell(fired: Set<number>, queue: number[]): number {
  while (queue.length > 0) {
    const cell = queue[0];
    if (!fired.has(cell)) return cell;
    queue.shift();
  }
  // Checkerboard hunt
  const cands: number[] = [];
  for (let i = 0; i < TOTAL; i++) {
    if (!fired.has(i) && (Math.floor(i / GRID) + (i % GRID)) % 2 === 0) cands.push(i);
  }
  if (cands.length > 0) return cands[Math.floor(Math.random() * cands.length)];
  for (let i = 0; i < TOTAL; i++) if (!fired.has(i)) return i;
  return 0;
}

function aiOnHit(cell: number, fired: Set<number>, queue: number[], run: number[]) {
  run.push(cell);

  if (run.length < 2) {
    // First hit — probe all four directions
    const r = Math.floor(cell / GRID), c = cell % GRID;
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID) {
        const n = nr * GRID + nc;
        if (!fired.has(n) && !queue.includes(n)) queue.push(n);
      }
    }
    return;
  }

  // 2+ hits — lock onto the axis and extend both ends
  const rows = run.map(h => Math.floor(h / GRID));
  const cols = run.map(h => h % GRID);
  const isH  = rows.every(rr => rr === rows[0]);
  queue.length = 0;

  if (isH) {
    const row = rows[0];
    const minC = Math.min(...cols), maxC = Math.max(...cols);
    if (minC > 0)       { const n = row * GRID + minC - 1; if (!fired.has(n)) queue.push(n); }
    if (maxC < GRID - 1){ const n = row * GRID + maxC + 1; if (!fired.has(n)) queue.push(n); }
  } else {
    const col = cols[0];
    const minR = Math.min(...rows), maxR = Math.max(...rows);
    if (minR > 0)       { const n = (minR - 1) * GRID + col; if (!fired.has(n)) queue.push(n); }
    if (maxR < GRID - 1){ const n = (maxR + 1) * GRID + col; if (!fired.has(n)) queue.push(n); }
  }
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
  .bs-page {
    min-height: 100vh;
    background: #0d0d0d;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bs-center {
    width: 100%;
    max-width: 940px;
    padding: 1.25rem 1rem 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.1rem;
  }

  /* ── Header ── */
  .bs-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: .75rem;
  }
  .bs-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem;
    color: #ff54ff;
    margin: 0;
    text-shadow: 0 0 24px rgba(255,84,255,.35);
    letter-spacing: .04em;
  }
  .bs-stats {
    display: flex;
    gap: 1.3rem;
  }
  .bs-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
  .bs-stat-lbl {
    font-family: 'DM Mono', monospace;
    font-size: .48rem;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: rgba(255,84,255,.5);
  }
  .bs-stat-val {
    font-family: 'DM Mono', monospace;
    font-size: .9rem;
    color: #ff54ff;
  }

  /* ── Message ── */
  .bs-msg {
    font-family: 'DM Mono', monospace;
    font-size: .68rem;
    letter-spacing: .07em;
    color: rgba(255,255,255,.55);
    text-align: center;
    padding: .45rem .9rem;
    background: rgba(255,255,255,.03);
    border-radius: 8px;
    min-height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 600px;
    border: 1px solid rgba(255,255,255,.05);
  }
  .bs-msg-win  { color: #ff54ff; border-color: rgba(255,84,255,.2); }
  .bs-msg-lose { color: #ff5050; border-color: rgba(255,50,50,.2); }
  .bs-msg-ai   { color: rgba(255,255,255,.35); font-style: italic; }

  /* ── Controls ── */
  .bs-controls {
    display: flex;
    gap: .7rem;
    flex-wrap: wrap;
    justify-content: center;
    min-height: 2rem;
  }
  .bs-btn {
    font-family: 'DM Mono', monospace;
    font-size: .6rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    border: none;
    border-radius: 999px;
    padding: .48rem 1.3rem;
    cursor: pointer;
    transition: opacity .15s, transform .1s;
  }
  .bs-btn:hover:not(:disabled) { opacity: .85; transform: scale(1.03); }
  .bs-btn:disabled { opacity: .28; cursor: default; }
  .bs-btn-solid { background: linear-gradient(135deg,#ff54ff,#c833c8); color: #fff; }
  .bs-btn-ghost {
    background: transparent;
    color: rgba(255,84,255,.8);
    border: 1px solid rgba(255,84,255,.3);
  }

  /* ── Arena ── */
  .bs-arena {
    display: flex;
    align-items: flex-start;
    gap: 1.75rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  .bs-vs {
    font-family: 'DM Serif Display', serif;
    font-size: 1rem;
    color: rgba(255,84,255,.25);
    align-self: center;
    padding-top: 1.5rem;
  }
  @media (max-width: 680px) { .bs-vs { display: none; } }

  .bs-board-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .6rem;
  }
  .bs-board-lbl {
    font-family: 'DM Mono', monospace;
    font-size: .52rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: rgba(255,84,255,.55);
    margin: 0;
  }

  /* ── Grid ── */
  .bs-grid {
    --cs: 30px;
    display: grid;
    grid-template-columns: repeat(10, var(--cs));
    grid-template-rows:    repeat(10, var(--cs));
    gap: 2px;
  }
  @media (max-width: 720px) { .bs-grid { --cs: 26px; } }
  @media (max-width: 560px) { .bs-grid { --cs: min(24px, calc((100vw - 5.5rem) / 10)); } }

  .bs-cell {
    width: var(--cs);
    height: var(--cs);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .55rem;
    font-family: 'DM Mono', monospace;
    transition: background .1s, border-color .1s;
    position: relative;
    user-select: none;
  }

  /* Player board cells */
  .bs-cw-p  { background: rgba(0,55,110,.38); border: 1px solid rgba(0,90,160,.2); }
  .bs-cs-p  { background: rgba(255,84,255,.15); border: 1px solid rgba(255,84,255,.38); }

  /* Enemy board cells */
  .bs-cw-e {
    background: rgba(0,55,110,.28);
    border: 1px solid rgba(0,90,160,.15);
    cursor: crosshair;
  }
  .bs-cw-e:hover { background: rgba(255,84,255,.12); border-color: rgba(255,84,255,.32); }
  .bs-cw-e-off { cursor: default; }
  .bs-cw-e-off:hover { background: rgba(0,55,110,.28); border-color: rgba(0,90,160,.15); }

  /* Shared shot states */
  .bs-cm { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); cursor: default; }
  .bs-cm::after {
    content: '';
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(255,255,255,.25);
    position: absolute;
  }
  .bs-ch { background: rgba(220,55,55,.42); border: 1px solid rgba(255,80,80,.55); color: rgba(255,130,130,.9); cursor: default; }
  .bs-ck { background: rgba(120,0,0,.5);   border: 1px solid rgba(170,0,0,.6);    color: rgba(255,90,90,.8);  cursor: default; }

  /* ── Fleet status ── */
  .bs-fleet {
    display: flex;
    flex-direction: column;
    gap: .38rem;
    width: 100%;
  }
  .bs-fleet-hd {
    font-family: 'DM Mono', monospace;
    font-size: .47rem;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: rgba(255,84,255,.4);
    margin: 0 0 .1rem;
  }
  .bs-ship-row {
    display: flex;
    align-items: center;
    gap: .45rem;
  }
  .bs-ship-nm {
    font-family: 'DM Mono', monospace;
    font-size: .57rem;
    color: rgba(255,255,255,.5);
    width: 5.6rem;
    flex-shrink: 0;
  }
  .bs-ship-nm-sunk { color: rgba(255,255,255,.18); text-decoration: line-through; }
  .bs-ship-sqs { display: flex; gap: 2px; }
  .bs-sq {
    width: 9px; height: 9px; border-radius: 1px;
    background: rgba(255,84,255,.3);
    border: 1px solid rgba(255,84,255,.45);
  }
  .bs-sq-h { background: rgba(200,50,50,.55); border-color: rgba(255,80,80,.6); }
  .bs-sq-k { background: rgba(90,0,0,.55);  border-color: rgba(140,0,0,.65); }

  /* ── Back link ── */
  .bs-back {
    font-family: 'DM Mono', monospace;
    font-size: .58rem;
    letter-spacing: .1em;
    color: rgba(255,84,255,.35);
    text-decoration: none;
    text-transform: uppercase;
    transition: color .15s;
    margin-top: .75rem;
  }
  .bs-back:hover { color: rgba(255,84,255,.8); }
`;

// ── Component ──────────────────────────────────────────────────────────────────

export default function BattleshipsPage() {
  const [mounted, setMounted] = useState(false);
  const [gs, setGs] = useState<GS | null>(null);

  // AI state lives in refs — no re-render needed, reset on new game
  const aiShotSet = useRef<Set<number>>(new Set());
  const aiQueue   = useRef<number[]>([]);
  const aiRun     = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
    setGs(makeGame());
  }, []);

  // AI turn — fires after AI_DELAY ms whenever phase is "ai"
  useEffect(() => {
    if (!gs || gs.phase !== "ai") return;

    const timer = setTimeout(() => {
      setGs(prev => {
        if (!prev || prev.phase !== "ai") return prev;

        const cell = aiPickCell(aiShotSet.current, aiQueue.current);
        aiShotSet.current.add(cell);

        const board = [...prev.playerBoard];
        const ships = prev.playerShips.map(s => ({ ...s }));
        let phase: Phase = "player";
        let message = "";

        if (prev.playerBoard[cell] === "ship") {
          board[cell] = "hit";

          const si = ships.findIndex(s => s.cells.includes(cell));
          if (si >= 0) {
            ships[si].hitCount++;
            const ship = ships[si];

            if (ship.hitCount >= ship.size) {
              ship.cells.forEach(c => { board[c] = "sunk"; });
              aiRun.current   = [];
              aiQueue.current.length = 0;
              message = `AI sunk your ${ship.name}!`;
              if (ships.every(s => s.hitCount >= s.size)) {
                phase   = "lost";
                message = "Your entire fleet is gone. Better luck next time!";
              }
            } else {
              aiOnHit(cell, aiShotSet.current, aiQueue.current, aiRun.current);
              message = "AI hit your ship!";
            }
          }
        } else {
          board[cell] = "miss";
          message = "AI missed — your turn!";
        }

        return { ...prev, playerBoard: board, playerShips: ships, phase, message };
      });
    }, AI_DELAY);

    return () => clearTimeout(timer);
  }, [gs?.phase, gs?.shots]);

  const resetAi = useCallback(() => {
    aiShotSet.current = new Set();
    aiQueue.current   = [];
    aiRun.current     = [];
  }, []);

  const randomize = useCallback(() => {
    setGs(prev => {
      if (!prev || prev.phase !== "setup") return prev;
      const player = placeShips();
      const enemy  = placeShips();
      return {
        ...prev,
        playerBoard: player.board,
        playerShips: player.ships,
        enemyBoard: enemy.board.map(c => (c === "ship" ? "water" : c)) as Cell[],
        enemyShips:  enemy.ships,
      };
    });
  }, []);

  const startGame = useCallback(() => {
    resetAi();
    setGs(prev => prev && ({
      ...prev,
      phase: "player",
      message: "Your turn — click enemy waters to fire!",
    }));
  }, [resetAi]);

  const newGame = useCallback(() => {
    resetAi();
    setGs(makeGame());
  }, [resetAi]);

  const handleFire = useCallback((idx: number) => {
    setGs(prev => {
      if (!prev || prev.phase !== "player") return prev;
      if (prev.enemyBoard[idx] !== "water") return prev;

      const board = [...prev.enemyBoard];
      const ships = prev.enemyShips.map(s => ({ ...s }));
      const shots = prev.shots + 1;
      let hits = prev.hits;
      let phase: Phase = "ai";
      let message = "";

      const si = ships.findIndex(s => s.cells.includes(idx));
      if (si >= 0) {
        hits++;
        board[idx] = "hit";
        ships[si].hitCount++;
        const ship = ships[si];

        if (ship.hitCount >= ship.size) {
          ship.cells.forEach(c => { board[c] = "sunk"; });
          if (ships.every(s => s.hitCount >= s.size)) {
            phase   = "won";
            message = `Victory! All ships sunk in ${shots} shot${shots !== 1 ? "s" : ""}!`;
          } else {
            message = `You sunk the enemy ${ship.name}! AI is thinking…`;
          }
        } else {
          message = "Hit! AI is thinking…";
        }
      } else {
        board[idx] = "miss";
        message = "Miss. AI is thinking…";
      }

      return { ...prev, enemyBoard: board, enemyShips: ships, shots, hits, phase, message };
    });
  }, []);

  // ── SSR guard ──────────────────────────────────────────────────────────────────

  if (!mounted) {
    return <><SEOHead meta={pageMeta.battleships} /></>;
  }
  if (!gs) return null;

  const canFire = gs.phase === "player";
  const isOver  = gs.phase === "won" || gs.phase === "lost";
  const accuracy = gs.shots > 0 ? Math.round((gs.hits / gs.shots) * 100) : 0;

  // ── Helpers to render a cell ───────────────────────────────────────────────────

  function playerCellClass(cell: Cell): string {
    if (cell === "water") return "bs-cell bs-cw-p";
    if (cell === "ship")  return "bs-cell bs-cs-p";
    if (cell === "miss")  return "bs-cell bs-cm";
    if (cell === "hit")   return "bs-cell bs-ch";
    return "bs-cell bs-ck";
  }

  function enemyCellClass(cell: Cell): string {
    if (cell === "water") return `bs-cell bs-cw-e${canFire ? "" : " bs-cw-e-off"}`;
    if (cell === "miss")  return "bs-cell bs-cm";
    if (cell === "hit")   return "bs-cell bs-ch";
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
                  <div
                    key={k}
                    className={`bs-sq${sunk ? " bs-sq-k" : k < ship.hitCount ? " bs-sq-h" : ""}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <>
      <SEOHead meta={pageMeta.battleships} />
      <style>{css}</style>
      <div className="bs-page">
        <Navbar />
        <div className="bs-center">

          <div className="bs-header">
            <h1 className="bs-title">BATTLESHIPS</h1>
            <div className="bs-stats">
              <div className="bs-stat">
                <span className="bs-stat-lbl">Shots</span>
                <span className="bs-stat-val">{gs.shots}</span>
              </div>
              <div className="bs-stat">
                <span className="bs-stat-lbl">Hits</span>
                <span className="bs-stat-val">{gs.hits}</span>
              </div>
              <div className="bs-stat">
                <span className="bs-stat-lbl">Accuracy</span>
                <span className="bs-stat-val">{gs.shots > 0 ? `${accuracy}%` : "--"}</span>
              </div>
            </div>
          </div>

          <p className={`bs-msg${gs.phase === "won" ? " bs-msg-win" : gs.phase === "lost" ? " bs-msg-lose" : gs.phase === "ai" ? " bs-msg-ai" : ""}`}>
            {gs.message}
          </p>

          <div className="bs-controls">
            {gs.phase === "setup" && (
              <>
                <button className="bs-btn bs-btn-ghost" onClick={randomize}>Randomize Ships</button>
                <button className="bs-btn bs-btn-solid" onClick={startGame}>Start Battle</button>
              </>
            )}
            {isOver && (
              <button className="bs-btn bs-btn-solid" onClick={newGame}>Play Again</button>
            )}
            {!isOver && gs.phase !== "setup" && (
              <button className="bs-btn bs-btn-ghost" onClick={newGame}>New Game</button>
            )}
          </div>

          <div className="bs-arena">
            {/* Player board */}
            <div className="bs-board-wrap">
              <p className="bs-board-lbl">Your Fleet</p>
              <div className="bs-grid">
                {gs.playerBoard.map((cell, i) => (
                  <div key={i} className={playerCellClass(cell)}>
                    {(cell === "hit" || cell === "sunk") && "×"}
                  </div>
                ))}
              </div>
              <ShipList ships={gs.playerShips} label="Fleet" />
            </div>

            <div className="bs-vs">VS</div>

            {/* Enemy board */}
            <div className="bs-board-wrap">
              <p className="bs-board-lbl">Enemy Waters</p>
              <div className="bs-grid">
                {gs.enemyBoard.map((cell, i) => (
                  <div
                    key={i}
                    className={enemyCellClass(cell)}
                    onClick={cell === "water" && canFire ? () => handleFire(i) : undefined}
                  >
                    {(cell === "hit" || cell === "sunk") && "×"}
                  </div>
                ))}
              </div>
              <ShipList ships={gs.enemyShips} label="Enemy Ships" />
            </div>
          </div>

          <a className="bs-back" href="/projects/">← Back to Projects</a>
        </div>
      </div>
    </>
  );
}
