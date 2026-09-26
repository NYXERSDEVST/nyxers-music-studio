import type { ArrangementBlock, TrackProject } from '../types';
import { scheduleKick, rollHitOffsets } from './kickEngine';

export interface PlayHandle {
  stop: () => void;
  ctx: AudioContext;
}

function noteFreq(key: string, semitoneOffset: number): number {
  // Approximate root from key string like "A minor"
  const rootMap: Record<string, number> = {
    C: 261.63, D: 293.66, E: 329.63, F: 349.23, 'F#': 369.99, G: 392.0, A: 440.0, B: 493.88,
  };
  const rootName = key.split(' ')[0];
  const base = rootMap[rootName] ?? 440;
  return base * Math.pow(2, semitoneOffset / 12);
}

function scheduleHat(ctx: BaseAudioContext, time: number, gain = 0.15): void {
  const bufSize = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'highpass';
  bp.frequency.value = 8000;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(time);
}

function scheduleScreech(ctx: BaseAudioContext, time: number, freq: number, dur = 0.4): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const sh = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = Math.tanh(x * 4);
  }
  sh.curve = curve as never;
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + dur);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(0.12, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(sh);
  sh.connect(g);
  g.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function scheduleLead(
  ctx: BaseAudioContext,
  time: number,
  freq: number,
  dur: number,
  gain = 0.1,
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 2000;
  osc.connect(filt);
  filt.connect(g);
  g.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

function scheduleRiser(ctx: BaseAudioContext, time: number, dur: number): void {
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (i / bufSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(200, time);
  bp.frequency.exponentialRampToValueAtTime(6000, time + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.05, time);
  g.gain.linearRampToValueAtTime(0.2, time + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(time);
}

function scheduleBass(ctx: BaseAudioContext, time: number, freq: number, dur: number): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq / 2;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(0.2, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.9);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur);
}

function schedulePad(ctx: BaseAudioContext, time: number, freq: number, dur: number): void {
  const freqs = [freq, freq * 1.25, freq * 1.5];
  for (const f of freqs) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f / 2;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.04, time + 0.3);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }
}

const MINOR_RIFF = [0, 3, 7, 8, 7, 3, 0, -2];

export function scheduleArrangement(
  ctx: BaseAudioContext,
  project: TrackProject,
  startTime: number,
  maxBars?: number,
): number {
  const beat = 60 / project.bpm;
  const barDur = beat * 4;
  let barIndex = 0;
  let t = startTime;
  const totalBars = maxBars ?? project.durationBars;
  const kick = project.kick;

  for (const block of project.arrangement) {
    for (let b = 0; b < block.bars; b++) {
      if (barIndex >= totalBars) return t - startTime;
      const barStart = t;
      const energy = block.energy;

      // Kick patterns
      if (block.kickPattern === 'four') {
        for (let i = 0; i < 4; i++) {
          scheduleKick(ctx, barStart + i * beat, kick, 0.85 * energy);
        }
      } else if (block.kickPattern === 'half') {
        scheduleKick(ctx, barStart, kick, 0.9 * energy);
        scheduleKick(ctx, barStart + beat * 2, kick, 0.75 * energy);
      } else if (block.kickPattern === 'roll' && block.rollPattern) {
        const offsets = rollHitOffsets(block.rollPattern, barDur);
        for (const off of offsets) {
          scheduleKick(ctx, barStart + off, kick, 0.7 * energy);
        }
      } else if (block.kickPattern === 'drop') {
        // silence then impact at end
        if (b === block.bars - 1) {
          scheduleKick(ctx, barStart + barDur - 0.05, { ...kick, pitchStart: kick.pitchStart * 1.2 }, 1);
        }
      }

      // Hats
      if (block.hatDense) {
        const steps = 8;
        for (let i = 0; i < steps; i++) {
          scheduleHat(ctx, barStart + (i / steps) * barDur, 0.08 * energy * (i % 2 === 0 ? 1 : 0.6));
        }
      } else if (block.kickPattern !== 'silence') {
        scheduleHat(ctx, barStart + beat, 0.1 * energy);
        scheduleHat(ctx, barStart + beat * 3, 0.08 * energy);
      }

      // Lead riff
      if (block.lead) {
        const step = barDur / 8;
        for (let i = 0; i < 8; i++) {
          const semi = MINOR_RIFF[i % MINOR_RIFF.length];
          const f = noteFreq(project.key, semi);
          scheduleLead(ctx, barStart + i * step, f, step * 0.85, 0.07 * energy);
        }
      }

      // Bass on downbeats
      if (block.kickPattern !== 'silence') {
        scheduleBass(ctx, barStart, noteFreq(project.key, 0), beat * 1.5);
        if (block.energy > 0.5) {
          scheduleBass(ctx, barStart + beat * 2, noteFreq(project.key, -5), beat * 1.2);
        }
      }

      // Screech
      if (block.screech && b % 2 === 0) {
        scheduleScreech(ctx, barStart + beat * 0.5, noteFreq(project.key, 19), 0.35);
      }

      // Riser on last bars of build
      if (block.riser && b === block.bars - 1) {
        scheduleRiser(ctx, barStart, barDur);
      }

      // Pad on softer sections
      if ((block.section === 'intro' || block.section === 'bridge' || block.section === 'outro') && b === 0) {
        schedulePad(ctx, barStart, noteFreq(project.key, 0), barDur * Math.min(4, block.bars));
      }

      t += barDur;
      barIndex++;
    }
  }
  return t - startTime;
}

export function playPreview(project: TrackProject, bars = 16): PlayHandle {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const start = ctx.currentTime + 0.08;
  scheduleArrangement(ctx, project, start, bars);
  return {
    ctx,
    stop: () => {
      ctx.close().catch(() => undefined);
    },
  };
}

export function blockDurationSec(block: ArrangementBlock, bpm: number): number {
  return (block.bars * 4 * 60) / bpm;
}
