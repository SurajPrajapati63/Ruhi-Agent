const {
  HuggingFaceTransformersEmbeddings,
} = require("@langchain/community/embeddings/hf_transformers");

const {
  MongoDBAtlasVectorSearch,
} = require("@langchain/community/vectorstores/mongodb_atlas");

const mongoose = require("mongoose");

async function getRetriever() {

  const collection =
    mongoose.connection.collection("vectors");

  // FREE LOCAL EMBEDDINGS
  const embeddings =
    new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });

  const vectorStore =
    new MongoDBAtlasVectorSearch(
      embeddings,
      {
        collection,

        indexName: "vector_index",

        textKey: "text",

        embeddingKey: "embedding",
      }
    );

  return vectorStore.asRetriever();
}

module.exports = getRetriever;