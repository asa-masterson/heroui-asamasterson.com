import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";

// ── Constants ──────────────────────────────────────────────────────────────────

const DOTS   = 6;   // 6×6 dots = 5×5 boxes
const BOXES  = 5;
const DS     = 60;  // px between adjacent dots
const PAD    = 30;  // padding around grid
const SVG_W  = (DOTS - 1) * DS + 2 * PAD; // 360
const DOT_R  = 5;
const LINE_W = 5;
const HIT    = 22;  // clickable area around each line
const AI_DELAY = 500;

const P1_COL = "#ff54ff";
const P2_COL = "#00e5ff";

function dx(c: number) { return c * DS + PAD; }
function dy(r: number) { return r * DS + PAD; }

// ── Types ──────────────────────────────────────────────────────────────────────

type Owner  = 0 | 1 | 2;  // 0=unclaimed
type Phase  = "playing" | "ai" | "done";

interface DBGS {
  mode:   "1p" | "2p";
  phase:  Phase;
  hLines: Owner[][];  // [DOTS][BOXES]  — top/bottom of each box row
  vLines: Owner[][];  // [BOXES][DOTS]  — left/right of each box col
  boxes:  Owner[][];  // [BOXES][BOXES]
  turn:   1 | 2;
  p1Score: number;
  p2Score: number;
  turnKey: number;    // increments every move — stable AI dep trigger
  message: string;
}

// ── Game logic ─────────────────────────────────────────────────────────────────

function makeGame(mode: "1p" | "2p"): DBGS {
  return {
    mode, phase: "playing", turn: 1,
    hLines: Array.from({ length: DOTS  }, () => Array(BOXES).fill(0)),
    vLines: Array.from({ length: BOXES }, () => Array(DOTS ).fill(0)),
    boxes:  Array.from({ length: BOXES }, () => Array(BOXES).fill(0)),
    p1Score: 0, p2Score: 0, turnKey: 0,
    message: mode === "1p" ? "Your turn — click a line to draw it." : "Player 1's turn.",
  };
}

function countSides(r: number, c: number, hL: Owner[][], vL: Owner[][]): number {
  return (hL[r][c] ? 1:0) + (hL[r+1][c] ? 1:0) + (vL[r][c] ? 1:0) + (vL[r][c+1] ? 1:0);
}

function checkBox(r: number, c: number, hL: Owner[][], vL: Owner[][]): boolean {
  return !!(hL[r][c] && hL[r+1][c] && vL[r][c] && vL[r][c+1]);
}

function applyMove(gs: DBGS, type: "h" | "v", r: number, c: number, player: 1 | 2): DBGS {
  const hL = gs.hLines.map(row => [...row]);
  const vL = gs.vLines.map(row => [...row]);
  const bx = gs.boxes.map(row => [...row]);

  if (type === "h") hL[r][c] = player;
  else              vL[r][c] = player;

  // Check adjacent boxes
  let scored = 0;
  const adj: [number,number][] = type === "h" ? [[r-1,c],[r,c]] : [[r,c-1],[r,c]];
  for (const [br,bc] of adj) {
    if (br >= 0 && br < BOXES && bc >= 0 && bc < BOXES && !bx[br][bc] && checkBox(br, bc, hL, vL)) {
      bx[br][bc] = player;
      scored++;
    }
  }

  const p1Score = gs.p1Score + (player === 1 ? scored : 0);
  const p2Score = gs.p2Score + (player === 2 ? scored : 0);

  const totalBoxes = bx.reduce((s, row) => s + row.filter(b => b !== 0).length, 0);
  const done = totalBoxes === BOXES * BOXES;

  const nextTurn: 1 | 2 = scored > 0 ? player : (player === 1 ? 2 : 1);
  const phase: Phase = done ? "done" : (gs.mode === "1p" && nextTurn === 2) ? "ai" : "playing";

  let message = "";
  if (done) {
    if (p1Score > p2Score) message = gs.mode === "1p" ? "You win! Well played." : "Player 1 wins!";
    else if (p2Score > p1Score) message = gs.mode === "1p" ? "AI wins!" : "Player 2 wins!";
    else message = "It's a draw!";
  } else if (scored > 0) {
    const s = scored > 1 ? "es" : "";
    if (player === 1) message = `You claimed ${scored} box${s}! Go again.`;
    else message = gs.mode === "1p"
      ? `AI claimed ${scored} box${s}.`
      : `Player 2 claimed ${scored} box${s}! Go again.`;
  } else {
    message = nextTurn === 1
      ? (gs.mode === "1p" ? "Your turn." : "Player 1's turn.")
      : (gs.mode === "1p" ? "AI is thinking…" : "Player 2's turn.");
  }

  return { ...gs, hLines: hL, vLines: vL, boxes: bx, p1Score, p2Score, turn: nextTurn, phase, message, turnKey: gs.turnKey + 1 };
}

