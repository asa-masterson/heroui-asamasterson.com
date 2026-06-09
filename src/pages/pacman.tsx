import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import GameStaticPreview from "@/components/GameStaticPreview";
import Leaderboard, { LeaderboardSidebar } from "@/components/Leaderboard";

// ── Constants ──────────────────────────────────────────────────────
const COLS = 21, ROWS = 21, CS = 20;
const CW = COLS * CS, CH = ROWS * CS;
const BRAND = "#ff54ff";

const L=0, R=1, U=2, D=3;
const DCOL = [-1,1,0,0];
const DROW = [0,0,-1,1];
const OPP  = [1,0,3,2];

const WALL=0, DOT=1, PELLET=2, EMPTY=3, GDOOR=4;

// Speed = frames per tile for each state
const PAC_SPD    = 7;
const NORM_SPD   = 9;
const FRIGHT_SPD = 11;
const DEAD_SPD   = 4;
const HOUSE_SPD  = 10;
const EXIT_SPD   = 8;

const FRIGHT_DUR  = 360;
const SCATTER_DUR = 420;
const CHASE_DUR   = 1200;
const GHOST_COLORS = ["#ff2222", BRAND, "#00e5ff", "#ffb852"];

// Fruits
const FRUIT_ROW = 13, FRUIT_COL = 10;
const FRUIT_SPAWN_AT = [70, 150]; // dots eaten → spawn
const FRUIT_DUR = 600;
const FRUIT_PTS = [100, 300];
const FRUIT_COLORS = ["#ff3333", "#ff77bb"];

// ── Maze ──────────────────────────────────────────────────────────
const MAZE_S = [
  "#####################",
  "#.........#.........#",
  "#.##.####.#.####.##.#",
  "#o##.####.#.####.##o#",
  "#.##.####.#.####.##.#",
  "#...................#",
  "#.##.#.###.###.#.##.#",
  "#....#...#.#...#....#",
  "####.###.#.#.###.####",
  "####.#.##---##.#.####",
  "####.#.##   ##.#.####",
  "####.#.##   ##.#.####",
  "####.#.#######.#.####",
  "####.#.##...##.#.####",
  "#.......#...#.......#",
  "#...................#",
  "#.##.#.###.###.#.##.#",
  "#....#...#.#...#....#",
  "#o##.###########.##o#",  // cols 9,11 sealed — were unreachable pockets
  "#.##.###########.##.#",
  "#####################",
];

function parseMaze(): number[][] {
  return MAZE_S.map(row => [...row].map(ch => {
    if (ch === "#") return WALL;
    if (ch === ".") return DOT;
    if (ch === "o") return PELLET;
    if (ch === "-") return GDOOR;
    return EMPTY;
  }));
}

function countFood(maze: number[][]): number {
  let n = 0;
  for (const row of maze) for (const c of row) if (c === DOT || c === PELLET) n++;
  return n;
}

// ── Types ─────────────────────────────────────────────────────────
interface Pac {
  row: number; col: number;
  pr: number;  pc: number;
  dir: number; nextDir: number;
  mp: number;       // move-progress 0→1
  moving: boolean;
}

interface Ghost {
  row: number; col: number;
  pr: number;  pc: number;
  dir: number;
  mp: number;       // move-progress 0→1
  color: string;
  state: "house" | "exiting" | "normal" | "frightened" | "dead";
  houseTimer: number;
  scatterRow: number; scatterCol: number;
  frightenedTimer: number;
  frightenAlpha: number; // 0=normal, 1=fully frightened (smooth visual)
  eatCombo: number;
}

interface Fruit {
  active: boolean;
  timer: number;
  type: number;
  alpha: number;
}

interface GS {
  maze: number[][];
  pac: Pac;
  ghosts: Ghost[];
  score: number;
  best: number;
  food: number;
  totalFood: number;
  lives: number;
  level: number;
  mode: "ready" | "playing" | "dying" | "won" | "gameover";
  modeTimer: number;
  scatter: boolean;
  frame: number;
  dyingTimer: number;
  wonTimer: number;
  fruit: Fruit;
  fruitSpawnIdx: number;
}

