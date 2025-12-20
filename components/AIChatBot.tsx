
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useConfig, useAuth } from '../App';
import { marked } from 'marked';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { settings } = useConfig();
  const { user } = useAuth();
  
  // Tạo key lưu trữ dựa trên ID người dùng
  const storageKey = user ? `eduspace_chat_history_${user.id}` : 'eduspace_chat_history_guest';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Khởi tạo/Tải dữ liệu khi người dùng thay đổi hoặc component mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    let loadedSessions: ChatSession[] = [];
    
    if (saved) {
      try {
        loadedSessions = JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi parse lịch sử chat:", e);
      }
    }

    if (loadedSessions.length === 0) {
      const initial: ChatSession = {
        id: Date.now().toString(),
        title: 'Cuộc trò chuyện mới',
        messages: [{ role: 'model', text: `Xin chào ${user?.fullName || ''}! Tôi là **EduBot**, trợ lý AI của **EduSpace**. Tôi đã sẵn sàng hỗ trợ bạn học tập!` }],
        timestamp: Date.now()
      };
      loadedSessions = [initial];
    }

    setSessions(loadedSessions);
    setActiveSessionId(loadedSessions[0].id);
    setShowHistory(false);
  }, [user?.id, storageKey]);

  // Lưu dữ liệu vào localStorage mỗi khi sessions thay đổi
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, storageKey]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || { messages: [] };

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Cuộc trò chuyện mới',
      messages: [{ role: 'model', text: 'Bắt đầu phiên hỗ trợ mới. Bạn cần tôi giúp gì?' }],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowHistory(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Xóa lịch sử cuộc trò chuyện này?')) {
      const updated = sessions.filter(s => s.id !== id);
      if (updated.length === 0) {
        const reset: ChatSession = {
          id: Date.now().toString(),
          title: 'Cuộc trò chuyện mới',
          messages: [{ role: 'model', text: 'Chào mừng trở lại!' }],
          timestamp: Date.now()
        };
        setSessions([reset]);
        setActiveSessionId(reset.id);
      } else {
        setSessions(updated);
        if (activeSessionId === id) setActiveSessionId(updated[0].id);
      }
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa TOÀN BỘ lịch sử chat của tài khoản này?')) {
      localStorage.removeItem(storageKey);
      window.location.reload(); // Reset đơn giản nhất
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Cập nhật state tin nhắn người dùng ngay lập tức
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        let newTitle = s.title;
        if (s.title === 'Cuộc trò chuyện mới') {
          newTitle = userMessage.slice(0, 25) + (userMessage.length > 25 ? '...' : '');
        }
        return { 
          ...s, 
          title: newTitle,
          messages: [...s.messages, { role: 'user', text: userMessage }] 
        };
      }
      return s;
    }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: `System: Trả lời thân thiện bằng Tiếng Việt. User: ${userMessage}` }] }
        ],
        config: {
          systemInstruction: 'Bạn là EduBot, trợ lý học tập tận tâm của EduSpace.'
        }
      });

      const aiText = response.text || 'Tôi không thể trả lời lúc này.';
      
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, { role: 'model', text: aiText }] } 
          : s
      ));
    } catch (error) {
      console.error('Chat error:', error);
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, { role: 'model', text: 'Kết nối AI bị gián đoạn. Hãy thử lại sau.' }] } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="px-6 py-5 text-white flex items-center justify-between shrink-0" style={{ backgroundColor: settings.primaryColor }}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-white/20' : 'hover:bg-white/10'}`}
                title="Lịch sử"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </button>
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider leading-none mb-1">
                  {showHistory ? 'Lịch sử Chat' : 'EduBot AI'}
                </h3>
                <span className="text-[9px] opacity-80 font-bold uppercase tracking-widest">
                  {user ? `User: ${user.fullName.split(' ').pop()}` : 'Guest Mode'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {showHistory ? (
            /* History View */
            <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50 flex flex-col">
              <button 
                onClick={startNewChat}
                className="w-full p-4 mb-2 bg-white border border-dashed border-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
              >
                + Bắt đầu mới
              </button>
              
              <div className="flex-grow space-y-2 overflow-y-auto pr-1">
                {sessions.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => { setActiveSessionId(session.id); setShowHistory(false); }}
                    className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${activeSessionId === session.id ? 'bg-white border-blue-400 ring-2 ring-blue-500/5' : 'bg-white/60 border-slate-100 hover:border-slate-300'}`}
                  >
                    <p className="text-xs font-bold text-slate-700 truncate pr-8">{session.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                      {new Date(session.timestamp).toLocaleDateString('vi-VN')} • {session.messages.length} tin
                    </p>
                    <button 
                      onClick={(e) => deleteSession(e, session.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={clearAllHistory}
                className="mt-4 py-3 text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors border-t border-slate-200"
              >
                Xóa toàn bộ lịch sử
              </button>
            </div>
          ) : (
            /* Messages Body */
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-4 bg-slate-50/50 scroll-smooth">
              {activeSession.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] px-4 py-3 rounded-[1.2rem] text-sm shadow-sm transition-all animate-in slide-in-from-bottom-2 ${
                      msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: settings.primaryColor } : {}}
                  >
                    {msg.role === 'model' ? (
                      <div 
                        className="prose-chat"
                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                      />
                    ) : (
                      <p className="font-medium">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-5 py-3.5 rounded-[1.2rem] rounded-tl-none flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!showHistory && (
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input 
                type="text" 
                placeholder="Hỏi bất cứ điều gì..."
                className="flex-grow px-5 py-3.5 bg-slate-50 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 flex items-center justify-center text-white rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: settings.primaryColor, boxShadow: `0 10px 25px ${settings.primaryColor}30` }}
              >
                <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.25)] flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 relative overflow-hidden group"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <div className="relative">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default AIChatBot;
