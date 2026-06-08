const { ChatOpenAI } = require("@langchain/openai");

const {
  HumanMessage,
  AIMessage,
  SystemMessage,
} = require("@langchain/core/messages");
const getRetriever = require("../rag/retriever");
const SYSTEM_PROMPT = require("../rag/prompt");

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const retriever = await getRetriever();

    let docs = [];

    if (typeof retriever.getRelevantDocuments === "function") {
      docs = await retriever.getRelevantDocuments(message);
    } else if (typeof retriever.retrieve === "function") {
      docs = await retriever.retrieve(message);
    } else if (typeof retriever.invoke === "function") {
      docs = await retriever.invoke(message);
    } else {
      throw new Error("Retriever does not support retrieval methods");
    }

    const context =
      docs
        .map((doc) => doc.pageContent || doc.text || "")
        .filter(Boolean)
        .join("\n\n") || "No relevant context available.";

    // GROQ MODEL
    const model = new ChatOpenAI({
      modelName: "llama-3.3-70b-versatile",

      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,

      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },

      temperature: 0.7,
    });

    const recentHistory = Array.isArray(history)
      ? history.slice(-12)
      : [];

    const messages = [
      new SystemMessage(`${SYSTEM_PROMPT}\n\nContext:\n${context}`),
    ];

    for (const item of recentHistory) {
      if (item.role === 'user') {
        messages.push(new HumanMessage(item.content));
      } else if (item.role === 'assistant') {
        messages.push(new AIMessage(item.content));
      }
    }

    messages.push(new HumanMessage(message));

    const response = await model.invoke(messages);

    const normalizedReply = response.content
      .replace(/Nova AI/g, 'Ruhi AI')
      .replace(/Nova\b/g, 'Ruhi');

    res.json({
      reply: normalizedReply,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }
};