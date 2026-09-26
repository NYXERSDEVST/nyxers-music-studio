import type { KickParams, RollPattern } from '../types';

/** Synthesize a single gabber/uptempo-style kick into an AudioContext / OfflineAudioContext */
export function scheduleKick(
  ctx: BaseAudioContext,
  time: number,
  params: KickParams,
  gain = 1,
): void {
  const dur = Math.max(0.08, params.decay);
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(params.distortion * 80 + 10) as never;
  shaper.oversample = '2x';

  osc.type = 'sine';
  osc.frequency.setValueAtTime(params.pitchStart, time);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(20, params.pitchEnd),
    time + dur * 0.55,
  );

  const peak = 0.9 * gain;
  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.exponentialRampToValueAtTime(peak, time + Math.max(0.0005, params.attack));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  if (params.click > 0.05) {
    const click = ctx.createOscillator();
    const clickG = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(800 + params.click * 1200, time);
    clickG.gain.setValueAtTime(params.click * 0.25 * gain, time);
    clickG.gain.exponentialRampToValueAtTime(0.0001, time + 0.012);
    click.connect(clickG);
    clickG.connect(ctx.destination);
    click.start(time);
    click.stop(time + 0.02);
  }

  if (params.subLevel > 0.05) {
    const sub = ctx.createOscillator();
    const subG = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(params.pitchEnd * 0.9, time);
    subG.gain.setValueAtTime(0.0001, time);
    subG.gain.exponentialRampToValueAtTime(params.subLevel * 0.5 * gain, time + 0.01);
    subG.gain.exponentialRampToValueAtTime(0.0001, time + dur * 1.1);
    sub.connect(subG);
    subG.connect(ctx.destination);
    sub.start(time);
    sub.stop(time + dur * 1.2);
  }

  osc.connect(shaper);

  if (params.bitcrush > 0.1) {
    const crush = ctx.createWaveShaper();
    crush.curve = makeBitcrushCurve(2 + Math.floor(params.bitcrush * 10)) as never;
    shaper.connect(crush);
    crush.connect(gainNode);
  } else {
    shaper.connect(gainNode);
  }

  gainNode.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 44100;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  const k = amount;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function makeBitcrushCurve(bits: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  const steps = Math.pow(2, bits);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.round(x * steps) / steps;
  }
  return curve;
}

/** Generate roll hit times relative to bar start (seconds) */
export function rollHitOffsets(pattern: RollPattern, barDuration: number): number[] {
  if (pattern === 'none' || pattern === 'drop') return [];
  const hits: number[] = [];
  if (pattern === 'build') {
    for (let i = 0; i < 4; i++) hits.push((i / 4) * barDuration);
    for (let i = 0; i < 4; i++) hits.push(barDuration * 0.5 + (i / 8) * barDuration * 0.5);
  } else if (pattern === 'accel') {
    const third = barDuration / 3;
    for (let i = 0; i < 2; i++) hits.push(i * (third / 2));
    for (let i = 0; i < 4; i++) hits.push(third + i * (third / 4));
    for (let i = 0; i < 8; i++) hits.push(2 * third + i * (third / 8));
  } else if (pattern === 'stutter') {
    for (let i = 0; i < 16; i++) {
      if (i % 3 !== 2) hits.push((i / 16) * barDuration);
    }
  }
  return hits.filter((t) => t < barDuration - 0.01);
}

export function previewKick(params: KickParams): void {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  scheduleKick(ctx, ctx.currentTime + 0.05, params, 1);
  setTimeout(() => void ctx.close(), 800);
}
