// internal-imports
import { indexing } from './modules/indexing.js';
import { querying } from './modules/querying.js';

async function init() {
  await indexing('./src/files');
  await querying('Tell me about Expo');
}

await init();
