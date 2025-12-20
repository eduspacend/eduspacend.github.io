
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useConfig } from '../App';
import { Course, Lesson, Role } from '../types';
import { db } from '../db';

const Studio: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, courses, refreshData } = useAuth();
  const { settings } = useConfig();
  
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
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseId) {
      const existing = courses.find(c => c.id === courseId);
      if (existing) setCourse(existing);
    }
  }, [courseId, courses]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = (status: 'PENDING' | 'PUBLISHED') => {
    if (!course.title) {
      alert('Vui lòng nhập tên khóa học!');
      return;
    }

    const allCourses = db.getCourses();
    const newCourse: Course = {
      ...course as Course,
      id: course.id || `course-${Date.now()}`,
      authorId: user!.id,
      status: status
    };

    let updatedCourses;
    if (course.id) {
      updatedCourses = allCourses.map(c => c.id === course.id ? newCourse : c);
    } else {
      updatedCourses = [...allCourses, newCourse];
    }

    try {
      db.saveCourses(updatedCourses);
      refreshData();
      
      if (status === 'PUBLISHED') {
        alert('Đã xuất bản khóa học thành công!');
        navigate('/admin');
      } else {
        alert('Đã lưu bản nháp thành công!');
        if (!course.id) {
          setCourse(newCourse);
        }
      }
    } catch (e) {
      alert('Lỗi lưu trữ: Bộ nhớ trình duyệt đầy (có thể do video quá lớn). Hãy thử sử dụng URL Embed thay thế.');
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'Bài học mới',
      videoUrl: '',
      content: '<p>Bắt đầu biên tập nội dung bài học tại đây...</p>'
    };
    const updatedLessons = [...(course.lessons || []), newLesson];
    setCourse({ ...course, lessons: updatedLessons });
    setActiveLessonIdx(updatedLessons.length - 1);
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  const updateLessonContent = () => {
    if (activeLessonIdx === -1 || !editorRef.current) return;
    const updatedLessons = [...(course.lessons || [])];
    updatedLessons[activeLessonIdx].content = editorRef.current.innerHTML;
    setCourse({ ...course, lessons: updatedLessons });
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const insertSection = (type: 'SLIDE' | 'DOC') => {
    let html = '';
    if (type === 'SLIDE') {
      html = `<div style="background: #1e293b; color: white; padding: 2.5rem; border-radius: 1.5rem; text-align: center; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <h2 style="font-size: 1.75rem; color: white; font-weight: 800; margin-bottom: 1rem;">Tiêu đề Slide</h2>
                <p style="opacity: 0.8;">Nội dung trình bày trực quan cho học viên.</p>
              </div>`;
    } else {
      html = `<div style="border-left: 5px solid ${settings.primaryColor}; background: ${settings.primaryColor}08; padding: 1.5rem; margin: 2rem 0; border-radius: 0 1rem 1rem 0; font-style: italic; color: #334155;">
                <strong>Ghi chú:</strong> Nội dung quan trọng học viên cần lưu ý kỹ trong bài giảng này.
              </div>`;
    }
    execCommand('insertHTML', html);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) {
      const proceed = window.confirm("File video lớn ( > 3MB) có thể không lưu được vào trình duyệt. Tiếp tục hay dùng YouTube?");
      if (!proceed) return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (activeLessonIdx !== -1) {
        const updated = [...(course.lessons || [])];
        updated[activeLessonIdx].videoUrl = event.target?.result as string;
        setCourse({ ...course, lessons: updated });
      }
      setIsUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    };
    reader.onerror = () => {
      alert("Lỗi khi tải video.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const setEmbedUrl = () => {
    const url = prompt("Nhập link YouTube (Embed URL)");
    if (url && activeLessonIdx !== -1) {
      const updated = [...(course.lessons || [])];
      updated[activeLessonIdx].videoUrl = url;
      setCourse({ ...course, lessons: updated });
    }
  };

  const removeVideo = () => {
    if (activeLessonIdx !== -1 && window.confirm("Gỡ bỏ video này?")) {
      const updated = [...(course.lessons || [])];
      updated[activeLessonIdx].videoUrl = '';
      setCourse({ ...course, lessons: updated });
    }
  };

  const renderVideoPreview = (url: string) => {
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    return (
      <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-10 border-8 border-white shadow-xl group">
        {isYoutube ? (
          <iframe width="100%" height="100%" src={url} frameBorder="0" allowFullScreen></iframe>
        ) : (
          <video src={url} controls className="w-full h-full object-contain"></video>
        )}
        <button 
          onClick={removeVideo}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-600 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-95"
          title="Gỡ bỏ video"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white relative">
      <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
      
      {/* Sidebar - Lighter theme */}
      <div className={`fixed inset-y-0 left-0 lg:relative z-40 w-80 bg-slate-50 border-r border-slate-100 flex flex-col transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-white">
          <div>
            <h2 className="font-bold text-slate-900">{settings.brandName} Studio</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trình biên tập nội dung</p>
          </div>
          <button onClick={() => setShowSidebar(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-3 tracking-widest">Thông tin cơ bản</label>
            <input 
              type="text" 
              className="w-full px-4 py-3.5 text-sm rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
              style={{ '--tw-ring-color': `${settings.primaryColor}20` } as any}
              placeholder="Nhập tên khóa học..."
              value={course.title}
              onChange={e => setCourse({ ...course, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-3">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nội dung bài học ({course.lessons?.length})</label>
            {course.lessons?.map((l, idx) => (
              <button 
                key={l.id} 
                onClick={() => { setActiveLessonIdx(idx); if(window.innerWidth < 1024) setShowSidebar(false); }}
                className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group active:scale-[0.98] ${activeLessonIdx === idx ? 'text-white shadow-xl shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50'}`}
                style={activeLessonIdx === idx ? { backgroundColor: settings.primaryColor } : {}}
              >
                <span className="truncate pr-2">{idx + 1}. {l.title}</span>
                {l.videoUrl && (
                  <svg className={`w-4 h-4 shrink-0 ${activeLessonIdx === idx ? 'text-white/80' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm11.387 4.613a1 1 0 000-1.226l-3.582-2.388A1 1 0 008.223 7.82v4.358a1 1 0 001.582.813l3.582-2.388z"/></svg>
                )}
              </button>
            ))}
            <button 
              onClick={addLesson} 
              className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all mt-4"
            >
              + Thêm bài học mới
            </button>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200/50 bg-white flex gap-3">
          <button 
            onClick={() => handleSave('PENDING')} 
            className="flex-1 bg-slate-50 text-slate-600 border border-slate-200 py-3.5 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95 text-xs"
          >
            Lưu nháp
          </button>
          <button 
            onClick={() => handleSave('PUBLISHED')} 
            className="flex-1 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all active:scale-95 text-xs" 
            style={{ backgroundColor: settings.primaryColor }}
          >
            Xuất bản
          </button>
        </div>
      </div>

      {/* Main Editor Area - High Contrast Light Mode */}
      <div className="flex-grow flex flex-col overflow-hidden w-full bg-slate-50/50">
        {/* Header toolbar for mobile/desktop */}
        <div className="bg-white p-4 border-b border-slate-200/60 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="font-extrabold text-slate-900 hidden sm:inline-block">
               {activeLessonIdx !== -1 ? course.lessons![activeLessonIdx].title : 'Chào mừng trở lại!'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSave('PENDING')} className="px-4 py-2 bg-slate-50 border border-slate-200 text-[11px] font-extrabold rounded-xl text-slate-600 hover:bg-slate-100 transition-all">NHÁP</button>
            <button onClick={() => handleSave('PUBLISHED')} className="px-4 py-2 text-[11px] font-extrabold rounded-xl text-white shadow-lg hover:opacity-90 transition-all" style={{ backgroundColor: settings.primaryColor }}>LƯU THAY ĐỔI</button>
          </div>
        </div>

        {activeLessonIdx === -1 ? (
          <div className="flex-grow flex items-center justify-center text-slate-400 flex-col space-y-6 p-12 text-center">
             <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
             </div>
             <div>
               <p className="font-bold text-slate-800 text-lg">Trình soạn thảo bài học</p>
               <p className="text-slate-400 text-sm mt-1">Chọn một bài học từ danh sách bên trái để bắt đầu thiết kế nội dung.</p>
             </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col h-full overflow-hidden">
            {/* Formatting Toolbar - Clean White */}
            <div className="bg-white border-b border-slate-200/60 p-2.5 flex items-center space-x-1.5 overflow-x-auto shadow-sm whitespace-nowrap scrollbar-hide">
               <div className="flex items-center space-x-1 border-r border-slate-200/50 pr-3 mr-2">
                  <button onClick={() => execCommand('bold')} className="w-10 h-10 hover:bg-slate-50 rounded-xl font-bold flex items-center justify-center transition-colors text-slate-700">B</button>
                  <button onClick={() => execCommand('italic')} className="w-10 h-10 hover:bg-slate-50 rounded-xl italic flex items-center justify-center transition-colors text-slate-700 font-serif">I</button>
                  <button onClick={() => execCommand('underline')} className="w-10 h-10 hover:bg-slate-50 rounded-xl underline flex items-center justify-center transition-colors text-slate-700">U</button>
               </div>
               
               <div className="flex items-center space-x-2 border-r border-slate-200/50 pr-3 mr-2">
                  <button onClick={() => insertSection('DOC')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-2 border border-slate-200/50 transition-all">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    CHÚ THÍCH
                  </button>
                  <button onClick={() => insertSection('SLIDE')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-2 border border-slate-200/50 transition-all">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                    SLIDE MẪU
                  </button>
               </div>

               <div className="flex items-center space-x-2">
                  <button 
                    onClick={setEmbedUrl}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 border border-red-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/></svg>
                    YOUTUBE
                  </button>
                  <button 
                    onClick={() => videoInputRef.current?.click()} 
                    disabled={isUploading}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <svg className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    {isUploading ? 'ĐANG TẢI...' : 'TẢI LÊN VIDEO'}
                  </button>
               </div>
            </div>

            {/* Editing Canvas - Brighter contrast */}
            <div className="flex-grow overflow-y-auto p-4 md:p-14 scroll-smooth bg-slate-100/50">
               <div className="max-w-4xl mx-auto bg-white min-h-full shadow-2xl shadow-slate-300/40 rounded-3xl p-8 md:p-20 border border-slate-100 flex flex-col">
                 <input 
                   type="text" 
                   className="w-full text-4xl md:text-5xl font-black text-slate-900 mb-12 border-none outline-none placeholder-slate-200 tracking-tight"
                   placeholder="Nhập tiêu đề bài học..."
                   value={course.lessons![activeLessonIdx].title}
                   onChange={e => {
                     const updated = [...(course.lessons || [])];
                     updated[activeLessonIdx].title = e.target.value;
                     setCourse({ ...course, lessons: updated });
                   }}
                 />

                 {/* Video Section */}
                 {course.lessons![activeLessonIdx].videoUrl && renderVideoPreview(course.lessons![activeLessonIdx].videoUrl)}

                 <div 
                   ref={editorRef} 
                   contentEditable 
                   onInput={updateLessonContent} 
                   className="prose prose-slate prose-xl max-w-none outline-none min-h-[500px] leading-relaxed text-slate-700 selection:bg-blue-100 selection:text-blue-900" 
                   style={{ '--tw-prose-links': settings.primaryColor } as any}
                   dangerouslySetInnerHTML={{ __html: course.lessons![activeLessonIdx].content }} 
                 />
                 
                 <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <span>EduSpace Editor v2.5</span>
                    <span>ND Labs Content Engine</span>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sidebar Overlay */}
      {showSidebar && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity" onClick={() => setShowSidebar(false)}></div>
      )}
    </div>
  );
};

export default Studio;