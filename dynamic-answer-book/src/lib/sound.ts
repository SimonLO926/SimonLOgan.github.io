let ctx: AudioContext | null = null
let enabled = false

function context() {
  const Ctx = window.AudioContext
  ctx ??= new Ctx()
  return ctx
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (on) primeAudio()
}

export function primeAudio() {
  if (!enabled) return
  const audio = context()
  if (audio.state === 'suspended') void audio.resume()
}

export function playRustle(strong = false) {
  if (!enabled || !ctx) return
  const audio = ctx
  const duration = strong ? 0.32 : 0.14
  const length = Math.floor(audio.sampleRate * duration)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    const t = i / length
    const env = Math.sin(Math.PI * t) * (1 - t)
    data[i] = (Math.random() * 2 - 1) * env
  }
  const source = audio.createBufferSource()
  source.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = strong ? 780 : 1500
  filter.Q.value = 0.55
  const gain = audio.createGain()
  gain.gain.value = strong ? 0.11 : 0.055
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  source.start()
}