// ── Factories ─────────────────────────────────────────────────────
function makePac(): Pac {
  return { row:15, col:10, pr:15, pc:10, dir:L, nextDir:L, mp:0, moving:false };
}

function makeGhosts(): Ghost[] {
  const defs = [
    { row:8,  col:10, sr:0,  sc:20, ht:0   },
    { row:10, col:10, sr:0,  sc:0,  ht:60  },
    { row:10, col:9,  sr:20, sc:20, ht:120 },
    { row:10, col:11, sr:20, sc:0,  ht:180 },
  ];
  return defs.map((d, i) => ({
    row: d.row, col: d.col, pr: d.row, pc: d.col,
    dir: U, mp: 0,
    color: GHOST_COLORS[i],
    state: i === 0 ? "normal" : "house" as Ghost["state"],
    houseTimer: d.ht,
    scatterRow: d.sr, scatterCol: d.sc,
    frightenedTimer: 0, frightenAlpha: 0, eatCombo: 0,
  }));
}

function freshGame(best: number): GS {
  const maze = parseMaze();
  const food = countFood(maze);
  return {
    maze, pac: makePac(), ghosts: makeGhosts(),
    score: 0, best, food, totalFood: food, lives: 3, level: 1,
    mode: "ready", modeTimer: 0, scatter: true,
    frame: 0, dyingTimer: 0, wonTimer: 0,
    fruit: { active: false, timer: 0, type: 0, alpha: 0 },
    fruitSpawnIdx: 0,
  };
}

function nextLevel(gs: GS): GS {
  const maze = parseMaze();
  const food = countFood(maze);
  return {
    ...gs,
    maze, pac: makePac(), ghosts: makeGhosts(),
    food, totalFood: food,
    level: gs.level + 1,
    mode: "ready", modeTimer: 0, scatter: true,
    frame: 0, dyingTimer: 0, wonTimer: 0,
    fruit: { active: false, timer: 0, type: 0, alpha: 0 },
    fruitSpawnIdx: 0,
  };
}

// ── Game logic ────────────────────────────────────────────────────
function passable(maze: number[][], row: number, col: number, canDoor: boolean): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  const c = maze[row][col];
  if (c === WALL) return false;
  if (c === GDOOR) return canDoor;
  return true;
}

function greedyDir(
  row: number, col: number, curDir: number,
  tr: number, tc: number,
  maze: number[][], canDoor: boolean,
): number {
  let best = -1, bestDist = Infinity;
  for (let d = 0; d < 4; d++) {
    if (d === OPP[curDir]) continue; // no reversal
    const nr = row + DROW[d], nc = col + DCOL[d];
    if (!passable(maze, nr, nc, canDoor)) continue;
    const dist = (nr-tr)**2 + (nc-tc)**2;
    if (dist < bestDist) { bestDist = dist; best = d; }
  }
  if (best === -1) {
    // forced reversal — only option
    const nr = row + DROW[OPP[curDir]], nc = col + DCOL[OPP[curDir]];
    return passable(maze, nr, nc, canDoor) ? OPP[curDir] : curDir;
  }
  return best;
}

// BFS shortest-path for dead ghost navigation — prevents oscillation
// in narrow corridors where greedy gets stuck between equidistant tiles
function bfsDir(
  sr: number, sc: number,
  tr: number, tc: number,
  maze: number[][], canDoor: boolean,
): number {
  if (sr === tr && sc === tc) return U;
  const visited = new Uint8Array(ROWS * COLS);
  visited[sr * COLS + sc] = 1;
  // queue entries: [row, col, first_direction_taken]
  const q: [number, number, number][] = [];
  for (let d = 0; d < 4; d++) {
    const nr = sr + DROW[d], nc = sc + DCOL[d];
    if (!passable(maze, nr, nc, canDoor)) continue;
    const k = nr * COLS + nc;
    if (!visited[k]) { visited[k] = 1; q.push([nr, nc, d]); }
  }
  let head = 0;
  while (head < q.length) {
    const [r, c, fd] = q[head++];
    if (r === tr && c === tc) return fd;
    for (let d = 0; d < 4; d++) {
      const nr = r + DROW[d], nc = c + DCOL[d];
      if (!passable(maze, nr, nc, canDoor)) continue;
      const k = nr * COLS + nc;
      if (!visited[k]) { visited[k] = 1; q.push([nr, nc, fd]); }
    }
  }
  return greedyDir(sr, sc, U, tr, tc, maze, canDoor); // fallback
}

