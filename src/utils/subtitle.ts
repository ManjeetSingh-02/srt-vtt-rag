// internal-imports
import type { SubtitleChunk, Subtitle } from '../types/subtitle.js';

// external-imports
import { parse } from 'subtitle';
import fs from 'node:fs';

// function to parse subtitle files and return an array of Subtitle objects
export function parseSubtitleFile(filePath: string): Promise<Subtitle[]> {
  return new Promise((resolve, reject) => {
    const subtitles: Subtitle[] = [];
    fs.createReadStream(filePath)
      .pipe(parse())
      .on('data', subtitle => subtitles.push(subtitle))
      .on('end', () => resolve(subtitles))
      .on('error', reject);
  });
}

// function to create subtitle chunks from an array of Subtitle objects
export function createSubtitleChunks(subtitles: Subtitle[], file: string): SubtitleChunk[] {
  const chunks: SubtitleChunk[] = [];
  let currentChunk: SubtitleChunk | null = null;

  for (const subtitle of subtitles) {
    if (subtitle.type !== 'cue') continue;

    const text = subtitle.data.text.trim();
    if (!text) continue;

    const { start, end } = subtitle.data;

    if (!currentChunk) {
      currentChunk = { file, text, start, end };
      continue;
    }

    currentChunk.text += ` ${text}`;
    currentChunk.end = end;

    if (currentChunk.end - currentChunk.start >= 60_000) {
      chunks.push(currentChunk);
      currentChunk = null;
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}
