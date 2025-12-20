
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useConfig } from '../App';
import { Course, Lesson, Quiz, QuizType, Role } from '../types';
import { db } from '../db';
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';

const Studio: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, courses, refreshData } = useAuth();
  const { settings } = useConfig();
  
  const [activeTab, setActiveTab] = useState<'LESSON' | 'QUIZ'>('LESSON');
  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    thumbnail: 'https://picsum.photos/seed/new/800/450',
    isVip: false,
    lessons: [],
    quizzes: [],
    status: 'PUBLISHED'
  });

  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(-1);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAILabOpen, setIsAILabOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courseId) {
      const existing = courses.find(c => c.id === courseId);
      if (existing) setCourse(existing);
    }
  }, [courseId, courses]);

  useEffect(() => {
    if (activeTab === 'LESSON' && activeLessonIdx !== -1 && editorRef.current && course.lessons && course.lessons[activeLessonIdx]) {
      const newContent = course.lessons[activeLessonIdx].content;
      if (editorRef.current.innerHTML !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [activeLessonIdx, activeTab]);

  const handleSave = (status: 'PENDING' | 'PUBLISHED') => {
    if (!course.title) return alert('Vui lòng nhập tên khóa học!');
    const allCourses = db.getCourses();
    const newCourse: Course = { ...course as Course, id: course.id || `course-${Date.now()}`, authorId: user!.id, status };
    const updatedCourses = course.id ? allCourses.map(c => c.id === course.id ? newCourse : c) : [...allCourses, newCourse];
    db.saveCourses(updatedCourses);
    refreshData();
    alert('Đã lưu thành công!');
    if (status === 'PUBLISHED') navigate('/admin');
  };

  const addLesson = () => {
    const newLesson: Lesson = { id: `l-${Date.now()}`, title: 'Bài học mới', videoUrl: '', content: '<p>Bắt đầu viết nội dung tại đây...</p>' };
    setCourse({ ...course, lessons: [...(course.lessons || []), newLesson] });
    setActiveLessonIdx((course.lessons?.length || 0));
    setActiveTab('LESSON');
  };

  const addQuiz = (type: QuizType) => {
    const newQuiz: Quiz = {
      id: `q-${Date.now()}`,
      type,
      question: 'Câu hỏi mới?',
      options: type === 'MULTIPLE_CHOICE' ? ['A', 'B', 'C', 'D'] : type === 'TRUE_FALSE' ? ['Đúng', 'Sai'] : undefined,
      correctAnswer: type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' ? 0 : '',
      explanation: ''
    };
    setCourse({ ...course, quizzes: [...(course.quizzes || []), newQuiz] });
    setActiveTab('QUIZ');
  };

  const updateQuiz = (idx: number, data: Partial<Quiz>) => {
    const updated = [...(course.quizzes || [])];
    updated[idx] = { ...updated[idx], ...data };
    setCourse({ ...course, quizzes: updated });
  };

  const updateLessonContent = () => {
    if (activeLessonIdx === -1 || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const updatedLessons = [...(course.lessons || [])];
    if (updatedLessons[activeLessonIdx].content !== currentHtml) {
      updatedLessons[activeLessonIdx].content = currentHtml;
      setCourse({ ...course, lessons: updatedLessons });
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) { editorRef.current.focus(); updateLessonContent(); }
  };

  const insertBlock = (type: string) => {
    let html = '';
    switch (type) {
      case 'note':
        html = `<div class="p-6 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-2xl my-6"><p class="font-bold text-blue-800 text-sm mb-1 uppercase tracking-wider">Lưu ý quan trọng</p><p class="m-0 text-blue-700">Nội dung ghi chú của bạn...</p></div><p></p>`;
        break;
      case 'columns':
        html = `<div class="grid grid-cols-2 gap-8 my-8"><div class="p-4 border border-dashed border-slate-200 rounded-xl">Cột trái</div><div class="p-4 border border-dashed border-slate-200 rounded-xl">Cột phải</div></div><p></p>`;
        break;
      case 'code':
        html = `<pre class="p-6 bg-slate-900 rounded-2xl text-blue-300 font-mono text-xs my-6 overflow-x-auto"><code>// Nhập mã nguồn của bạn tại đây\nfunction helloWorld() {\n  console.log("Welcome to ND Labs");\n}</code></pre><p></p>`;
        break;
      case 'divider':
        html = `<hr class="my-10 border-none h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" /><p></p>`;
        break;
      case 'steps':
        html = `<div class="space-y-4 my-8"><div class="flex gap-4"><div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div><div class="pt-1 font-bold">Bước một: Mô tả bước làm</div></div><div class="flex gap-4"><div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div><div class="pt-1 font-bold">Bước hai: Mô tả bước làm tiếp theo</div></div></div><p></p>`;
        break;
    }
    execCommand('insertHTML', html);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 relative overflow-hidden">
      {/* Sidebar - Course & Structure */}
      <div className={`w-80 bg-white border-r border-slate-100 flex flex-col transition-all shadow-sm shrink-0 ${showSidebar ? '' : '-ml-80'}`}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h2 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Studio Pro</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Creator Engine v5.0</p>
           </div>
           <button onClick={() => setShowSidebar(false)} className="text-slate-300 hover:text-slate-900">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
           </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-8 no-scrollbar">
          {/* Blocks Library */}
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thư viện khối nội dung</label>
             <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'note', label: 'Ghi chú', icon: '📝' },
                  { id: 'columns', label: 'Chia cột', icon: '◫' },
                  { id: 'code', label: 'Mã nguồn', icon: '⌨️' },
                  { id: 'steps', label: 'Các bước', icon: '🔢' },
                  { id: 'divider', label: 'Dải ngăn', icon: '—' },
                ].map(block => (
                  <button 
                    key={block.id}
                    onClick={() => insertBlock(block.id)}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-400 hover:bg-white transition-all group"
                  >
                    <span className="text-lg mb-1 group-hover:scale-110 transition-transform">{block.icon}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{block.label}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="h-px bg-slate-50"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách bài học</label>
              <button onClick={addLesson} className="text-blue-600 text-[9px] font-black uppercase hover:underline">+ THÊM BÀI</button>
            </div>
            {course.lessons?.map((l, i) => (
              <button 
                key={l.id} 
                onClick={() => { setActiveLessonIdx(i); setActiveTab('LESSON'); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black transition-all border flex items-center gap-3 uppercase tracking-wider ${activeTab === 'LESSON' && activeLessonIdx === i ? 'bg-slate-900 text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
              >
                <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${activeTab === 'LESSON' && activeLessonIdx === i ? 'bg-white/20' : 'bg-slate-50'}`}>{i + 1}</span>
                <span className="truncate">{l.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-50 space-y-2">
          <button onClick={() => handleSave('PENDING')} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Lưu bản nháp</button>
          <button onClick={() => handleSave('PUBLISHED')} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Xuất bản khóa học</button>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {!showSidebar && (
           <button onClick={() => setShowSidebar(true)} className="absolute top-4 left-4 z-50 p-2 bg-white border border-slate-100 rounded-xl shadow-md text-slate-400 hover:text-slate-900">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
           </button>
        )}

        {activeTab === 'LESSON' && activeLessonIdx !== -1 ? (
          <div className="flex-grow flex flex-col h-full bg-white/50">
             {/* Dynamic Formatting Bar */}
             <div className="bg-white p-3 border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 gap-1">
                    {['h1', 'h2', 'h3'].map(h => (
                      <button key={h} onClick={() => execCommand('formatBlock', h)} className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm font-black text-slate-800 text-[10px] uppercase transition-all">{h}</button>
                    ))}
                  </div>
                  <div className="w-px h-6 bg-slate-100 mx-1"></div>
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 gap-1">
                    <button onClick={() => execCommand('bold')} className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm font-black text-slate-700 text-xs">B</button>
                    <button onClick={() => execCommand('italic')} className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm italic font-serif text-slate-700 text-xs">I</button>
                    <button onClick={() => execCommand('insertUnorderedList')} className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <button onClick={() => setActiveTab('QUIZ')} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Thiết lập Quiz</button>
                   <button onClick={() => setIsAILabOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all">AI Assistant</button>
                </div>
             </div>

             <div className="flex-grow overflow-y-auto p-12 lg:p-24 no-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                   <div className="space-y-4">
                      <input 
                        className="w-full text-5xl font-black outline-none bg-transparent placeholder-slate-200 text-slate-900 tracking-tighter" 
                        placeholder="Tiêu đề bài học..."
                        value={course.lessons![activeLessonIdx].title}
                        onChange={e => {
                           const updated = [...(course.lessons || [])];
                           updated[activeLessonIdx].title = e.target.value;
                           setCourse({ ...course, lessons: updated });
                        }}
                      />
                      <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </div>
                        <input 
                          className="flex-grow bg-transparent outline-none text-[10px] font-black text-slate-500 uppercase tracking-widest" 
                          placeholder="NHÚNG VIDEO (YOUTUBE, DRIVE, MP4...)"
                          value={course.lessons![activeLessonIdx].videoUrl}
                          onChange={e => {
                            const updated = [...(course.lessons || [])];
                            updated[activeLessonIdx].videoUrl = e.target.value;
                            setCourse({ ...course, lessons: updated });
                          }}
                        />
                      </div>
                   </div>

                   <div 
                     ref={editorRef} 
                     contentEditable 
                     onInput={updateLessonContent} 
                     className="prose prose-slate prose-xl max-w-none min-h-[800px] outline-none lesson-editor bg-white rounded-[3rem] p-16 md:p-24 shadow-sm border border-slate-100 relative" 
                   />
                </div>
             </div>
          </div>
        ) : activeTab === 'QUIZ' ? (
          /* Quiz builder view code remains but with updated styling */
          <div className="flex-grow overflow-y-auto p-12 lg:p-24 bg-slate-50/50 no-scrollbar">
             <div className="max-w-3xl mx-auto space-y-12">
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bài tập & Quiz</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Thiết kế hệ thống đánh giá tự động</p>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => addQuiz('MULTIPLE_CHOICE')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">+ Trắc nghiệm</button>
                     <button onClick={() => addQuiz('ESSAY')} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">+ Tự luận AI</button>
                   </div>
                </div>

                {course.quizzes?.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                     <div className="text-4xl mb-4">📝</div>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chưa có câu hỏi nào được tạo</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {course.quizzes?.map((q, idx) => (
                      <div key={q.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500 group">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">CÂU HỎI {idx + 1} • <span className="text-blue-500">{q.type}</span></span>
                           <button onClick={() => setCourse({ ...course, quizzes: course.quizzes?.filter(sq => sq.id !== q.id) })} className="text-red-300 hover:text-red-500 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Gỡ bỏ</button>
                        </div>
                        <textarea 
                           className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold leading-relaxed"
                           placeholder="Nội dung câu hỏi..."
                           value={q.question}
                           onChange={e => updateQuiz(idx, { question: e.target.value })}
                        />
                        {/* Logic for different quiz types (MCQ, Short, etc) */}
                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div className="grid grid-cols-2 gap-4">
                            {q.options?.map((opt, oIdx) => (
                              <div key={oIdx} className="space-y-2">
                                 <div className="flex items-center justify-between px-2">
                                   <label className="text-[8px] font-black text-slate-400 uppercase">Đáp án {String.fromCharCode(65 + oIdx)}</label>
                                   <input type="radio" checked={q.correctAnswer === oIdx} onChange={() => updateQuiz(idx, { correctAnswer: oIdx })} className="accent-blue-500" />
                                 </div>
                                 <input 
                                   className="w-full px-5 py-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-50 focus:bg-white"
                                   value={opt}
                                   onChange={e => {
                                     const newOpts = [...(q.options || [])];
                                     newOpts[oIdx] = e.target.value;
                                     updateQuiz(idx, { options: newOpts });
                                   }}
                                 />
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === 'ESSAY' && (
                          <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                             <label className="text-[9px] font-black text-purple-700 uppercase tracking-widest mb-3 block">Hướng dẫn chấm (AI so khớp)</label>
                             <textarea 
                               className="w-full p-4 bg-white/60 rounded-xl border border-purple-200/50 text-xs font-bold text-purple-800 outline-none min-h-[100px]"
                               placeholder="Liệt kê các ý chính học sinh cần trả lời để AI chấm điểm..."
                               value={q.explanation}
                               onChange={e => updateQuiz(idx, { explanation: e.target.value })}
                             />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center p-24 text-center bg-slate-50/20">
             <div className="max-w-md space-y-6">
                <div className="w-24 h-24 bg-white rounded-[3rem] mx-auto flex items-center justify-center text-slate-200 shadow-xl shadow-slate-200/50 border border-slate-50">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Studio Sáng Tạo</h3>
                   <p className="text-xs text-slate-400 font-bold leading-relaxed mt-2 uppercase tracking-widest">Chọn bài học hoặc thêm nội dung mới để bắt đầu</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                   <button onClick={addLesson} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Tạo Bài Học</button>
                   <button onClick={() => { setActiveTab('QUIZ'); if(!course.quizzes?.length) addQuiz('MULTIPLE_CHOICE'); }} className="px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200/50 active:scale-95 transition-all">Tạo Bài Tập</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* AI Modal for Thumbnails & Assistance */}
      {isAILabOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-3xl" onClick={() => !isAILoading && setIsAILabOpen(false)}></div>
           <div className="relative w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-12 text-white flex items-center justify-between" style={{ backgroundColor: settings.primaryColor }}>
                 <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">AI Creator Lab</h2>
                    <p className="text-[10px] opacity-70 font-black uppercase tracking-widest">Tích hợp Gemini Pro để tối ưu hóa bài giảng</p>
                 </div>
                 <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center text-3xl">✨</div>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yêu cầu trợ lý (Tạo ảnh bìa, viết kịch bản...)</label>
                    <textarea 
                        className="w-full px-8 py-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-[13px] font-bold outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all min-h-[160px] shadow-inner"
                        placeholder="VD: Viết một đoạn giới thiệu hấp dẫn cho bài học này hoặc mô tả ảnh bìa..."
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={async () => {
                        if (!aiPrompt.trim()) return;
                        setIsAILoading(true);
                        try {
                           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                           const resp = await ai.models.generateContent({
                             model: 'gemini-3-pro-image-preview',
                             contents: { parts: [{ text: aiPrompt }] },
                             config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
                           });
                           for (const part of resp.candidates?.[0]?.content.parts || []) {
                             if (part.inlineData) {
                               setCourse({ ...course, thumbnail: `data:image/png;base64,${part.inlineData.data}` });
                               setIsAILabOpen(false);
                               break;
                             }
                           }
                        } catch (e) { alert('Lỗi tạo ảnh AI!'); } finally { setIsAILoading(false); }
                      }}
                      disabled={isAILoading}
                      className="py-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isAILoading ? 'Processing...' : 'Tạo Ảnh Bìa'}
                    </button>
                    <button 
                      onClick={() => setIsAILabOpen(false)} 
                      className="py-6 bg-slate-100 text-slate-400 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                    >Đóng Lab</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      <style>{`
        .lesson-editor h1 { font-size: 3.5rem; font-weight: 900; color: #0f172a; margin-bottom: 2.5rem; letter-spacing: -0.05em; }
        .lesson-editor h2 { font-size: 2.2rem; font-weight: 800; color: #1e293b; margin-top: 4rem; margin-bottom: 1.5rem; letter-spacing: -0.03em; }
        .lesson-editor p { line-height: 2; margin-bottom: 2rem; color: #475569; font-size: 1.15rem; }
        .lesson-editor ul { list-style: disc; padding-left: 2rem; margin-bottom: 2rem; }
        .lesson-editor li { margin-bottom: 1rem; font-weight: 500; }
        .lesson-editor pre { margin: 2rem 0; border-radius: 2rem; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Studio;
