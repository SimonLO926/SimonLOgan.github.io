import { COLS, ROWS, brickCount, hitBrick } from "./logic.mjs";

export const CELL = 28;
export const W = COLS * CELL;
export const H = ROWS * CELL;

export function createSession(kind, grid, stage, random) {
  const speed = Math.min(460, 220 + (Math.max(1, stage) - 1) * 16);
  return {
    kind,
    grid,
    stage: Math.max(1, stage),
    random,
    prep: 1000,
    baseSpeed: speed,
    speed,
    cleared: 0,
    streak: 0,
    score: 0,
    paddleX: W / 2,
    paddleW: 88,
    aim: -Math.PI / 2,
    chances: kind === "bbtan" ? 3 : 1,
    balls: [],
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

function flipper(side, raised) {
  const left = side === "left";
  const pivotX = left ? 58 : W - 58;
  const pivotY = H - 42;
  const rest = left ? -0.4 : Math.PI + 0.4;
  const up = left ? -1.15 : Math.PI + 1.15;
  const angle = raised ? up : rest;
  const len = 74;
  return {
    x1: pivotX,
    y1: pivotY,
    x2: pivotX + Math.cos(angle) * len,
    y2: pivotY + Math.sin(angle) * len,
  };
}

function collideFlipper(ball, segment, kicking) {
  const { x1, y1, x2, y2 } = segment;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  const dist = Math.hypot(ball.x - qx, ball.y - qy);
  if (dist > ball.r + 5) return;
  const nx = (ball.x - qx) / (dist || 1);
  const ny = (ball.y - qy) / (dist || 1);
  const dot = ball.vx * nx + ball.vy * ny;
  ball.vx -= 2 * dot * nx;
  ball.vy -= 2 * dot * ny;
  if (kicking) ball.vy = Math.min(ball.vy, -340);
  ball.x = qx + nx * (ball.r + 6);
  ball.y = qy + ny * (ball.r + 6);
}

function stepBall(session, ball, dt) {
  if (ball.gravity) ball.vy += 760 * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
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
    collideFlipper(ball, flipper("left", session.left), session.left);
    collideFlipper(ball, flipper("right", session.right), session.right);
  }
  const limit = session.kind === "pinball" ? 520 : session.speed * 1.4;
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
    const tilt = (session.random() - 0.5) * 0.4;
    session.balls.push(makeBall(session, -Math.PI / 2 + tilt, W / 2, H - 96));
    session.launched = true;
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

export function drawSession(ctx, session, ink) {
  if (session.kind === "breakout") {
    ctx.fillStyle = ink;
    ctx.fillRect(session.paddleX - session.paddleW / 2, H - 30, session.paddleW, 12);
  }
  if (session.kind === "pinball") {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6;
    for (const side of ["left", "right"]) {
      const segment = flipper(side, side === "left" ? session.left : session.right);
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();
    }
  }
  if (session.kind === "bbtan" && session.aiming) {
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.moveTo(W / 2, H - 24);
    ctx.lineTo(W / 2 + Math.cos(session.aim) * 70, H - 24 + Math.sin(session.aim) * 70);
    ctx.stroke();
  }
  ctx.fillStyle = ink;
  for (const ball of session.balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