// ── AI ─────────────────────────────────────────────────────────────────────────

type Line = { type: "h"|"v"; r: number; c: number };

function getAllUnplayed(hL: Owner[][], vL: Owner[][]): Line[] {
  const out: Line[] = [];
  for (let r=0;r<DOTS;r++) for (let c=0;c<BOXES;c++) if (!hL[r][c]) out.push({type:"h",r,c});
  for (let r=0;r<BOXES;r++) for (let c=0;c<DOTS;c++) if (!vL[r][c]) out.push({type:"v",r,c});
  return out;
}

function wouldCreate3(type:"h"|"v", r:number, c:number, hL:Owner[][], vL:Owner[][], bx:Owner[][]): boolean {
  const hT = hL.map(row=>[...row]), vT = vL.map(row=>[...row]);
  if (type==="h") hT[r][c]=2; else vT[r][c]=2;
  const adj: [number,number][] = type==="h" ? [[r-1,c],[r,c]] : [[r,c-1],[r,c]];
  for (const [br,bc] of adj)
    if (br>=0&&br<BOXES&&bc>=0&&bc<BOXES&&!bx[br][bc]&&countSides(br,bc,hT,vT)===3) return true;
  return false;
}

function aiMove(hL: Owner[][], vL: Owner[][], bx: Owner[][]): Line {
  // 1. Complete any 3-sided box
  for (let r=0;r<BOXES;r++) for (let c=0;c<BOXES;c++) {
    if (!bx[r][c] && countSides(r,c,hL,vL)===3) {
      if (!hL[r][c])   return {type:"h",r,c};
      if (!hL[r+1][c]) return {type:"h",r:r+1,c};
      if (!vL[r][c])   return {type:"v",r,c};
                       return {type:"v",r,c:c+1};
    }
  }
  // 2. Safe: won't create a 3-sided box for opponent
  const all = getAllUnplayed(hL, vL);
  const safe = all.filter(m => !wouldCreate3(m.type, m.r, m.c, hL, vL, bx));
  if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];
  // 3. Forced — pick the shortest chain to sacrifice
  return all[Math.floor(Math.random() * all.length)];
}

// ── CSS ────────────────────────────────────────────────────────────────────────

