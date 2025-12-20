
import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth, useConfig } from '../App';
import { Role } from '../types';

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const { courses, user } = useAuth();
  const { settings } = useConfig();
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  const course = courses.find(c => c.id === id);
  if (!course) return <Navigate to="/" />;

  const canAccess = !course.isVip || (user && [Role.ADMIN, Role.DEVELOPER, Role.VIP].includes(user.role));

  if (!canAccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-xl text-center bg-white p-12 rounded-3xl shadow-xl border border-blue-50">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Đây là nội dung VIP</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">Khóa học "{course.title}" chỉ dành cho học viên VIP. Nâng cấp tài khoản để truy cập toàn bộ bài giảng chất lượng cao của {settings.brandName}.</p>
          <div className="flex justify-center space-x-4">
             <Link to="/" className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Quay lại</Link>
             <button className="px-6 py-3 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all" style={{ backgroundColor: settings.primaryColor }}>Nâng cấp VIP</button>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[activeLessonIdx];

  const renderVideo = (url: string) => {
    if (!url) return null;
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    
    if (isYoutube) {
      return (
        <iframe 
          width="100%" 
          height="100%" 
          src={url} 
          title={currentLesson?.title} 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video 
          src={url} 
          className="w-full h-full object-contain" 
          controls 
          autoPlay={false}
        ></video>
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-slate-50">
      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        {currentLesson?.videoUrl && (
          <div className="max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl mb-8 border-4 border-white">
            {renderVideo(currentLesson.videoUrl)}
          </div>
        )}
        
        <div className="max-w-5xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center">
            <span className="w-2 h-8 rounded-full mr-4" style={{ backgroundColor: settings.primaryColor }}></span>
            {currentLesson?.title || course.title}
          </h1>
          <div 
            className="prose prose-blue prose-lg max-w-none text-slate-700 leading-relaxed custom-lesson-content"
            style={{ '--tw-prose-links': settings.primaryColor } as any}
            dangerouslySetInnerHTML={{ __html: currentLesson?.content || '<p class="text-slate-400 italic">Bài học này chưa có nội dung chi tiết.</p>' }}
          />
          
          <style>{`
            .custom-lesson-content table { border-collapse: collapse; width: 100%; margin: 2rem 0; }
            .custom-lesson-content td, .custom-lesson-content th { border: 1px solid #e2e8f0; padding: 12px; }
            .custom-lesson-content img { max-width: 100%; border-radius: 1rem; }
          `}</style>

          <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
             <button 
               disabled={activeLessonIdx === 0}
               onClick={() => setActiveLessonIdx(prev => prev - 1)}
               className="px-6 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold disabled:opacity-30 hover:bg-slate-50 transition-all"
             >
               ← Bài trước
             </button>
             <button 
               disabled={activeLessonIdx === course.lessons.length - 1}
               onClick={() => setActiveLessonIdx(prev => prev + 1)}
               className="px-6 py-2 text-white rounded-xl font-bold disabled:opacity-30 hover:opacity-90 transition-all shadow-md"
               style={{ backgroundColor: settings.primaryColor }}
             >
               Bài tiếp theo →
             </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Danh sách bài học */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-100 flex flex-col shadow-xl">
        <div className="p-8 border-b border-slate-50" style={{ backgroundColor: `${settings.primaryColor}08` }}>
          <h3 className="font-bold text-slate-900 text-lg">Nội dung học tập</h3>
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: settings.primaryColor }}>{course.lessons.length} Bài học • {course.lessons.length * 10} Phút</p>
        </div>
        <div className="flex-grow overflow-y-auto py-4">
          {course.lessons.map((lesson, idx) => (
            <button 
              key={lesson.id}
              onClick={() => setActiveLessonIdx(idx)}
              className={`w-full text-left px-8 py-4 flex items-center space-x-4 transition-all ${activeLessonIdx === idx ? 'border-r-4' : 'hover:bg-slate-50'}`}
              style={activeLessonIdx === idx ? { backgroundColor: `${settings.primaryColor}10`, borderRightColor: settings.primaryColor } : {}}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeLessonIdx === idx ? 'text-white' : 'bg-slate-100 text-slate-400'}`} style={activeLessonIdx === idx ? { backgroundColor: settings.primaryColor } : {}}>
                {idx + 1}
              </div>
              <div className="flex-grow min-w-0">
                <p className={`text-sm font-bold truncate ${activeLessonIdx === idx ? 'text-slate-900' : 'text-slate-700'}`} style={activeLessonIdx === idx ? { color: settings.primaryColor } : {}}>{lesson.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono">10:00</span>
                  {activeLessonIdx === idx && <span className="text-[10px] font-bold italic" style={{ color: settings.primaryColor }}>Đang học...</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-6 bg-slate-50">
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">Đặt câu hỏi cho giảng viên</button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
