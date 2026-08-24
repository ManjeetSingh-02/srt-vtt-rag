// internal-imports
import { createSubtitleChunks, parseSubtitleFile } from '../utils/subtitle.js';
import { getDocumentsFromChunks } from '../utils/document.js';
import { vectorStore } from '../utils/vector.js';
import type { SubtitleChunk } from '../types/subtitle.js';

// external-imports
import fs from 'fs/promises';
import path from 'path';

export async function indexing(directory: string) {
  // get all subtitle files in the directory
  const files = await Array.fromAsync(fs.glob(['**/*.srt', '**/*.vtt'], { cwd: directory }));

  // create an array to hold all subtitle chunks
  const chunks: SubtitleChunk[] = [];

  // parse each subtitle file and create chunks
  for (const file of files) {
    const subtitles = await parseSubtitleFile(path.join(directory, file));
    const fileChunks = createSubtitleChunks(subtitles, file);
    chunks.push(...fileChunks);
  }

  // create documents from the subtitle chunks
  const documents = getDocumentsFromChunks(chunks);

  // add documents to the vector store in batches of 100
  for (let i = 0; i < documents.length; i += 100) {
    await vectorStore.addDocuments(documents.slice(i, i + 100));
  }
}
