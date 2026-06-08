const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const mammoth = require('mammoth');
const FileModel = require('../models/file');
const {
  extractTextFromFile,
  ingestText,
} = require('../rag/ingest');
const OpenAI = require('openai');
const { ChatOpenAI } = require('@langchain/openai');
const {
  HumanMessage,
} = require('@langchain/core/messages');

const getModel = () => {
  return new ChatOpenAI({
    modelName: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    configuration: { baseURL: 'https://api.groq.com/openai/v1' },
    temperature: 0.3,
  });
};

const createFileEntry = async ({ userId, file, type, extractedText, ocrText, analysis, vectorCount, status, note = '' }) => {
  const url = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${path.basename(file.path)}`;
  const fileEntry = new FileModel({
    user: userId,
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    url,
    mimetype: file.mimetype,
    size: file.size,
    type,
    note,
    status,
    extractedText,
    ocrText,
    analysis,
    vectorCount,
  });
  return fileEntry.save();
};

const analyzeImage = async ({ file, ocrText }) => {
  try {
    const model = getModel();
    const imageUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${path.basename(file.path)}`;
    const prompt = `You are Ruhi AI. The user uploaded an image file named ${file.originalname} available at ${imageUrl}. Use the extracted OCR text below and the file metadata to generate:

- A short description of the image.
- A caption suitable for the image.
- An object detection summary or explanation of the scene.
- A short summary of any text content.

OCR Text:
${ocrText || 'No text was detected.'}
`;

    const response = await model.invoke([
      new HumanMessage(prompt),
    ]);

    return {
      description: response.content || 'Image uploaded successfully.',
      caption: response.content || 'Uploaded image.',
      objectDetection: response.content || 'Image analysis completed.',
      summary: response.content || 'No visible text detected.',
    };
  } catch (err) {
    console.warn('Image analysis failed, using fallback metadata', err.message || err);
    return {
      description: 'Image uploaded successfully. Image understanding is available.',
      caption: 'Uploaded image',
      objectDetection: 'Object detection is not available at the moment.',
      summary: ocrText || 'No text detected in the image.',
    };
  }
};

const runOCR = async (filePath) => {
  try {
    const result = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {},
    });
    return result.data.text || '';
  } catch (error) {
    console.warn('OCR failed:', error.message || error);
    return '';
  }
};

exports.uploadFileHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const note = req.body.note?.toString().trim() || '';
    const file = req.file;
    const extractedText = await extractTextFromFile(file.path, file.mimetype);
    const vectorCount = extractedText ? await ingestText(extractedText, { fileId: file.filename, fileName: file.originalname }) : 0;

    const fileEntry = await createFileEntry({
      userId: req.user.id,
      file,
      type: 'document',
      extractedText,
      ocrText: '',
      analysis: {
        description: 'Document indexed for semantic search.',
        caption: `Document uploaded: ${file.originalname}`,
        objectDetection: 'Not applicable for document uploads.',
        summary: extractedText ? extractedText.slice(0, 280) : '',
      },
      vectorCount,
      status: 'processed',
      note,
    });

    return res.json({
      message: note ? `Document '${file.originalname}' uploaded with note: ${note}` : `Document '${file.originalname}' uploaded and processed successfully.`,
      file: fileEntry,
    });
  } catch (error) {
    console.error('Document upload failed:', error);
    return res.status(500).json({ error: error.message || 'Document upload failed.' });
  }
};

exports.uploadImageHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const note = req.body.note?.toString().trim() || '';
    const file = req.file;
    const ocrText = await runOCR(file.path);
    const analysis = await analyzeImage({ file, ocrText });
    const vectorCount = ocrText ? await ingestText(ocrText, { fileId: file.filename, fileName: file.originalname, source: 'image' }) : 0;

    const fileEntry = await createFileEntry({
      userId: req.user.id,
      file,
      type: 'image',
      extractedText: '',
      ocrText,
      analysis,
      vectorCount,
      status: 'processed',
      note,
    });

    return res.json({
      message: note ? `Image '${file.originalname}' uploaded with note: ${note}` : `Image '${file.originalname}' uploaded and analyzed successfully.`,
      file: fileEntry,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return res.status(500).json({ error: error.message || 'Image upload failed.' });
  }
};

exports.uploadAudioHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio uploaded.' });
    }

    const file = req.file;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.path),
      model: 'whisper-1',
    });

    const transcriptText = transcription?.text || transcription?.transcript || '';

    const vectorCount = transcriptText ? await ingestText(transcriptText, { fileId: file.filename, fileName: file.originalname, source: 'audio' }) : 0;

    const userId = req.user && req.user.id ? req.user.id : null;

    const fileEntry = await createFileEntry({
      userId,
      file,
      type: 'audio',
      extractedText: transcriptText,
      ocrText: '',
      analysis: {
        description: 'Audio uploaded and transcribed.',
        caption: `Audio uploaded: ${file.originalname}`,
        objectDetection: 'Not applicable for audio.',
        summary: transcriptText ? transcriptText.slice(0, 280) : '',
      },
      vectorCount,
      status: 'processed',
    });

    return res.json({
      message: `Audio '${file.originalname}' transcribed successfully.`,
      transcript: transcriptText,
      file: fileEntry,
      vectorCount,
    });
  } catch (error) {
    console.error('Audio upload failed:', error);
    return res.status(500).json({ error: error.message || 'Audio upload failed.' });
  }
};

exports.getUploadHistory = async (req, res) => {
  try {
    const files = await FileModel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    console.error('Fetch history failed:', error);
    res.status(500).json({ error: error.message || 'Failed to load upload history.' });
  }
};

exports.deleteUpload = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    await FileModel.deleteOne({ _id: file._id });

    res.json({ message: 'Upload removed successfully.' });
  } catch (error) {
    console.error('Delete upload failed:', error);
    res.status(500).json({ error: error.message || 'Failed to delete upload.' });
  }
};
