import { COLS, ROWS, brickCount, emptyGrid, hitBrick } from "./logic.mjs";

export const CELL = 28;
export const W = COLS * CELL;
export const H = ROWS * CELL;

export function brickWall(random = Math.random) {
  const grid = emptyGrid();
  const types = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let y = 1; y <= 8; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (random() < 0.14) continue;
      grid[y][x] = {
        type: types[Math.floor(random() * types.length)],
        g: y * COLS + x + 1,
        bomb: random() < 0.08,
        reward: null,
        curse: null,
        sand: null,
      };
    }
  }
  return grid;
}

export function createSession(kind, grid, stage, random) {
  const speed = Math.min(460, 220 + (Math.max(1, stage) - 1) * 16);
  if (kind === "pinball" && grid?.[0]?.length) {
    for (let y = ROWS - 6; y < ROWS; y += 1) {
      if (!grid[y]) continue;
      for (let x = 0; x < COLS; x += 1) grid[y][x] = null;
    }
  }
  return {
    kind,
    grid,
    stage: Math.max(1, stage),
    random,
    prep: 4000,
    baseSpeed: speed,
    speed,
    cleared: 0,
    streak: 0,
    score: 0,
    paddleX: W / 2,
    paddleW: 88,
    aim: -Math.PI / 2,
    chances: kind === "bbtan" ? 3 : 1,
    balls: kind === "pinball" ? [restBall()] : [],
    queueLeft: 0,
    queueTime: 0,
    aiming: kind === "bbtan",
    launched: false,
    over: false,
    full: false,
    left: false,
    right: false,
    fire: false,
    flashes: [],
    curseHits: [],
  };
}

function rescale(ball, speed) {
  const mag = Math.hypot(ball.vx, ball.vy) || 1;
  ball.vx = (ball.vx / mag) * speed;
  ball.vy = (ball.vy / mag) * speed;
}

function makeBall(session, angle, x, y) {
  return {
    x,
    y,
    vx: Math.cos(angle) * session.speed,
    vy: Math.sin(angle) * session.speed,
    r: 6,
    gravity: session.kind === "pinball",
  };
}

function award(session) {
  session.streak += 1;
  const mult = Math.min(8, 1 + Math.floor((session.streak - 1) / 4));
  session.score += 40 * session.stage * mult;
  session.cleared += 1;
  if (session.kind === "breakout" && session.cleared % 8 === 0) {
    session.speed = Math.min(session.baseSpeed * 2, session.speed * 1.15);
    for (const ball of session.balls) rescale(ball, session.speed);
  }
}

function hit(session, x, y) {
  const removed = hitBrick(session.grid, x, y, session.random);
  for (const cell of removed) {
    award(session);
    session.flashes.push({ x: cell.x, y: cell.y, life: 200 });
    if (cell.curse) session.curseHits.push(cell);
  }
  return removed.length > 0;
}

function bounceOffCell(ball, x, y) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  if (Math.abs(ball.x - cx) > Math.abs(ball.y - cy)) ball.vx = -ball.vx;
  else ball.vy = -ball.vy;
  ball.x += Math.sign(ball.vx || 1) * 3;
  ball.y += Math.sign(ball.vy || -1) * 3;
}

function collideBricks(session, ball) {
  const samples = [
    [ball.x, ball.y],
    [ball.x - ball.r, ball.y],
    [ball.x + ball.r, ball.y],
    [ball.x, ball.y - ball.r],
    [ball.x, ball.y + ball.r],
  ];
  for (const [px, py] of samples) {
    const x = Math.floor(px / CELL);
    const y = Math.floor(py / CELL);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
    if (!session.grid[y][x]) continue;
    hit(session, x, y);
    bounceOffCell(ball, x, y);
    return;
  }
}

function movePaddle(session, dt) {
  const dir = (session.right ? 1 : 0) - (session.left ? 1 : 0);
  session.paddleX = Math.max(session.paddleW / 2, Math.min(W - session.paddleW / 2, session.paddleX + dir * 420 * dt));
}

function collidePaddle(session, ball) {
  const top = H - 30;
  const left = session.paddleX - session.paddleW / 2;
  const right = session.paddleX + session.paddleW / 2;
  if (ball.vy <= 0 || ball.y < top - 8 || ball.y > top + 16) return;
  if (ball.x < left || ball.x > right) return;
  const offset = (ball.x - session.paddleX) / (session.paddleW / 2);
  ball.vy = -Math.abs(ball.vy);
  ball.vx += offset * session.speed * 0.55;
  rescale(ball, session.speed);
  ball.y = top - ball.r - 1;
}

