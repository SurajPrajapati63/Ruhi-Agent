import React from 'react';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
const ChatPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 h-[calc(100vh-64px)]">
        <div className="overflow-hidden flex flex-col h-full">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