const css = `
  .db-page { min-height:100vh; background:#0d0d0d; color:#fff; display:flex; flex-direction:column; align-items:center; }
  .db-center { width:100%; max-width:700px; padding:1.25rem 1rem 3rem; display:flex; flex-direction:column; align-items:center; gap:1.1rem; }

  /* Mode select */
  .db-mode { display:flex; flex-direction:column; align-items:center; gap:1.5rem; padding:3rem 1rem; width:100%; }
  .db-mode-title { font-family:'DM Serif Display',serif; font-size:2.2rem; color:#ff54ff; margin:0; text-shadow:0 0 28px rgba(255,84,255,.4); }
  .db-mode-sub { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.14em; color:rgba(255,255,255,.25); text-transform:uppercase; margin:0; }
  .db-mode-btns { display:flex; gap:1rem; flex-wrap:wrap; justify-content:center; }
  .db-mode-card { display:flex; flex-direction:column; align-items:center; gap:.5rem; padding:1.5rem 2rem; border-radius:16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,84,255,.2); cursor:pointer; transition:border-color .2s, transform .15s, background .2s; min-width:150px; }
  .db-mode-card:hover { border-color:#ff54ff; background:rgba(255,84,255,.06); transform:translateY(-2px); }
  .db-mode-icon { font-size:2rem; }
  .db-mode-lbl { font-family:'DM Serif Display',serif; font-size:1.1rem; color:#fff; }
  .db-mode-desc { font-family:'DM Mono',monospace; font-size:.55rem; letter-spacing:.1em; color:rgba(255,255,255,.3); text-transform:uppercase; }

  /* Header */
  .db-header { width:100%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; }
  .db-title { font-family:'DM Serif Display',serif; font-size:1.6rem; color:#ff54ff; margin:0; text-shadow:0 0 24px rgba(255,84,255,.35); }
  .db-scoreboard { display:flex; gap:1.2rem; }
  .db-score-box { display:flex; flex-direction:column; align-items:center; gap:2px; padding:.4rem .8rem; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); min-width:60px; }
  .db-score-box-active { border-color:rgba(255,84,255,.4); background:rgba(255,84,255,.05); }
  .db-score-lbl { font-family:'DM Mono',monospace; font-size:.48rem; letter-spacing:.16em; text-transform:uppercase; }
  .db-score-val { font-family:'DM Mono',monospace; font-size:1.1rem; }
  .db-p1 { color:${P1_COL}; }
  .db-p2 { color:${P2_COL}; }

  /* Message */
  .db-msg { font-family:'DM Mono',monospace; font-size:.68rem; letter-spacing:.07em; color:rgba(255,255,255,.5); text-align:center; padding:.45rem .9rem; background:rgba(255,255,255,.03); border-radius:8px; min-height:2rem; display:flex; align-items:center; justify-content:center; width:100%; max-width:500px; border:1px solid rgba(255,255,255,.05); }
  .db-msg-win { color:#ff54ff; border-color:rgba(255,84,255,.2); }

  /* Grid wrapper */
  .db-grid-wrap { display:flex; justify-content:center; width:100%; }
  .db-svg { overflow:visible; display:block; max-width:100%; height:auto; touch-action:none; }

  /* Controls */
  .db-controls { display:flex; gap:.7rem; flex-wrap:wrap; justify-content:center; }
  .db-btn { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; border:none; border-radius:999px; padding:.48rem 1.3rem; cursor:pointer; transition:opacity .15s, transform .1s; }
  .db-btn:hover { opacity:.85; transform:scale(1.03); }
  .db-btn-solid { background:linear-gradient(135deg,#ff54ff,#c833c8); color:#fff; }
  .db-btn-ghost { background:transparent; color:rgba(255,84,255,.8); border:1px solid rgba(255,84,255,.3); }

  /* Legend */
  .db-legend { display:flex; gap:1.2rem; flex-wrap:wrap; justify-content:center; }
  .db-legend-item { display:flex; align-items:center; gap:.4rem; font-family:'DM Mono',monospace; font-size:.55rem; letter-spacing:.1em; color:rgba(255,255,255,.35); text-transform:uppercase; }
  .db-legend-dot { width:10px; height:10px; border-radius:50%; }

  .db-back { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.1em; color:rgba(255,84,255,.35); text-decoration:none; text-transform:uppercase; transition:color .15s; margin-top:.75rem; }
  .db-back:hover { color:rgba(255,84,255,.8); }
`;

// ── Component ──────────────────────────────────────────────────────────────────

