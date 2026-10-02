export const sceneBus = {
  shaking: false,
  raised: -1,
  lidOpen: false,
  sun: 30,
  needle: 0.4,
  life: 0,
  pulse: 0,
}

export function resetRitualMotion() {
  sceneBus.shaking = false
  sceneBus.raised = -1
  sceneBus.lidOpen = false
  sceneBus.pulse = 0
}

export function pulseScene() {
  sceneBus.pulse = 1
}
