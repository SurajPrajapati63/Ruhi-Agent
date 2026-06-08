import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { FiSend, FiLoader, FiPaperclip } from 'react-icons/fi';
import Message from './Message';
import VoiceInput from './VoiceInput';

const ChatWindow = () => {
  const { messages, loading, sendMessage, uploadFile } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageText = input;
    setInput('');

    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const note = input.trim();
    const previousInput = input;

    try {
      await uploadFile(file, note);
      if (note) {
        setInput('');
      }
    } catch (error) {
      console.error(error);
      setInput(previousInput);
    } finally {
      event.target.value = null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-slate-100 text-xl mb-2">Start a Conversation</h2>
            <p className="max-w-xs text-center">Ask Ruhi AI anything about web development, AI, or your uploaded documents.</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-md w-fit mx-auto">
                <FiLoader className="animate-spin" size={24} />
                <span>Ruhi is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-slate-800 border-t border-slate-700  border-ruounded-b-md">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-3 items-center">
          <VoiceInput
            className="shrink-0"
            onTranscriptChange={setInput}
            onVoiceSubmit={async (value) => {
              setInput(value);
              if (!value.trim()) return;
              try {
                await sendMessage(value.trim());
              } catch (error) {
                console.error(error);
              } finally {
                setInput('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
            title="Attach file"
          >
            <FiPaperclip size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-md px-4 py-2 disabled:opacity-50"
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