function randomDir(row: number, col: number, curDir: number, maze: number[][]): number {
  const opts = [0,1,2,3].filter(d =>
    d !== OPP[curDir] && passable(maze, row+DROW[d], col+DCOL[d], false));
  return opts.length ? opts[Math.floor(Math.random() * opts.length)] : OPP[curDir];
}

function ghostSpd(g: Ghost, level = 1): number {
  const boost = Math.min(level - 1, 4); // cap at level 5
  switch (g.state) {
    case "dead":       return DEAD_SPD;
    case "frightened": return Math.max(7, FRIGHT_SPD - boost);
    case "house":      return HOUSE_SPD;
    case "exiting":    return EXIT_SPD;
    default:           return Math.max(5, NORM_SPD - boost);
  }
}

function updateGhost(g: Ghost, gs: GS): void {
  // Smooth frighten visual — runs every frame for fluid color transition
  const wantFright = g.state === "frightened";
  g.frightenAlpha += ((wantFright ? 1 : 0) - g.frightenAlpha) * 0.13;
  if (g.frightenAlpha < 0.005) g.frightenAlpha = 0;
  if (g.frightenAlpha > 0.995) g.frightenAlpha = 1;

  if (g.frightenedTimer > 0) g.frightenedTimer--;

  // Advance move-progress at per-state speed — this is what was causing flicker:
  // house/exiting previously moved every frame; now gated by mp like all states
  g.mp += 1 / ghostSpd(g, gs.level);
  if (g.mp < 1) return;
  g.mp = 0;

  // ── House bounce ──────────────────────────────────────────────
  if (g.state === "house") {
    if (--g.houseTimer <= 0) { g.state = "exiting"; return; }
    const nr = g.row + DROW[g.dir];
    if (nr < 10 || nr > 11) g.dir = OPP[g.dir];
    g.pr = g.row; g.pc = g.col;
    g.row += DROW[g.dir];
    return;
  }

  // ── Exiting ghost house ───────────────────────────────────────
  if (g.state === "exiting") {
    g.pr = g.row; g.pc = g.col;
    if (g.col !== 10) {
      g.col += g.col < 10 ? 1 : -1;
    } else if (g.row > 8) {
      g.row--;
    } else {
      g.state = g.frightenedTimer > 0 ? "frightened" : "normal";
    }
    return;
  }

  g.pr = g.row; g.pc = g.col;

  // ── Dead: rush back to house via BFS (prevents oscillation in narrow corridors)
  if (g.state === "dead") {
    if (g.row >= 9 && g.row <= 11 && g.col === 10) {
      // Arrived at/through the door — drop into house
      g.row = 10; g.col = 10;
      g.state = "house"; g.houseTimer = 30;
      g.frightenAlpha = 0;
      g.dir = D;
      return;
    }
    g.dir = bfsDir(g.row, g.col, 9, 10, gs.maze, true);
    g.row += DROW[g.dir]; g.col += DCOL[g.dir];
    return;
  }

  if (g.state === "frightened" && g.frightenedTimer <= 0) g.state = "normal";

  if (g.state === "frightened") {
    g.dir = randomDir(g.row, g.col, g.dir, gs.maze);
  } else {
    const [tr, tc] = gs.scatter
      ? [g.scatterRow, g.scatterCol]
      : [gs.pac.row, gs.pac.col];
    g.dir = greedyDir(g.row, g.col, g.dir, tr, tc, gs.maze, false);
  }
  g.row += DROW[g.dir]; g.col += DCOL[g.dir];
}

function checkFruitSpawn(gs: GS): void {
  if (gs.fruitSpawnIdx >= FRUIT_SPAWN_AT.length) return;
  if (gs.fruit.active) return;
  const eaten = gs.totalFood - gs.food;
  if (eaten >= FRUIT_SPAWN_AT[gs.fruitSpawnIdx]) {
    gs.fruit = { active: true, timer: FRUIT_DUR, type: gs.fruitSpawnIdx, alpha: 0 };
    gs.fruitSpawnIdx++;
  }
}

