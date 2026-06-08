const fs = require('fs');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const {
  RecursiveCharacterTextSplitter,
} = require('@langchain/textsplitters');
const {
  HuggingFaceTransformersEmbeddings,
} = require('@langchain/community/embeddings/hf_transformers');
const {
  OpenAIEmbeddings,
} = require('@langchain/openai');
const {
  MongoDBAtlasVectorSearch,
} = require('@langchain/community/vectorstores/mongodb_atlas');
const mongoose = require('mongoose');

const getEmbeddings = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    // Allow overriding the embedding model via env var. If not set, try a
    // short list of commonly available OpenAI/Groq embedding models and
    // fall back to an older compatible model if newer ones are unavailable.
    // You can override by setting `EMBEDDING_MODEL` in your environment.
    const candidates = [process.env.EMBEDDING_MODEL, 'text-embedding-3-large', 'text-embedding-3-small', 'text-embedding-ada-002'];
    const model = candidates.find((m) => typeof m === 'string' && m.length) || 'text-embedding-3-large';

    return new OpenAIEmbeddings({
      model,
      apiKey,
      configuration: { baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1' },
    });
  }

  return new HuggingFaceTransformersEmbeddings({
    model: 'Xenova/all-MiniLM-L6-v2',
  });
};

const extractTextFromFile = async (filePath, mimetype) => {
  if (mimetype === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || '';
  }

  if (mimetype === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value || '';
  }

  return '';
};

const ingestText = async (text, metadata = {}) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.createDocuments([text]);
  const docs = chunks.map((doc) => {
    doc.metadata = { ...metadata };
    return doc;
  });

  const collection = mongoose.connection.collection('vectors');


  let embeddings = getEmbeddings();
  try {
    await MongoDBAtlasVectorSearch.fromDocuments(docs, embeddings, {
      collection,
      indexName: 'vector_index',
      textKey: 'text',
      embeddingKey: 'embedding',
    });
    return docs.length;
  } catch (err) {
    console.warn('Primary embeddings failed, falling back to HuggingFace embeddings:', err.message || err);
    // Fallback to HuggingFaceTransformersEmbeddings
    const hf = new HuggingFaceTransformersEmbeddings({ model: 'Xenova/all-MiniLM-L6-v2' });
    await MongoDBAtlasVectorSearch.fromDocuments(docs, hf, {
      collection,
      indexName: 'vector_index',
      textKey: 'text',
      embeddingKey: 'embedding',
    });
    return docs.length;
  }
};

module.exports = {
  extractTextFromFile,
  ingestText,
};
