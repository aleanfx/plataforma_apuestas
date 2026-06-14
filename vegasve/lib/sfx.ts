// Efectos de sonido sintetizados con Web Audio (sin archivos de audio).
// Respeta un interruptor de silencio persistido en localStorage.

let ctx: AudioContext | null = null;
let muted = false;

if (typeof window !== "undefined") {
  muted = window.localStorage.getItem("bmp_muted") === "1";
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq: number, durMs: number, type: OscillatorType = "sine", gain = 0.12, delayMs = 0) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + delayMs / 1000;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durMs / 1000 + 0.03);
}

export const sfx = {
  isMuted() {
    return muted;
  },
  setMuted(m: boolean) {
    muted = m;
    if (typeof window !== "undefined") window.localStorage.setItem("bmp_muted", m ? "1" : "0");
    if (!m) beep(660, 90, "sine", 0.07);
  },
  toggle() {
    this.setMuted(!muted);
    return muted;
  },
  /** Desbloquea el AudioContext tras un gesto del usuario (autoplay policy). */
  unlock() {
    ac();
  },
  call() {
    beep(720, 120, "sine", 0.09);
  }, // número cantado
  place() {
    beep(180, 90, "triangle", 0.1);
  }, // ficha / carta colocada
  turn() {
    beep(880, 130, "sine", 0.09);
    beep(1175, 130, "sine", 0.07, 85);
  }, // tu turno
  win() {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, 300, "sine", 0.11, i * 105));
  }, // acorde ascendente
};