function tableWalls() {
  return [
    [22, H - 190, 22, H - 52],
    [22, H - 52, 78, H - 26],
    [W - 22, H - 190, W - 22, H - 52],
    [W - 22, H - 52, W - 78, H - 26],
  ];
}

function flipper(side, raised) {
  const left = side === "left";
  const pivotX = left ? 78 : W - 78;
  const pivotY = H - 26;
  const angle = left ? (raised ? -1.2 : -0.42) : (raised ? Math.PI + 1.2 : Math.PI + 0.42);
  const len = 62;
  return {
    x1: pivotX,
    y1: pivotY,
    x2: pivotX + Math.cos(angle) * len,
    y2: pivotY + Math.sin(angle) * len,
  };
}

function restBall() {
  const seat = flipper("left", false);
  return {
    x: W / 2,
    y: Math.min(seat.y1, seat.y2) - 16,
    vx: 0,
    vy: 0,
    r: 7,
    gravity: true,
  };
}

function collideSegment(ball, segment, kicking) {
  const { x1, y1, x2, y2 } = segment;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let along = ((ball.x - x1) * dx + (ball.y - y1) * dy) / len2;
  along = Math.max(0, Math.min(1, along));
  const qx = x1 + along * dx;
  const qy = y1 + along * dy;
  const dist = Math.hypot(ball.x - qx, ball.y - qy);
  if (dist > ball.r + 6) return false;
  const nx = dist ? (ball.x - qx) / dist : 0;
  const ny = dist ? (ball.y - qy) / dist : -1;
  const outwardY = ny > 0 ? ny : -ny;
  const dot = ball.vx * nx + ball.vy * ny;
  if (dot < 0) {
    ball.vx -= 2 * dot * nx;
    ball.vy -= 2 * dot * ny;
  }
  if (kicking) {
    ball.vy = Math.min(ball.vy, -720);
    ball.vx += nx * 80;
  }
  ball.x = qx + nx * (ball.r + 7);
  ball.y = qy - outwardY * (ball.r + 7);
  return true;
}

function stepBall(session, ball, dt) {
  const slices = session.kind === "pinball" ? 4 : 1;
  const step = dt / slices;
  for (let i = 0; i < slices; i += 1) {
    if (ball.gravity) ball.vy += 520 * step;
    ball.x += ball.vx * step;
    ball.y += ball.vy * step;
    if (ball.x < ball.r) {
      ball.x = ball.r;
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.x > W - ball.r) {
      ball.x = W - ball.r;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y < ball.r) {
      ball.y = ball.r;
      ball.vy = Math.abs(ball.vy);
    }
    collideBricks(session, ball);
    if (session.kind === "breakout") collidePaddle(session, ball);
    if (session.kind === "pinball") {
      for (const wall of tableWalls()) {
        collideSegment(ball, { x1: wall[0], y1: wall[1], x2: wall[2], y2: wall[3] }, false);
      }
      collideSegment(ball, flipper("left", session.left), session.left);
      collideSegment(ball, flipper("right", session.right), session.right);
    }
  }
  const limit = session.kind === "pinball" ? 900 : session.speed * 1.4;
  const mag = Math.hypot(ball.vx, ball.vy);
  if (mag > limit) {
    ball.vx = (ball.vx / mag) * limit;
    ball.vy = (ball.vy / mag) * limit;
  }
}

