import React, { useState } from 'react';
import { useAuth } from '../App';
import { GoogleGenAI } from '@google/genai';
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
      // Fix: Use process.env.API_KEY directly as required by the coding guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tạo 3 câu hỏi trắc nghiệm cho khóa học "${courses[0]?.title || 'Lập trình'}" bằng tiếng Việt dưới định dạng JSON.`,
      });
      // Fix: Access response.text as a property, not a method, as per @google/genai guidelines.
      setContent(prev => prev + "\n\n[GỢI Ý TỪ AI]:\n" + response.text);
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
        <h1 className="text-3xl font-bold text-slate-900">Developer Dashboard</h1>
        <p className="text-slate-500">Khu vực dành cho đội ngũ phát triển nội dung và kỹ thuật của ND Labs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
              Gửi đề xuất nội dung mới
            </h2>
            <form onSubmit={handleSubmitSuggestion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Loại đề xuất</label>
                <div className="flex space-x-4">
                  <button 
                    type="button" 
                    onClick={() => setSuggestionType('COURSE')}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${suggestionType === 'COURSE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    Khóa học mới
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSuggestionType('USER_REFORM')}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${suggestionType === 'USER_REFORM' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    Cải thiện người dùng
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chi tiết nội dung</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-[150px] focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Mô tả ý tưởng của bạn tại đây..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <button 
                  type="button"
                  onClick={generateQuizIdea}
                  disabled={isGenerating}
                  className="text-blue-600 font-semibold text-sm hover:underline flex items-center"
                >
                  {isGenerating ? 'Đang tạo...' : '✨ Gợi ý quiz bằng Gemini AI'}
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700"
                >
                  Gửi Admin duyệt
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-2">Hỗ trợ kỹ thuật</h3>
               <p className="text-slate-400 text-sm mb-6">Bạn có quyền truy cập vào các công cụ chỉnh sửa nội dung bài học. Hãy cẩn trọng khi thực hiện thay đổi.</p>
               <button className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold transition-all text-sm border border-white/20">Mở Trình Biên Tập Khóa Học</button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Đặc quyền Developer</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-slate-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Truy cập miễn phí toàn bộ VIP
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Biên tập nội dung & Quizzes
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Hỗ trợ Admin vận hành hệ thống
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <p className="text-xs text-blue-700 font-bold mb-2">LƯU Ý QUAN TRỌNG</p>
             <p className="text-xs text-blue-600/80 leading-relaxed">
               Các thay đổi trực tiếp lên nội dung khóa học sẽ được lưu log hệ thống. Mọi hành vi phá hoại sẽ bị Admin thu hồi quyền ngay lập tức.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevDashboard;