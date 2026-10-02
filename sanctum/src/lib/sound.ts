let enabled = true
let ctx: AudioContext | null = null

export function setSoundEnabled(value: boolean) {
  enabled = value
}

export function primeSound() {
  if (!enabled || typeof window === 'undefined') return
  const Ctx = window.AudioContext
  if (!Ctx) return
  if (!ctx) ctx = new Ctx()
  if (ctx.state === 'suspended') void ctx.resume()
}

function context(): AudioContext | null {
  if (!enabled) return null
  primeSound()
  return ctx
}

export function wood(gain = 0.22) {
  const audio = context()
  if (!audio) return
  const duration = 0.07
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * duration), audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 5
  }
  const source = audio.createBufferSource()
  source.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1400 + Math.random() * 500
  const amp = audio.createGain()
  amp.gain.value = gain
  source.connect(filter)
  filter.connect(amp)
  amp.connect(audio.destination)
  source.start()
}

export function shakeSound() {
  ;[0, 90, 170, 280, 430].forEach((ms, index) => {
    window.setTimeout(() => wood(0.2 - index * 0.025), ms)
  })
}

export function bell() {
  const audio = context()
  if (!audio) return
  ;[528, 792, 1056].forEach((freq, index) => {
    const osc = audio.createOscillator()
    const amp = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = audio.currentTime + index * 0.015
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(0.05 / (index + 1), t + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 2.6)
    osc.connect(amp)
    amp.connect(audio.destination)
    osc.start(t)
    osc.stop(t + 2.7)
  })
}

export function tick() {
  const audio = context()
  if (!audio) return
  const osc = audio.createOscillator()
  const amp = audio.createGain()
  osc.type = 'triangle'
  osc.frequency.value = 660
  const t = audio.currentTime
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(0.03, t + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
  osc.connect(amp)
  amp.connect(audio.destination)
  osc.start(t)
  osc.stop(t + 0.2)
}
