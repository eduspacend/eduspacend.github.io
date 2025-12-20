
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth, useConfig } from '../App';
import { Role, Quiz, QuizType } from '../types';
import { GoogleGenAI } from '@google/genai';

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const { courses, user } = useAuth();
  const { settings } = useConfig();
  
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'QUIZ'>('CONTENT');
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  
  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [quizResults, setQuizResults] = useState<Record<string, { score: number, feedback: string, status: 'CORRECT' | 'WRONG' | 'GRADED' }>>({});
  const [isGrading, setIsGrading] = useState<string | null>(null);

  const course = courses.find(c => c.id === id);
  if (!course) return <Navigate to="/" />;

  const canAccess = !course.isVip || (user && [Role.ADMIN, Role.DEVELOPER, Role.VIP].includes(user.role));

  if (!canAccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-xl text-center bg-white p-12 rounded-[3rem] shadow-xl border border-blue-50">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-3xl font-black mb-4 text-slate-900 tracking-tight">Khu vực dành cho VIP</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium">Khóa học "{course.title}" chứa các nội dung chuyên sâu và bài tập có AI chấm điểm. Hãy nâng cấp để bắt đầu hành trình!</p>
          <div className="flex justify-center space-x-4">
             <Link to="/" className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Quay lại</Link>
             <button className="px-8 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all" style={{ backgroundColor: settings.primaryColor }}>Nâng cấp ngay</button>
          </div>
        </div>
      </div>
    );
  }

  const handleGradeQuiz = async (quiz: Quiz) => {
    const answer = userAnswers[quiz.id];
    if (answer === undefined || answer === '') return alert('Vui lòng hoàn thành câu trả lời!');

    if (quiz.type === 'MULTIPLE_CHOICE' || quiz.type === 'TRUE_FALSE') {
      const isCorrect = answer === quiz.correctAnswer;
      setQuizResults(prev => ({ 
        ...prev, 
        [quiz.id]: { 
          score: isCorrect ? 10 : 0, 
          feedback: isCorrect ? 'Chính xác! Bạn đã hiểu bài rất tốt.' : 'Chưa đúng rồi. Hãy xem lại bài giảng nhé!',
          status: isCorrect ? 'CORRECT' : 'WRONG'
        } 
      }));
    } else if (quiz.type === 'SHORT_ANSWER') {
      const isCorrect = answer.toString().trim() === quiz.correctAnswer?.toString().trim();
      setQuizResults(prev => ({ 
        ...prev, 
        [quiz.id]: { 
          score: isCorrect ? 10 : 0, 
          feedback: isCorrect ? 'Tuyệt vời! Con số hoàn toàn chính xác.' : `Đáp án đúng là: ${quiz.correctAnswer}`,
          status: isCorrect ? 'CORRECT' : 'WRONG'
        } 
      }));
    } else if (quiz.type === 'ESSAY') {
      setIsGrading(quiz.id);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Bạn là một giáo viên chuyên nghiệp. Hãy chấm điểm bài tự luận của học sinh sau đây.
        Câu hỏi: "${quiz.question}"
        Hướng dẫn chấm/Đáp án mẫu: "${quiz.explanation}"
        Bài làm của học sinh: "${answer}"
        
        Yêu cầu:
        1. Chấm điểm trên thang 10.
        2. Đưa ra nhận xét ngắn gọn, khích lệ (Tiếng Việt).
        3. Trả về định dạng JSON: {"score": number, "feedback": "string"}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const result = JSON.parse(response.text);
        setQuizResults(prev => ({ 
          ...prev, 
          [quiz.id]: { score: result.score, feedback: result.feedback, status: 'GRADED' } 
        }));
      } catch (e) {
        alert('Lỗi kết nối AI chấm điểm!');
      } finally {
        setIsGrading(null);
      }
    }
  };

  const currentLesson = course.lessons[activeLessonIdx];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50/50 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 bg-white border-r border-slate-100 flex flex-col shrink-0">
         <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate">{course.title}</h3>
            <div className="mt-4 flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
               <button 
                onClick={() => setActiveTab('CONTENT')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'CONTENT' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
               >Học tập</button>
               <button 
                onClick={() => setActiveTab('QUIZ')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'QUIZ' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
               >Bài tập ({course.quizzes?.length || 0})</button>
            </div>
         </div>

         <div className="flex-grow overflow-y-auto no-scrollbar">
            {activeTab === 'CONTENT' ? (
              <div className="p-4 space-y-2">
                {course.lessons.map((l, i) => (
                  <button 
                    key={l.id} 
                    onClick={() => setActiveLessonIdx(i)}
                    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all group ${activeLessonIdx === i ? 'bg-blue-600 text-white shadow-xl translate-x-1' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-50'}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${activeLessonIdx === i ? 'bg-white/20' : 'bg-slate-100'}`}>{i + 1}</span>
                    <span className="text-[11px] font-bold truncate leading-none">{l.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-4">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                 </div>
                 <h4 className="text-xs font-black text-slate-900 uppercase">Hệ thống bài tập</h4>
                 <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Hãy hoàn thành bài giảng trước khi làm bài tập để đạt kết quả tốt nhất!</p>
              </div>
            )}
         </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-grow overflow-y-auto p-4 md:p-12 scroll-smooth">
        {activeTab === 'CONTENT' ? (
          <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            {currentLesson?.videoUrl && (
              <div className="aspect-video rounded-[3rem] overflow-hidden bg-black shadow-2xl border-4 border-white">
                <iframe className="w-full h-full" src={currentLesson.videoUrl} title="Lesson Video" frameBorder="0" allowFullScreen />
              </div>
            )}
            <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-sm border border-slate-100">
              <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight leading-tight">{currentLesson?.title}</h1>
              <div 
                className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed custom-content" 
                dangerouslySetInnerHTML={{ __html: currentLesson?.content || '' }} 
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-right-10 duration-700 pb-20">
             <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kiểm tra kiến thức</h2>
                <div className="flex items-center justify-center gap-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gemini AI Graded Enabled</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
             </div>

             {course.quizzes?.map((q, i) => (
               <div key={q.id} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8 relative overflow-hidden group">
                  {quizResults[q.id] && (
                    <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-[2rem] text-[10px] font-black uppercase tracking-widest text-white shadow-lg z-10 animate-in slide-in-from-top-4 duration-500 ${quizResults[q.id].status === 'CORRECT' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                       Điểm: {quizResults[q.id].score}/10
                    </div>
                  )}

                  <div className="space-y-4">
                     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">Câu hỏi {i + 1}</span>
                     <p className="text-lg font-bold text-slate-900 leading-snug">{q.question}</p>
                  </div>

                  {/* MCQ / True False UI */}
                  {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {q.options?.map((opt, oIdx) => (
                         <button 
                           key={oIdx}
                           disabled={!!quizResults[q.id]}
                           onClick={() => setUserAnswers({ ...userAnswers, [q.id]: oIdx })}
                           className={`p-5 rounded-2xl text-left text-xs font-bold transition-all flex items-center gap-4 border ${userAnswers[q.id] === oIdx ? 'bg-slate-900 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-slate-50 text-slate-600 border-slate-50 hover:border-slate-200'}`}
                         >
                           <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${userAnswers[q.id] === oIdx ? 'bg-white/10' : 'bg-white border border-slate-100 text-slate-400'}`}>
                             {String.fromCharCode(65 + oIdx)}
                           </span>
                           {opt}
                         </button>
                       ))}
                    </div>
                  )}

                  {/* Short Answer UI */}
                  {q.type === 'SHORT_ANSWER' && (
                    <div className="space-y-4">
                       <input 
                         disabled={!!quizResults[q.id]}
                         maxLength={4}
                         className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center text-3xl font-black font-mono focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                         placeholder="_ _ _ _"
                         value={userAnswers[q.id] || ''}
                         onChange={e => setUserAnswers({ ...userAnswers, [q.id]: e.target.value.replace(/[^0-9.,]/g, '') })}
                       />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Tối đa 4 ký tự (Số, dấu chấm, dấu phẩy)</p>
                    </div>
                  )}

                  {/* Essay UI */}
                  {q.type === 'ESSAY' && (
                    <div className="space-y-4">
                       <textarea 
                         disabled={!!quizResults[q.id]}
                         className="w-full p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 min-h-[200px] outline-none text-sm font-bold leading-relaxed focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                         placeholder="Trình bày bài làm của bạn tại đây..."
                         value={userAnswers[q.id] || ''}
                         onChange={e => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                       />
                    </div>
                  )}

                  {/* Feedback Display */}
                  {quizResults[q.id] && (
                    <div className={`p-8 rounded-[2.5rem] border animate-in zoom-in-95 duration-700 ${quizResults[q.id].status === 'CORRECT' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : quizResults[q.id].status === 'WRONG' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                       <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${quizResults[q.id].status === 'CORRECT' ? 'bg-emerald-400' : quizResults[q.id].status === 'WRONG' ? 'bg-red-400' : 'bg-blue-400'}`}>
                             {quizResults[q.id].status === 'CORRECT' ? '✓' : quizResults[q.id].status === 'WRONG' ? '✕' : '✎'}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{quizResults[q.id].status === 'GRADED' ? 'AI Review' : 'Hệ thống'}</span>
                       </div>
                       <p className="text-sm font-bold leading-relaxed">{quizResults[q.id].feedback}</p>
                    </div>
                  )}

                  {!quizResults[q.id] && (
                    <button 
                      onClick={() => handleGradeQuiz(q)}
                      disabled={isGrading === q.id}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {isGrading === q.id ? 'Gemini AI đang chấm điểm...' : 'Nộp bài và Chấm điểm'}
                    </button>
                  )}
               </div>
             ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-content h1 { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin-bottom: 2rem; }
        .custom-content h2 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-top: 3rem; }
        .custom-content p { line-height: 1.8; margin-bottom: 1.5rem; color: #475569; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CourseDetail;