function updateFruit(gs: GS): void {
  const f = gs.fruit;
  if (f.active) {
    if (--f.timer <= 0) { f.active = false; f.alpha = 0; return; }
    f.alpha = Math.min(1, f.alpha + 0.06);
  } else if (f.alpha > 0) {
    f.alpha = Math.max(0, f.alpha - 0.08);
  }
}

function updatePac(gs: GS): void {
  const p = gs.pac;
  p.mp += 1 / Math.max(4, PAC_SPD - Math.min(gs.level - 1, 3));
  if (p.mp < 1) return;
  p.mp = 0;

  // Apply queued direction if passable from current tile
  if (passable(gs.maze, p.row + DROW[p.nextDir], p.col + DCOL[p.nextDir], false)) {
    p.dir = p.nextDir;
    p.moving = true;
  }

  if (!p.moving) return;

  const nr = p.row + DROW[p.dir], nc = p.col + DCOL[p.dir];
  if (!passable(gs.maze, nr, nc, false)) {
    // Snap lerp to current tile so there's no backward drift
    p.pr = p.row; p.pc = p.col;
    p.moving = false;
    return;
  }

  p.pr = p.row; p.pc = p.col;
  p.row = nr; p.col = nc;

  const cell = gs.maze[p.row][p.col];
  if (cell === DOT) {
    gs.maze[p.row][p.col] = EMPTY;
    gs.score += 10; gs.food--;
    checkFruitSpawn(gs);
  } else if (cell === PELLET) {
    gs.maze[p.row][p.col] = EMPTY;
    gs.score += 50; gs.food--;
    checkFruitSpawn(gs);
    gs.ghosts.forEach(g => {
      if (g.state === "normal" || g.state === "frightened") {
        g.state = "frightened";
        g.frightenedTimer = FRIGHT_DUR;
        g.eatCombo = 0;
      }
    });
  }

  if (gs.fruit.active && p.row === FRUIT_ROW && p.col === FRUIT_COL) {
    gs.score += FRUIT_PTS[gs.fruit.type] ?? 100;
    gs.fruit.active = false;
  }
}

// ── Drawing ───────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function hexRgb(h: string): [number, number, number] {
  const v = parseInt(h.replace("#", ""), 16);
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
}

function blendColor(c1: string, c2: string, t: number): string {
  const [r1,g1,b1] = hexRgb(c1), [r2,g2,b2] = hexRgb(c2);
  return `rgb(${~~(r1+(r2-r1)*t)},${~~(g1+(g2-g1)*t)},${~~(b1+(b2-b1)*t)})`;
}

function drawMaze(ctx: CanvasRenderingContext2D, maze: number[][], frame: number): void {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = c * CS + CS / 2, cy = r * CS + CS / 2;
      const cell = maze[r][c];
      if (cell === WALL) {
        ctx.fillStyle = "#14073a";
        ctx.fillRect(c * CS, r * CS, CS, CS);
      } else if (cell === GDOOR) {
        ctx.fillStyle = "rgba(255,84,220,0.55)";
        ctx.fillRect(c * CS + 1, r * CS + CS/2 - 1, CS - 2, 2);
      } else if (cell === DOT) {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      } else if (cell === PELLET) {
        const pulse = Math.sin(frame * 0.15) * 0.4 + 0.8;
        ctx.fillStyle = BRAND;
        ctx.shadowColor = BRAND; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(cx, cy, 5 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
  ctx.strokeStyle = "rgba(80,0,200,0.25)";
  ctx.lineWidth = 0.5;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE_S[r][c] === "#") ctx.strokeRect(c * CS + 0.5, r * CS + 0.5, CS - 1, CS - 1);
    }
  }
}

function drawGhostShape(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  const r = CS / 2 - 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 1, r, Math.PI, 0, false);
  ctx.lineTo(x + r, y + r - 1);
  const bw = (r * 2) / 3;
  for (let i = 2; i >= 0; i--) {
    ctx.arc(x - r + i * bw + bw / 2, y + r - 1, bw / 2, 0, Math.PI, true);
  }
  ctx.lineTo(x - r, y - 1);
  ctx.closePath(); ctx.fill();
}

