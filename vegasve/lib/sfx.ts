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

// "Clack" de ficha de madera golpeando la mesa: ráfaga corta de ruido filtrada,
// reforzada con un golpe grave. Suena como un dominó real al colocarse.
function woodClack(gain = 0.32) {
  const c = ac();
  if (!c || muted) return;
  const dur = 0.07;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4); // decae rápido
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1700;
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(c.destination);
  src.start();
  // cuerpo grave del golpe
  beep(160, 55, "triangle", gain * 0.5);
}

// "Swish" de carta repartida: ráfaga corta de ruido agudo que decae.
function cardSwish(gain = 0.09, delayMs = 0) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + delayMs / 1000;
  const dur = 0.09;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2400;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(hp).connect(g).connect(c.destination);
  src.start(t0);
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
    woodClack();
  }, // ficha de dominó colocada (golpe de madera)
  card() {
    beep(180, 90, "triangle", 0.1);
  }, // carta colocada (póker/bingo)
  turn() {
    beep(880, 130, "sine", 0.09);
    beep(1175, 130, "sine", 0.07, 85);
  }, // tu turno
  win() {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, 300, "sine", 0.11, i * 105));
  }, // acorde ascendente
  chip() {
    // clink de fichas de póker: dos golpecitos metálicos cortos
    beep(2200, 45, "square", 0.05);
    beep(1650, 60, "square", 0.05, 35);
  },
  deal() {
    // reparto: varias cartas en ráfaga
    cardSwish(0.1, 0);
    cardSwish(0.09, 80);
    cardSwish(0.08, 160);
  },
  fold() {
    cardSwish(0.08, 0);
  }, // tirar las cartas
  check() {
    // toque en la mesa (dos golpes graves suaves)
    beep(150, 60, "triangle", 0.13);
    beep(120, 70, "triangle", 0.1, 95);
  },
};
