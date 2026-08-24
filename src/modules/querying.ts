// internal-imports
import { vectorRetriever } from '../utils/vector.js';

// external-imports
import { OpenAI } from 'openai';

// create an instance of the OpenAI client
const openai = new OpenAI();

export async function querying(query: string) {
  // call the OpenAI API with the system prompt and query to get enhanced query
  const enhancedQuery = await openai.responses.create({
    model: 'gpt-4.1-mini',
    instructions: `You are expert in understanding what user is asking. Simple enhance the user query with more context and detalils. Don't answer the query, just enhance it and return output in text format.`,
    input: query,
  });

  // query the vector store for relevant documents based on the enhanced query
  const results = await vectorRetriever.invoke(enhancedQuery.output_text);

  // system prompt with the relevant documents
  const SYSTEM_PROMPT = `You are a retrieval answer formatter for subtitle-based documents.

  DOCUMENTS: ${results
    .map(d => JSON.stringify({ pageContent: d.pageContent, metadate: d.metadata }))
    .join('\n\n')}

  DOCUMENT STRUCTURE:
  - pageContent: The subtitle text/content.
  - metadata.file: The subtitle file from which the content came.
  - metadata.start: The starting timestamp of the relevant content in milliseconds.
  - metadata.end: The ending timestamp of the relevant content in milliseconds.

  RULES:
  - Answer the user's question using only the provided documents.
  - Carefully analyze all documents and identify every relevant piece of information.
  - Do not ignore relevant documents. Use multiple documents when necessary.
  - Your answer may contain multiple relevant segments from same or different files.
  - Keep start and end exactly as provided in the document metadata.
  - Do not invent information that is not present in the provided documents.
  - If the provided documents do not contain enough information to answer, say so.
  - Return the response in valid JSON only.

  OUTPUT_FORMAT:
  {
    "answer": <the answer to the user's question based on the provided documents>,
    "sources": [
      {
        "text": <the relevant text from pageContent that answers the user's question>,
        "start": <start timestamp in milliseconds>,
        "end": <end timestamp in milliseconds>,
        "file": <name of the subtitle file provided in the document metadata>,
      },
      {
        "text": <the relevant text from pageContent that answers the user's question>,
        "start": <start timestamp in milliseconds>,
        "end": <end timestamp in milliseconds>,
        "file": <name of the subtitle file provided in the document metadata>,
      }
    ]
  }

  EXAMPLE:
  - Query: "What is a vector database?"
  - If not present in the docs, return "Not enough information to answer query"
  - If present in docs,

  {
    "answer": "A vector database is a specialized database designed to store and manage high-dimensional vectors, which are often used in machine learning and AI applications. It allows for efficient similarity searches and retrieval of data based on vector representations.",
    "sources": [
      {
        "text": "A vector database is a specialized database designed to store and manage high-dimensional vectors, which are often used in machine learning and AI applications.",
        "start": 0,
        "end": 5000,
        "file": "vector_database_intro.srt",
      },
      {
        "text": "It allows for efficient similarity searches and retrieval of data based on vector representations.",
        "start": 5001,
        "end": 10000,
        "file": "vector_database_features.srt",
      }
    ]
  }`;

  // call the OpenAI API with the system prompt and enhanced query to get a response
  const stream = await openai.responses.create({
    model: 'gpt-4.1-mini',
    instructions: SYSTEM_PROMPT,
    input: enhancedQuery.output_text,
    stream: true,
  });

  // stream the response from the OpenAI API
  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') process.stdout.write(event.delta);
  }
}
