
import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Role } from '../types';

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const { courses, user } = useAuth();
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  const course = courses.find(c => c.id === id);
  if (!course) return <Navigate to="/" />;

  const canAccess = !course.isVip || (user && [Role.ADMIN, Role.DEVELOPER, Role.VIP].includes(user.role));

  if (!canAccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="max-w-xl text-center">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Đây là nội dung VIP</h2>
          <p className="text-slate-600 mb-8">Khóa học này chỉ dành cho học viên VIP. Vui lòng liên hệ Admin hoặc nâng cấp tài khoản để tiếp tục học tập.</p>
          <div className="flex justify-center space-x-4">
             <Link to="/" className="px-6 py-3 bg-slate-200 rounded-xl font-bold">Quay lại</Link>
             <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Nâng cấp VIP ngay</button>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[activeLessonIdx];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      <div className="flex-grow p-4 md:p-8 bg-black">
        <div className="max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden bg-slate-800 shadow-2xl">
          {currentLesson ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={currentLesson.videoUrl} 
              title={currentLesson.title} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">Chưa có video</div>
          )}
        </div>
        
        <div className="max-w-5xl mx-auto mt-8 bg-white p-8 rounded-2xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{currentLesson?.title || course.title}</h1>
          <div className="prose max-w-none text-slate-600">
            {currentLesson?.content || 'Không có mô tả cho bài học này.'}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white border-l border-blue-50 flex flex-col">
        <div className="p-6 border-b border-blue-50">
          <h3 className="font-bold text-slate-800">Danh sách bài học</h3>
          <p className="text-sm text-slate-500">{course.lessons.length} bài học</p>
        </div>
        <div className="flex-grow overflow-y-auto">
          {course.lessons.map((lesson, idx) => (
            <button 
              key={lesson.id}
              onClick={() => setActiveLessonIdx(idx)}
              className={`w-full text-left p-4 flex items-start space-x-3 transition-colors border-b border-slate-50 ${activeLessonIdx === idx ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeLessonIdx === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {idx + 1}
              </div>
              <div className="flex-grow">
                <p className={`text-sm font-semibold ${activeLessonIdx === idx ? 'text-blue-700' : 'text-slate-700'}`}>{lesson.title}</p>
                <p className="text-xs text-slate-400">10:00</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 bg-slate-50">
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700">Gửi câu hỏi cho GV</button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