function drawGhostEyes(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - 3, y - 1, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 1, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0033ff";
  ctx.beginPath(); ctx.arc(x - 2.5, y - 0.5, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3.5, y - 0.5, 1.8, 0, Math.PI * 2); ctx.fill();
}

function drawGhostScaredFace(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - 3, y - 2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 3);
  ctx.quadraticCurveTo(x - 1, y + 1, x, y + 3);
  ctx.quadraticCurveTo(x + 1, y + 5, x + 4, y + 3);
  ctx.stroke(); ctx.lineWidth = 1;
}

function drawFruit(ctx: CanvasRenderingContext2D, fruit: Fruit): void {
  if (fruit.alpha < 0.01) return;
  const x = FRUIT_COL * CS + CS / 2;
  const y = FRUIT_ROW * CS + CS / 2;
  ctx.globalAlpha = fruit.alpha;
  const col = FRUIT_COLORS[fruit.type] ?? "#ffcc33";
  ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = `bold 8px 'DM Mono', monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(fruit.type === 0 ? "C" : "S", x, y + 0.5);
  ctx.globalAlpha = 1;
}

function drawScene(ctx: CanvasRenderingContext2D, gs: GS): void {
  const { frame, pac, ghosts, mode, dyingTimer, fruit } = gs;

  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, CW, CH);

  drawMaze(ctx, gs.maze, frame);
  drawFruit(ctx, fruit);

  // ── Ghosts ──────────────────────────────────────────────────────
  for (const g of ghosts) {
    const t = Math.min(g.mp, 1);
    const gx = lerp(g.pc, g.col, t) * CS + CS / 2;
    const gy = lerp(g.pr, g.row, t) * CS + CS / 2;

    if (g.state === "dead") {
      drawGhostEyes(ctx, gx, gy);
      continue;
    }

    const fa = g.frightenAlpha;
    const blink = g.state === "frightened"
      && g.frightenedTimer < 120
      && Math.floor(frame / 10) % 2 === 0;
    const frightColor = blink ? "#ccddff" : "#2244dd";

    const bodyColor = fa < 0.01
      ? g.color
      : fa > 0.99 ? frightColor
      : blendColor(g.color, frightColor, fa);

    drawGhostShape(ctx, gx, gy, bodyColor);

    // Normal eyes → scared face cross-fade
    if (fa < 0.9) {
      ctx.globalAlpha = 1 - fa;
      drawGhostEyes(ctx, gx, gy);
      ctx.globalAlpha = 1;
    }
    if (fa > 0.1) {
      ctx.globalAlpha = fa;
      drawGhostScaredFace(ctx, gx, gy);
      ctx.globalAlpha = 1;
    }
  }

  // ── Pac-Man ─────────────────────────────────────────────────────
  const dying = mode === "dying";
  // t=1 when not moving so lerp resolves to current tile (no backward drift)
  const pt = pac.moving ? Math.min(pac.mp, 1) : 1;
  const px = lerp(pac.pc, pac.col, pt) * CS + CS / 2;
  const py = lerp(pac.pr, pac.row, pt) * CS + CS / 2;

  let pacAlpha = 1;
  if (dying) {
    pacAlpha = dyingTimer < 60 ? 1 : Math.max(0, 1 - (dyingTimer - 60) / 30);
    if (dyingTimer >= 90) pacAlpha = 0;
  }

  if (pacAlpha > 0) {
    ctx.globalAlpha = pacAlpha;
    const CENTER = [Math.PI, 0, -Math.PI / 2, Math.PI / 2][pac.dir];
    const mouthOpen = dying
      ? Math.min(dyingTimer / 30, 1) * Math.PI
      : Math.abs(Math.sin(frame * 0.22)) * (Math.PI / 3);
    const mouthAngle = pac.moving || dying ? mouthOpen : 0.12;

    ctx.fillStyle = "#ffee00";
    ctx.shadowColor = "#ff9900"; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, CS / 2 - 1, CENTER + mouthAngle, CENTER - mouthAngle, false);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // ── Overlays ─────────────────────────────────────────────────────
  if (mode === "ready") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, CH / 2 - 26, CW, 52);
    ctx.fillStyle = BRAND;
    ctx.font = `bold 22px 'DM Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillText("GET READY!", CW / 2, CH / 2 + 8);
  }
  if (mode === "won") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, CH / 2 - 36, CW, 72);
    ctx.fillStyle = "#ffee00";
    ctx.font = `bold 20px 'DM Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${gs.level} CLEAR!`, CW / 2, CH / 2 - 4);
    ctx.fillStyle = "rgba(255,238,0,0.6)";
    ctx.font = `13px 'DM Mono', monospace`;
    ctx.fillText(`GET READY FOR LEVEL ${gs.level + 1}`, CW / 2, CH / 2 + 18);
  }
  if (mode === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, CH / 2 - 30, CW, 60);
    ctx.fillStyle = "#ff4444";
    ctx.font = `bold 22px 'DM Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", CW / 2, CH / 2 + 7);
  }
}

// ── CSS ───────────────────────────────────────────────────────────
const css = `
  .pm-page   { display:flex; flex-direction:column; min-height:100svh; background:#0d0d0d; }
  .pm-center { flex:1; display:flex; align-items:center; justify-content:center; padding:.75rem; }
  .pm-layout { display:flex; gap:1.25rem; align-items:flex-start; justify-content:center; }
  .pm-wrap   { display:flex; flex-direction:column; align-items:center; gap:.75rem;
               width:100%; max-width:460px; }
  @media (max-width:760px) { .pm-layout { flex-direction:column; align-items:center; } .lb-side { width:100%; max-width:420px; } }

  .pm-header { display:flex; width:100%; align-items:flex-end;
               justify-content:space-between; gap:.75rem; }
  .pm-title  { font-family:'DM Serif Display',serif;
               font-size:clamp(1.9rem,8vw,3rem); color:${BRAND}; line-height:1; margin:0; }
  .pm-scores { display:flex; gap:.5rem; }
  .pm-sbox   { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07);
               border-radius:10px; padding:.35rem .7rem; text-align:center; min-width:62px; }
  .pm-slabel { font-family:'DM Mono',monospace; font-size:.52rem; letter-spacing:.15em;
               text-transform:uppercase; color:rgba(255,255,255,.3); display:block; margin-bottom:1px; }
  .pm-sval   { font-family:'DM Mono',monospace; font-size:1rem; color:#fff; line-height:1; }

  .pm-lives  { display:flex; gap:4px; align-items:center; }
  .pm-life   { width:14px; height:14px; background:#ffee00;
               clip-path:polygon(50% 50%,100% 25%,100% 100%,0 100%,0 25%);
               border-radius:50% 50% 0 0; }

  .pm-sub    { display:flex; width:100%; align-items:center;
               justify-content:space-between; gap:.5rem; }
  .pm-hint   { font-family:'DM Mono',monospace; font-size:.56rem;
               letter-spacing:.06em; color:rgba(255,255,255,.18); }

  .pm-canvas-wrap { position:relative; width:100%; max-width:420px; }
  .pm-canvas { width:100%; height:auto; display:block; touch-action:none; }

  .pm-overlay { position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; gap:14px;
                background:rgba(13,13,13,.82); }
  .pm-ov-eye  { font-family:'DM Mono',monospace; font-size:.62rem; letter-spacing:.2em;
                text-transform:uppercase; color:${BRAND}; margin:0; }
  .pm-ov-head { font-family:'DM Serif Display',serif; font-size:clamp(1.8rem,6vw,2.8rem);
                color:#fff; margin:0; line-height:1; }
  .pm-ov-btns { display:flex; gap:10px; margin-top:4px; }
  .pm-btn { font-family:'DM Mono',monospace; font-size:.68rem; letter-spacing:.12em;
            text-transform:uppercase; padding:.55rem 1.25rem; border-radius:999px;
            cursor:pointer; transition:opacity .15s; }
  .pm-btn:hover { opacity:.82; }
  .pm-btn-solid   { background:${BRAND}; color:#fff; border:none; }
  .pm-btn-outline { background:transparent; color:${BRAND}; border:1px solid rgba(255,84,255,.5); }

  .pm-dpad {
    display:grid;
    grid-template-areas:'. up .' 'left . right' '. down .';
    grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:.25rem;
  }
  @media (pointer:fine) { .pm-dpad { display:none; } }
  .pm-dpad-btn { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
                 border-radius:10px; color:#fff; font-size:1.2rem; padding:.6rem;
                 cursor:pointer; user-select:none; -webkit-user-select:none;
                 touch-action:manipulation;
                 display:flex; align-items:center; justify-content:center; }
  .pm-dpad-btn:active { background:rgba(255,84,255,.25); border-color:${BRAND}; }
  .pm-dpad-up    { grid-area:up; }
  .pm-dpad-left  { grid-area:left; }
  .pm-dpad-right { grid-area:right; }
  .pm-dpad-down  { grid-area:down; }

  .pm-back { font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.1em;
             color:rgba(255,84,255,.4); text-decoration:none; margin-top:2px; }
`;

// ── Component ─────────────────────────────────────────────────────
export default function PacmanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef     = useRef<GS | null>(null);
  const rafRef    = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [best,  setBest]  = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [mode,  setMode]  = useState<GS["mode"]>("ready");

  const lastScore = useRef(0);
  const lastLives = useRef(3);
  const lastLevel = useRef(1);
  const lastMode  = useRef<GS["mode"]>("ready");

  function syncUI(gs: GS) {
    if (gs.score !== lastScore.current) { setScore(gs.score); lastScore.current = gs.score; }
    if (gs.lives !== lastLives.current) { setLives(gs.lives); lastLives.current = gs.lives; }
    if (gs.level !== lastLevel.current) { setLevel(gs.level); lastLevel.current = gs.level; }
    if (gs.mode  !== lastMode.current)  { setMode(gs.mode);   lastMode.current  = gs.mode; }
  }

  function startGame(keepBest = true) {
    const b = keepBest ? (gsRef.current?.best ?? 0) : 0;
    const gs = freshGame(b);
    gsRef.current = gs;
    lastScore.current = 0; lastLives.current = 3; lastLevel.current = 1; lastMode.current = "ready";
    setScore(0); setLives(3); setLevel(1); setMode("ready"); setBest(b);
  }

  function queueDir(d: number) {
    const gs = gsRef.current;
    if (!gs || gs.mode !== "playing") return;
    gs.pac.nextDir = d;
    if (!gs.pac.moving) gs.pac.moving = true;
  }

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const stored = parseInt(localStorage.getItem("pacman-best") || "0", 10);
    setBest(stored);
    const gs = freshGame(stored);
    gsRef.current = gs;

    const loop = () => {
      const gs = gsRef.current;
      if (!gs) { rafRef.current = requestAnimationFrame(loop); return; }

      gs.frame++;
      const m = gs.mode;

      if (m === "ready") {
        if (gs.frame >= 120) gs.mode = "playing";

      } else if (m === "playing") {
        gs.modeTimer++;
        if (gs.modeTimer >= (gs.scatter ? SCATTER_DUR : CHASE_DUR)) {
          gs.modeTimer = 0;
          gs.scatter = !gs.scatter;
          gs.ghosts.forEach(g => { if (g.state === "normal") g.dir = OPP[g.dir]; });
        }

        updatePac(gs);
        gs.ghosts.forEach(g => updateGhost(g, gs));
        updateFruit(gs);

        // Collision check
        for (const g of gs.ghosts) {
          if (g.row !== gs.pac.row || g.col !== gs.pac.col) continue;
          if (g.state === "frightened") {
            g.state = "dead";
            gs.score += 200 * (1 << g.eatCombo);
            g.eatCombo++;
          } else if (g.state === "normal") {
            gs.lives--;
            if (gs.lives <= 0) { gs.mode = "gameover"; }
            else { gs.mode = "dying"; gs.dyingTimer = 0; }
            break;
          }
        }

        if (gs.food <= 0 && gs.mode === "playing") gs.mode = "won";

        if (gs.score > gs.best) {
          gs.best = gs.score;
          localStorage.setItem("pacman-best", String(gs.best));
          setBest(gs.best);
        }

      } else if (m === "won") {
        gs.wonTimer++;
        if (gs.wonTimer >= 150) {
          const next = nextLevel(gs);
          gsRef.current = next;
          syncUI(next);
          drawScene(ctx, next);
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

      } else if (m === "dying") {
        gs.dyingTimer++;
        if (gs.dyingTimer >= 150) {
          gs.pac = makePac();
          gs.ghosts = makeGhosts();
          gs.mode = "ready"; gs.frame = 0;
          gs.modeTimer = 0; gs.scatter = true;
        }
      }

      drawScene(ctx, gs);
      syncUI(gs);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // Keyboard
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const MAP: Record<string, number> = {
        ArrowLeft:L, ArrowRight:R, ArrowUp:U, ArrowDown:D,
        a:L, d:R, w:U, s:D, A:L, D:R, W:U, S:D,
      };
      if (MAP[e.key] !== undefined) { e.preventDefault(); queueDir(MAP[e.key]); }
    };
    window.addEventListener("keydown", onKey);

    // Swipe
    let tx = 0, ty = 0;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) queueDir(dx > 0 ? R : L);
      else queueDir(dy > 0 ? D : U);
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <GameStaticPreview
        meta={pageMeta.pacman}
        title="Dot Chomper"
        description="Eat all the dots and grab power pellets to chase the ghosts. Four ghost personalities — Blinky, Pinky, Inky, and Clyde — each move differently to corner you. Keyboard and WASD on desktop, d-pad on mobile. Beat your score and submit it to the global leaderboard."
        tags={["1 Player", "Arcade", "Leaderboard", "Canvas"]}
      />
    );
  }

  return (
    <>
      <SEOHead meta={pageMeta.pacman} />
      <style>{css}</style>
      <div className="pm-page">
        <Navbar />
        <div className="pm-center">
          <div className="pm-layout">
          <div className="pm-wrap">

            <div className="pm-header">
              <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                <h1 className="pm-title">DOT CHOMPER</h1>
                <span className="pm-slabel" style={{fontSize:".55rem", letterSpacing:".12em"}}>LEVEL {level}</span>
              </div>
              <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px"}}>
                <div className="pm-scores">
                  <div className="pm-sbox">
                    <span className="pm-slabel">Score</span>
                    <span className="pm-sval">{score}</span>
                  </div>
                  <div className="pm-sbox">
                    <span className="pm-slabel">Best</span>
                    <span className="pm-sval">{best}</span>
                  </div>
                </div>
                <div className="pm-lives">
                  {Array.from({length: lives}).map((_, i) => (
                    <div key={i} className="pm-life" />
                  ))}
                </div>
              </div>
            </div>

            <div className="pm-sub">
              <span className="pm-hint">Arrows · WASD · Swipe</span>
              <button className="pm-btn pm-btn-outline" onClick={() => startGame(true)}>New game</button>
            </div>

            <div className="pm-canvas-wrap">
              <canvas ref={canvasRef} width={CW} height={CH} className="pm-canvas" />

              {mode === "gameover" && (
                <div className="pm-overlay" style={{ overflowY: "auto", paddingBottom: "1rem" }}>
                  <p className="pm-ov-eye">No lives left — reached level {level}</p>
                  <p className="pm-ov-head">Game over</p>
                  <div className="pm-ov-btns">
                    <button className="pm-btn pm-btn-solid" onClick={() => startGame(true)}>
                      Play again
                    </button>
                  </div>
                  <Leaderboard game="dotchomper" score={score} level={level} />
                </div>
              )}
            </div>

            <div className="pm-dpad">
              <button className="pm-dpad-btn pm-dpad-up"    onPointerDown={() => queueDir(U)}>▲</button>
              <button className="pm-dpad-btn pm-dpad-left"  onPointerDown={() => queueDir(L)}>◀</button>
              <button className="pm-dpad-btn pm-dpad-right" onPointerDown={() => queueDir(R)}>▶</button>
              <button className="pm-dpad-btn pm-dpad-down"  onPointerDown={() => queueDir(D)}>▼</button>
            </div>

            <a className="pm-back" href="/projects/">← Back to Projects</a>
          </div>
          <LeaderboardSidebar game="dotchomper" />
          </div>
        </div>
      </div>
    </>
  );
}