export function updateSession(session, dtMs) {
  const dt = Math.min(0.032, dtMs / 1000);
  session.flashes = session.flashes.filter((flash) => {
    flash.life -= dtMs;
    return flash.life > 0;
  });
  if (session.over) return session;
  if (session.prep > 0) {
    session.prep -= dtMs;
    if (session.kind === "breakout") movePaddle(session, dt);
    if (session.kind === "bbtan") session.aim += ((session.right ? 1 : 0) - (session.left ? 1 : 0)) * 1.3 * dt;
    session.aim = Math.max(-Math.PI + 0.28, Math.min(-0.28, session.aim));
    return session;
  }
  if (session.kind === "breakout" && !session.launched) {
    const tilt = (session.random() - 0.5) * 0.7;
    session.balls.push(makeBall(session, -Math.PI / 2 + tilt, session.paddleX, H - 46));
    session.launched = true;
  }
  if (session.kind === "pinball" && !session.launched) {
    if (!session.balls.length) session.balls.push(restBall());
    const ball = session.balls[0];
    const seat = restBall();
    ball.x = seat.x;
    ball.y = seat.y;
    ball.vx = 0;
    ball.vy = 0;
    if (session.prep <= 0 && (session.left || session.right || session.fire)) {
      session.launched = true;
      ball.vx = session.right && !session.left ? -200 : 200;
      ball.vy = -720;
    }
    return session;
  }
  if (session.kind === "breakout") movePaddle(session, dt);
  if (session.kind === "bbtan") {
    if (session.aiming) session.aim += ((session.right ? 1 : 0) - (session.left ? 1 : 0)) * 1.3 * dt;
    session.aim = Math.max(-Math.PI + 0.28, Math.min(-0.28, session.aim));
    if (session.fire && session.aiming && session.chances > 0) {
      session.aiming = false;
      session.queueLeft = 3;
      session.queueTime = 0;
      session.chances -= 1;
    }
    session.fire = false;
    if (session.queueLeft > 0) {
      session.queueTime -= dtMs;
      if (session.queueTime <= 0) {
        session.balls.push(makeBall(session, session.aim, W / 2, H - 24));
        session.queueLeft -= 1;
        session.queueTime = 90;
      }
    }
  }
  for (const ball of session.balls) stepBall(session, ball, dt);
  session.balls = session.balls.filter((ball) => ball.y < H + 12);
  if (brickCount(session.grid) === 0) {
    session.full = true;
    session.over = true;
    return session;
  }
  if (session.kind === "breakout" && session.launched && session.balls.length === 0) session.over = true;
  if (session.kind === "pinball" && session.launched && session.balls.length === 0) session.over = true;
  if (session.kind === "bbtan" && !session.aiming && session.queueLeft === 0 && session.balls.length === 0) {
    if (session.chances > 0) session.aiming = true;
    else session.over = true;
  }
  return session;
}

function paintBall(ctx, ball) {
  ctx.save();
  ctx.shadowColor = "rgba(10,132,255,.35)";
  ctx.shadowBlur = 10;
  const gloss = ctx.createRadialGradient(ball.x - ball.r * 0.35, ball.y - ball.r * 0.4, 1, ball.x, ball.y, ball.r);
  gloss.addColorStop(0, "#ffffff");
  gloss.addColorStop(0.42, "#d7ebff");
  gloss.addColorStop(1, "#0071e3");
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSession(ctx, session, ink) {
  for (const flash of session.flashes) {
    const age = 1 - Math.max(0, flash.life / 200);
    const cx = flash.x * CELL + CELL / 2;
    const cy = flash.y * CELL + CELL / 2;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - age);
    ctx.strokeStyle = "#ffd60a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * (0.25 + age * 1.1), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * (0.45 * (1 - age)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (session.kind === "breakout") {
    const x = session.paddleX - session.paddleW / 2;
    const y = H - 34;
    const gloss = ctx.createLinearGradient(x, y, x, y + 12);
    gloss.addColorStop(0, "#9bdcff");
    gloss.addColorStop(1, "#0071e3");
    ctx.save();
    ctx.shadowColor = "rgba(0,113,227,.4)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.roundRect(x, y, session.paddleW, 12, 8);
    ctx.fill();
    ctx.restore();
  }
  if (session.kind === "pinball") {
    ctx.save();
    ctx.strokeStyle = "rgba(0,113,227,.28)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const [x1, y1, x2, y2] of tableWalls()) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.lineWidth = 12;
    for (const side of ["left", "right"]) {
      const segment = flipper(side, side === "left" ? session.left : session.right);
      const gloss = ctx.createLinearGradient(segment.x1, segment.y1, segment.x2, segment.y2);
      gloss.addColorStop(0, "#64d2ff");
      gloss.addColorStop(1, "#0071e3");
      ctx.strokeStyle = gloss;
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(segment.x1, segment.y1, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (session.kind === "bbtan" && session.aiming) {
    const x2 = W / 2 + Math.cos(session.aim) * 92;
    const y2 = H - 24 + Math.sin(session.aim) * 92;
    ctx.save();
    ctx.strokeStyle = "rgba(0,113,227,.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(W / 2, H - 24);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#0071e3";
    ctx.beginPath();
    ctx.arc(W / 2, H - 24, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const left = session.chances;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.fillStyle = i < left ? "#0071e3" : "rgba(0,113,227,.2)";
      ctx.arc(18 + i * 16, H - 18, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const ball of session.balls) paintBall(ctx, ball);
}
