
import React, { useState } from 'react';
import { useAuth } from '../App';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../db';

const DevDashboard: React.FC = () => {
  const { user, courses, refreshData } = useAuth();
  const [suggestionType, setSuggestionType] = useState<'COURSE' | 'USER_REFORM'>('COURSE');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const suggestions = db.getSuggestions();
    const newSug = {
      id: Date.now().toString(),
      userId: user!.id,
      type: suggestionType as any,
      content: content,
      status: 'PENDING' as any
    };
    db.saveSuggestions([...suggestions, newSug]);
    setContent('');
    alert('Đề xuất của bạn đã được gửi tới Admin!');
    refreshData();
  };

  const generateQuizIdea = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Hãy tạo 3 câu hỏi trắc nghiệm chất lượng cao cho chủ đề: "${courses[0]?.title || 'Lập trình hiện đại'}". 
        Mỗi câu hỏi phải bao gồm 4 phương án lựa chọn và chỉ rõ phương án đúng. 
        Định dạng văn bản rõ ràng bằng tiếng Việt.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      
      const aiResponse = response.text;
      setContent(prev => prev + "\n\n--- Ý TƯỞNG QUIZ TỪ AI ---\n" + aiResponse);
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối với Gemini AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Developer Dashboard</h1>
        <p className="text-slate-500 font-medium">Khu vực dành cho đội ngũ phát triển nội dung và kỹ thuật của ND Labs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black mb-8 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-4"></span>
              Gửi đề xuất nội dung
            </h2>
            <form onSubmit={handleSubmitSuggestion} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại đề xuất</label>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setSuggestionType('COURSE')}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${suggestionType === 'COURSE' ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                  >
                    Khóa học mới
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSuggestionType('USER_REFORM')}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${suggestionType === 'USER_REFORM' ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                  >
                    Cải thiện User
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết nội dung</label>
                <textarea 
                  className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 outline-none text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[200px]"
                  placeholder="Mô tả ý tưởng của bạn tại đây..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button 
                  type="button"
                  onClick={generateQuizIdea}
                  disabled={isGenerating}
                  className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">✨</span>
                  {isGenerating ? 'Đang phân tích...' : 'Gợi ý Quiz bằng Gemini AI'}
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Gửi Admin duyệt
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-3">Hỗ trợ kỹ thuật AI</h3>
               <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-md">Tận dụng sức mạnh của Gemini 1.5 & 3 để tối ưu hóa quy trình làm việc. Chúng tôi đã tích hợp trợ lý AI vào mọi tính năng quan trọng.</p>
               <div className="flex gap-3">
                 <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all border border-white/10">Tài liệu API</button>
                 <button className="bg-blue-600 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all shadow-lg">Gửi Feedback</button>
               </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-20 -mt-20 rounded-full group-hover:bg-blue-600/20 transition-all duration-700"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 uppercase text-[9px] tracking-[0.2em]">Đặc quyền Developer</h3>
            <ul className="space-y-4">
              {[
                'Truy cập miễn phí toàn bộ VIP',
                'Biên tập nội dung & Quizzes',
                'Sử dụng các mô hình Gemini Pro',
                'Hỗ trợ Admin vận hành hệ thống'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-xs font-bold text-slate-600 gap-3">
                  <div className="w-5 h-5 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100">
             <p className="text-[10px] text-blue-700 font-black mb-3 uppercase tracking-widest">LƯU Ý AI</p>
             <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
               Mọi câu trả lời từ AI cần được kiểm tra kỹ trước khi xuất bản. AI hỗ trợ tăng tốc độ làm việc nhưng không thay thế hoàn toàn sự sáng tạo của con người.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevDashboard;
