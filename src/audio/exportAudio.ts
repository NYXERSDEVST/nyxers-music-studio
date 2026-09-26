import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Mp3Encoder } from 'lamejs';
import type { TrackProject, Album } from '../types';
import { scheduleArrangement } from './sequencer';

function applyMasterGain(buffer: AudioBuffer, project: TrackProject): AudioBuffer {
  // Simple peak normalize toward limiter ceiling
  const channels = buffer.numberOfChannels;
  let peak = 0;
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
  }
  const ceiling = Math.pow(10, project.master.limiterCeiling / 20);
  const target = peak > 0 ? ceiling / peak : 1;
  // Soft saturation
  const sat = project.master.saturation;
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      let s = data[i] * target * 0.95;
      if (sat > 0.01) {
        s = Math.tanh(s * (1 + sat * 2)) / Math.tanh(1 + sat * 2);
      }
      data[i] = Math.max(-ceiling, Math.min(ceiling, s));
    }
  }
  return buffer;
}

export async function renderProject(
  project: TrackProject,
  options?: { maxBars?: number; sampleRate?: number },
): Promise<AudioBuffer> {
  const sampleRate = options?.sampleRate ?? 44100;
  const maxBars = options?.maxBars ?? project.durationBars;
  const beat = 60 / project.bpm;
  const durationSec = maxBars * 4 * beat + 1.5;

  const offline = new OfflineAudioContext(2, Math.ceil(durationSec * sampleRate), sampleRate);
  scheduleArrangement(offline, project, 0.05, maxBars);
  let rendered = await offline.startRendering();
  rendered = applyMasterGain(rendered, project);
  return rendered;
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const samples = buffer.length;
  const dataSize = samples * blockAlign;
  const headerSize = 44;
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function audioBufferToMp3(buffer: AudioBuffer, kbps = 192): Blob {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const left = buffer.getChannelData(0);
  const right = channels > 1 ? buffer.getChannelData(1) : left;

  const encoder = new Mp3Encoder(2, sampleRate, kbps);
  const blockSize = 1152;
  const mp3Data: Int8Array[] = [];

  const toInt16 = (f32: Float32Array, start: number, len: number): Int16Array => {
    const out = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, f32[start + i] ?? 0));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };

  for (let i = 0; i < left.length; i += blockSize) {
    const len = Math.min(blockSize, left.length - i);
    const leftChunk = toInt16(left, i, len);
    const rightChunk = toInt16(right, i, len);
    const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(new Int8Array(mp3buf));
  }
  const end = encoder.flush();
  if (end.length > 0) mp3Data.push(new Int8Array(end));

  return new Blob(mp3Data as BlobPart[], { type: 'audio/mpeg' });
}

export async function downloadWav(project: TrackProject, maxBars?: number): Promise<void> {
  const buf = await renderProject(project, { maxBars });
  const blob = audioBufferToWav(buf);
  saveAs(blob, `${sanitize(project.title)}.wav`);
}

export async function downloadMp3(project: TrackProject, maxBars?: number): Promise<void> {
  const buf = await renderProject(project, { maxBars });
  const blob = audioBufferToMp3(buf);
  saveAs(blob, `${sanitize(project.title)}.mp3`);
}

export function downloadProjectJson(project: TrackProject): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  saveAs(blob, `${sanitize(project.title)}.nyxers.json`);
}

export async function downloadAlbumZip(
  album: Album,
  projects: TrackProject[],
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(sanitize(album.title))!;
  folder.file(
    'album.json',
    JSON.stringify(
      {
        title: album.title,
        artist: album.artist,
        year: album.year,
        coverNote: album.coverNote,
        tracks: album.trackIds,
      },
      null,
      2,
    ),
  );

  let idx = 1;
  for (const id of album.trackIds) {
    const p = projects.find((x) => x.id === id);
    if (!p) continue;
    const buf = await renderProject(p);
    const mp3 = audioBufferToMp3(buf);
    const name = `${String(idx).padStart(2, '0')} - ${sanitize(p.title)}.mp3`;
    folder.file(name, mp3);
    idx++;
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${sanitize(album.title)}.zip`);
}

function sanitize(name: string): string {
  return name.replace(/[^\w\s\-àáäâèéëêìíïîòóöôùúüûñçÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇ]/gi, '').trim() || 'track';
}
