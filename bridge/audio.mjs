export const TEMPO = 92;
export const STEP = 60 / TEMPO / 2;

export const LEAD = [
  64, null, 67, null, 69, null, 67, null,
  72, null, null, null, 71, null, 67, null,
  69, null, 65, null, 67, null, 64, null,
  62, null, 64, null, 60, null, null, null,
];

export const BASS = [
  48, null, null, null, null, null, null, null,
  41, null, null, null, null, null, 48, null,
  45, null, null, null, null, null, null, null,
  43, null, null, null, 48, null, null, null,
];

export function midi(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

export function clearPitches(rows) {
  const count = Math.max(1, Math.min(4, rows | 0));
  return [72, 76, 79, 84].slice(0, count);
}

export function createSound(getVolume) {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let playing = false;
  let nextTime = 0;
  let step = 0;

  function ensure() {
    if (typeof AudioContext === "undefined") return false;
    ctx ??= new AudioContext();
    if (!master) {
      master = ctx.createGain();
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.18;
      musicGain.connect(master);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.5;
      sfxGain.connect(master);
    }
    master.gain.value = Math.max(0, getVolume());
    if (ctx.state === "suspended") ctx.resume();
    return getVolume() > 0;
  }

  function setVolume() {
    if (master) master.gain.value = Math.max(0, getVolume());
  }

  function beep(freq, when, dur, type, peak, dest) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.03, dur));
    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + dur + 0.03);
  }

  function blip(freq, dur = 0.05) {
    if (!ensure()) return;
    beep(freq, ctx.currentTime, dur, "triangle", 0.18, sfxGain);
  }

  function playClear(rows) {
    if (!ensure()) return;
    const pitches = clearPitches(rows);
    const start = ctx.currentTime;
    beep(midi(pitches[0] - 12), start, 0.22, "triangle", 0.1, sfxGain);
    pitches.forEach((note, index) => {
      beep(midi(note), start + index * 0.07, 0.16, "square", 0.14, sfxGain);
    });
  }

  function mark() {
    if (typeof document !== "undefined") document.body.dataset.music = playing ? "on" : "off";
  }

  function start() {
    if (!ensure()) return;
    if (playing) return;
    playing = true;
    nextTime = ctx.currentTime + 0.02;
    mark();
  }

  function restart() {
    step = 0;
    playing = false;
    start();
  }

  function stop() {
    playing = false;
    mark();
  }

  function tick() {
    if (!playing || !ctx || getVolume() <= 0) return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.02;
    const horizon = ctx.currentTime + 0.28;
    while (nextTime < horizon) {
      const index = step % LEAD.length;
      const lead = LEAD[index];
      const bass = BASS[index];
      if (lead != null) beep(midi(lead), nextTime, STEP * 1.55, "triangle", 0.08, musicGain);
      if (bass != null) beep(midi(bass), nextTime, STEP * 3.4, "triangle", 0.06, musicGain);
      nextTime += STEP;
      step += 1;
    }
  }

  return { setVolume, blip, playClear, start, restart, stop, tick, get playing() { return playing; } };
}
