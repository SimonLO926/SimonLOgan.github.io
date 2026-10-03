export const TEMPO = 112;
export const STEP = 60 / TEMPO / 2;

export const MIX = { music: 0.78, sfx: 1, lead: 0.34, bass: 0.24, blip: 0.55, clear: 0.48 };

export const LEAD = [
  64, 67, 72, 67, 69, 67, 64, null,
  72, 76, 79, 76, 72, null, 67, 64,
  69, 72, 76, 72, 69, 67, 64, null,
  62, 64, 67, 64, 60, null, null, 64,
];

export const BASS = [
  48, null, null, null, 48, null, null, null,
  43, null, null, null, 43, null, 48, null,
  45, null, null, null, 45, null, null, null,
  41, null, null, null, 48, null, null, null,
];

export function midi(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

export function clearPitches(rows) {
  const count = Math.max(1, Math.min(4, rows | 0));
  return [72, 76, 79, 84].slice(0, count);
}

export function tspinPitches() {
  return [70, 74, 79, 86];
}

export function comboPitches(combo) {
  const count = Math.max(2, Math.min(6, combo | 0));
  const root = 60 + Math.min(8, combo) * 2;
  return Array.from({ length: count }, (_, index) => root + index * 2);
}

export function sandPitches() {
  return [62, 67, 74];
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
      musicGain.gain.value = MIX.music;
      musicGain.connect(master);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = MIX.sfx;
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
    beep(freq, ctx.currentTime, dur, "square", MIX.blip, sfxGain);
  }

  function playClear(rows) {
    if (!ensure()) return;
    const pitches = clearPitches(rows);
    const start = ctx.currentTime;
    beep(midi(pitches[0] - 12), start, 0.28, "square", MIX.clear * 0.7, sfxGain);
    pitches.forEach((note, index) => {
      beep(midi(note), start + index * 0.07, 0.2, "square", MIX.clear, sfxGain);
    });
  }

  function playRun(notes, gap, dur, peak) {
    if (!ensure()) return;
    const start = ctx.currentTime;
    notes.forEach((note, index) => {
      beep(midi(note), start + index * gap, dur, "square", peak, sfxGain);
    });
  }

  function playTspin() {
    playRun(tspinPitches(), 0.045, 0.16, MIX.clear);
    if (!ctx) return;
    beep(midi(58), ctx.currentTime, 0.24, "square", MIX.clear * 0.65, sfxGain);
  }

  function playCombo(combo) {
    playRun(comboPitches(combo), 0.038, 0.09, Math.min(0.72, MIX.clear + combo * 0.03));
  }

  function playSand() {
    playRun(sandPitches(), 0.05, 0.12, MIX.clear * 0.8);
  }

  function playBoom() {
    if (!ensure()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.32);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.62, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
    const length = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    noise.connect(noiseGain);
    noiseGain.connect(sfxGain);
    noise.start(now);
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
      if (lead != null) beep(midi(lead), nextTime, STEP * 0.92, "square", MIX.lead, musicGain);
      if (bass != null) beep(midi(bass), nextTime, STEP * 1.7, "square", MIX.bass, musicGain);
      nextTime += STEP;
      step += 1;
    }
  }

  return { setVolume, blip, playClear, playBoom, playTspin, playCombo, playSand, start, restart, stop, tick, get playing() { return playing; } };
}
