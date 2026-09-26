import * as Tone from 'tone';
import type { KickParams, TrackProject } from '../types';
import { scheduleKick } from './kickEngine';

/** Ensure Tone audio context is running (user-gesture safe). */
export async function ensureToneStarted(): Promise<void> {
  await Tone.start();
}

/** Live kick hit via Tone-managed AudioContext + gabber kick synth. */
export async function toneKickHit(params: KickParams): Promise<void> {
  await ensureToneStarted();
  const ctx = Tone.getContext().rawContext as unknown as AudioContext;
  scheduleKick(ctx, ctx.currentTime + 0.02, params, 1);
}

/**
 * Short groove: gabber kicks on the shared Tone AudioContext
 * plus a Tone.NoiseSynth hat grid at project BPM.
 */
export async function toneGroovePreview(
  project: TrackProject,
  bars = 8,
): Promise<() => void> {
  await ensureToneStarted();
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.bpm.value = project.bpm;

  const ctx = Tone.getContext().rawContext as unknown as AudioContext;
  const beat = 60 / project.bpm;
  const start = ctx.currentTime + 0.1;
  const totalBeats = bars * 4;

  for (let i = 0; i < totalBeats; i++) {
    const t = start + i * beat;
    const isDown = i % 4 === 0;
    scheduleKick(ctx, t, project.kick, isDown ? 0.9 : 0.55);
  }

  const hat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
    volume: -18,
  }).toDestination();

  const loop = new Tone.Loop((time) => {
    hat.triggerAttackRelease('16n', time);
  }, '8n');
  loop.start(0);
  transport.start();

  const ms = bars * 4 * beat * 1000 + 200;
  const timer = window.setTimeout(() => {
    loop.stop();
    loop.dispose();
    hat.dispose();
    transport.stop();
    transport.cancel();
  }, ms);

  return () => {
    window.clearTimeout(timer);
    loop.stop();
    loop.dispose();
    hat.dispose();
    transport.stop();
    transport.cancel();
  };
}
