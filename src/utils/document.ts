// internal-imports
import type { SubtitleChunk } from '../types/subtitle.js';

// external-imports
import { Document } from '@langchain/core/documents';

// function to convert subtitle chunks into documents
export function getDocumentsFromChunks(chunks: SubtitleChunk[]): Document[] {
  return chunks.map(
    c =>
      new Document({ pageContent: c.text, metadata: { file: c.file, start: c.start, end: c.end } })
  );
}