export default function DotsBoxesPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"select" | "1p" | "2p">("select");
  const [gs, setGs] = useState<DBGS | null>(null);
  const [hov, setHov] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // AI turn
  useEffect(() => {
    if (!gs || gs.phase !== "ai") return;
    const t = setTimeout(() => {
      setGs(prev => {
        if (!prev || prev.phase !== "ai") return prev;
        const m = aiMove(prev.hLines, prev.vLines, prev.boxes);
        return applyMove(prev, m.type, m.r, m.c, 2);
      });
    }, AI_DELAY);
    return () => clearTimeout(t);
  }, [gs?.phase, gs?.turnKey]);

  const startGame = useCallback((m: "1p" | "2p") => {
    setMode(m);
    setGs(makeGame(m));
  }, []);

  const rematch = useCallback(() => {
    setGs(gs ? makeGame(gs.mode) : null);
  }, [gs]);

  const handleLine = useCallback((type: "h"|"v", r: number, c: number) => {
    setGs(prev => {
      if (!prev || prev.phase !== "playing") return prev;
      const line = type === "h" ? prev.hLines[r][c] : prev.vLines[r][c];
      if (line !== 0) return prev;
      return applyMove(prev, type, r, c, prev.turn);
    });
  }, []);

  if (!mounted) return <><SEOHead meta={pageMeta.dotsboxes} /></>;

  // Mode selection
  if (mode === "select" || !gs) {
    return (
      <>
        <SEOHead meta={pageMeta.dotsboxes} />
        <style>{css}</style>
        <div className="db-page">
          <Navbar />
          <div className="db-center">
            <div className="db-mode">
              <h1 className="db-mode-title">DOTS & BOXES</h1>
              <p className="db-mode-sub">Choose your game</p>
              <div className="db-mode-btns">
                <button className="db-mode-card" onClick={() => startGame("1p")}>
                  <span className="db-mode-icon">🤖</span>
                  <span className="db-mode-lbl">1 Player</span>
                  <span className="db-mode-desc">vs AI</span>
                </button>
                <button className="db-mode-card" onClick={() => startGame("2p")}>
                  <span className="db-mode-icon">👥</span>
                  <span className="db-mode-lbl">2 Players</span>
                  <span className="db-mode-desc">Same screen</span>
                </button>
              </div>
              <a className="db-back" href="/projects/">← Back to Projects</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  const canPlay = gs.phase === "playing";
  const p1Active = gs.turn === 1 && canPlay;
  const p2Active = gs.turn === 2 && canPlay;
  const currentCol = gs.turn === 1 ? P1_COL : P2_COL;
  const aiThinking = gs.phase === "ai";

  // ── SVG grid renderer ─────────────────────────────────────────────────────────

  const lineColor = (owner: Owner) =>
    owner === 1 ? P1_COL : owner === 2 ? P2_COL : "rgba(255,255,255,.1)";

  const boxColor = (owner: Owner) =>
    owner === 1 ? "rgba(255,84,255,.18)" : owner === 2 ? "rgba(0,229,255,.15)" : "transparent";

  function HLine({ r, c }: { r:number; c:number }) {
    const key = `h_${r}_${c}`;
    const owner = gs!.hLines[r][c];
    const hovered = hov === key && canPlay && !owner;
    const x1 = dx(c) + DOT_R, y1 = dy(r), x2 = dx(c+1) - DOT_R, y2 = dy(r);
    const col = hovered ? currentCol : lineColor(owner);
    const opacity = owner ? 1 : hovered ? 0.7 : 0;
    return (
      <g
        style={{ cursor: canPlay && !owner ? "pointer" : "default" }}
        onClick={() => handleLine("h", r, c)}
        onMouseEnter={() => setHov(key)}
        onMouseLeave={() => setHov(null)}
      >
        <rect
          x={dx(c)} y={dy(r) - HIT/2}
          width={DS} height={HIT}
          fill="transparent"
        />
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={col}
          strokeWidth={LINE_W}
          strokeLinecap="round"
          opacity={opacity || (owner ? 1 : 0.12)}
        />
      </g>
    );
  }

  function VLine({ r, c }: { r:number; c:number }) {
    const key = `v_${r}_${c}`;
    const owner = gs!.vLines[r][c];
    const hovered = hov === key && canPlay && !owner;
    const x1 = dx(c), y1 = dy(r) + DOT_R, x2 = dx(c), y2 = dy(r+1) - DOT_R;
    const col = hovered ? currentCol : lineColor(owner);
    const opacity = owner ? 1 : hovered ? 0.7 : 0;
    return (
      <g
        style={{ cursor: canPlay && !owner ? "pointer" : "default" }}
        onClick={() => handleLine("v", r, c)}
        onMouseEnter={() => setHov(key)}
        onMouseLeave={() => setHov(null)}
      >
        <rect
          x={dx(c) - HIT/2} y={dy(r)}
          width={HIT} height={DS}
          fill="transparent"
        />
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={col}
          strokeWidth={LINE_W}
          strokeLinecap="round"
          opacity={opacity || (owner ? 1 : 0.12)}
        />
      </g>
    );
  }

  return (
    <>
      <SEOHead meta={pageMeta.dotsboxes} />
      <style>{css}</style>
      <div className="db-page">
        <Navbar />
        <div className="db-center">

          <div className="db-header">
            <h1 className="db-title">DOTS &amp; BOXES</h1>
            <div className="db-scoreboard">
              <div className={`db-score-box${p1Active ? " db-score-box-active" : ""}`}>
                <span className="db-score-lbl db-p1">{gs.mode === "1p" ? "You" : "P1"}</span>
                <span className="db-score-val db-p1">{gs.p1Score}</span>
              </div>
              <div className={`db-score-box${p2Active || aiThinking ? " db-score-box-active" : ""}`}>
                <span className="db-score-lbl db-p2">{gs.mode === "1p" ? "AI" : "P2"}</span>
                <span className="db-score-val db-p2">{gs.p2Score}</span>
              </div>
            </div>
          </div>

          <p className={`db-msg${gs.phase === "done" ? " db-msg-win" : ""}`}>{gs.message}</p>

          <div className="db-controls">
            {gs.phase === "done"
              ? <button className="db-btn db-btn-solid" onClick={rematch}>Play Again</button>
              : <button className="db-btn db-btn-ghost" onClick={() => setMode("select")}>New Game</button>
            }
          </div>

          {/* SVG grid */}
          <div className="db-grid-wrap">
            <svg
              className="db-svg"
              viewBox={`0 0 ${SVG_W} ${SVG_W}`}
              width={SVG_W}
              height={SVG_W}
            >
              {/* Boxes */}
              {Array.from({ length: BOXES }, (_, r) =>
                Array.from({ length: BOXES }, (_, c) => (
                  <rect
                    key={`b_${r}_${c}`}
                    x={dx(c)} y={dy(r)}
                    width={DS} height={DS}
                    fill={boxColor(gs!.boxes[r][c])}
                    rx={3}
                  />
                ))
              )}

              {/* Horizontal lines */}
              {Array.from({ length: DOTS }, (_, r) =>
                Array.from({ length: BOXES }, (_, c) => (
                  <HLine key={`h_${r}_${c}`} r={r} c={c} />
                ))
              )}

              {/* Vertical lines */}
              {Array.from({ length: BOXES }, (_, r) =>
                Array.from({ length: DOTS }, (_, c) => (
                  <VLine key={`v_${r}_${c}`} r={r} c={c} />
                ))
              )}

              {/* Dots */}
              {Array.from({ length: DOTS }, (_, r) =>
                Array.from({ length: DOTS }, (_, c) => (
                  <circle
                    key={`d_${r}_${c}`}
                    cx={dx(c)} cy={dy(r)}
                    r={DOT_R}
                    fill="rgba(255,84,255,.7)"
                  />
                ))
              )}

              {/* Box labels (owner initials) */}
              {Array.from({ length: BOXES }, (_, r) =>
                Array.from({ length: BOXES }, (_, c) => {
                  const owner = gs!.boxes[r][c];
                  if (!owner) return null;
                  return (
                    <text
                      key={`bl_${r}_${c}`}
                      x={dx(c) + DS/2} y={dy(r) + DS/2 + 5}
                      textAnchor="middle"
                      fontSize={16}
                      fontFamily="DM Mono, monospace"
                      fill={owner === 1 ? P1_COL : P2_COL}
                      opacity={0.7}
                    >
                      {gs!.mode === "1p" ? (owner === 1 ? "Y" : "A") : `P${owner}`}
                    </text>
                  );
                })
              )}
            </svg>
          </div>

          <div className="db-legend">
            <div className="db-legend-item">
              <div className="db-legend-dot" style={{ background: P1_COL }} />
              <span style={{ color: P1_COL }}>{gs.mode === "1p" ? "You" : "Player 1"}</span>
            </div>
            <div className="db-legend-item">
              <div className="db-legend-dot" style={{ background: P2_COL }} />
              <span style={{ color: P2_COL }}>{gs.mode === "1p" ? "AI" : "Player 2"}</span>
            </div>
          </div>

          <a className="db-back" href="/projects/">← Back to Projects</a>
        </div>
      </div>
    </>
  );
}
