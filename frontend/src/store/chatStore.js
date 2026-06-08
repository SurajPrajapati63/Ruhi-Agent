import create from 'zustand';
import { apiClient } from '../services/api';

const loadMessages = () => {
  try {
    const stored = window.localStorage.getItem('ruhi_chat_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMessages = (messages) => {
  try {
    window.localStorage.setItem('ruhi_chat_history', JSON.stringify(messages));
  } catch {
    // ignore storage failures
  }
};

export const useChatStore = create((set, get) => ({
  messages: loadMessages(),
  loading: false,
  error: null,
  fileHistory: [],
  fileLoading: false,

  sendMessage: async (message) => {
    try {
      set({ error: null, loading: true });
      
      const userMessage = { id: Date.now(), role: 'user', content: message, timestamp: new Date() };
      const history = get().messages;
      const updatedUserMessages = [...history, userMessage];
      saveMessages(updatedUserMessages);
      set({ messages: updatedUserMessages });

      const response = await apiClient.post('/chat', {
        message,
        history: history.map((msg) => ({ role: msg.role, content: msg.content })),
      });
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date(),
      };
      const updatedMessages = [...updatedUserMessages, assistantMessage];
      saveMessages(updatedMessages);
      set({ messages: updatedMessages, loading: false });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send message';
      set({ error: message, loading: false });
      throw error;
    }
  },

  uploadFile: async (file, noteOrProgress = '', onProgress) => {
    try {
      set({ error: null, loading: true });

      let note = '';
      let progressCallback = onProgress;
      if (typeof noteOrProgress === 'function') {
        progressCallback = noteOrProgress;
      } else {
        note = noteOrProgress || '';
      }

      const fileMessage = {
        id: Date.now(),
        role: 'user',
        content: `Uploaded file: ${file.name}${note ? ` - ${note}` : ''}`,
        timestamp: new Date(),
      };

      const currentMessages = get().messages;
      const updatedMessages = [...currentMessages, fileMessage];
      saveMessages(updatedMessages);
      set({ messages: updatedMessages });

      const formData = new FormData();
      formData.append(file.type.startsWith('image/') ? 'image' : 'file', file);
      if (note) {
        formData.append('note', note);
      }
      const uploadEndpoint = file.type.startsWith('image/') ? '/upload/image' : '/upload/file';

      const response = await apiClient.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressCallback) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressCallback(percent);
          }
        },
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        imageUrl: response.data.file?.url,
        analysis: response.data.file?.analysis,
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      saveMessages(finalMessages);
      set({ messages: finalMessages, loading: false });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to upload file';
      set({ error: message, loading: false });
      throw error;
    }
  },

  loadFileHistory: async () => {
    try {
      set({ fileLoading: true, error: null });
      const response = await apiClient.get('/upload/history');
      set({ fileHistory: response.data.files, fileLoading: false });
      return response.data.files;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load uploads';
      set({ error: message, fileLoading: false });
      throw error;
    }
  },

  deleteFile: async (id) => {
    try {
      set({ fileLoading: true, error: null });
      await apiClient.delete(`/upload/${id}`);
      const remaining = get().fileHistory.filter((file) => file._id !== id);
      set({ fileHistory: remaining, fileLoading: false });
      return remaining;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete upload';
      set({ error: message, fileLoading: false });
      throw error;
    }
  },

  clearMessages: () => {
    saveMessages([]);
    set({ messages: [] });
  },
  clearError: () => set({ error: null }),
}));
