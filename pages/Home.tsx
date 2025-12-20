
import React, { useState } from 'react';
import { useAuth, useConfig } from '../App';
import { Course, Role } from '../types';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { courses, user } = useAuth();
  const { settings } = useConfig();
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'VIP'>('ALL');

  const filteredCourses = courses.filter(c => {
    if (filter === 'FREE') return !c.isVip;
    if (filter === 'VIP') return c.isVip;
    return true;
  });

  const canAccessVip = user && (user.role === Role.ADMIN || user.role === Role.DEVELOPER || user.role === Role.VIP);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      <section className="text-center mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          {settings.heroTitle.split(settings.brandName).map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && <span style={{ color: settings.primaryColor }}>{settings.brandName}</span>}
            </React.Fragment>
          ))}
          {!settings.heroTitle.includes(settings.brandName) && settings.heroTitle}
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          {settings.heroSubtitle}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['ALL', 'FREE', 'VIP'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f ? 'text-white border-transparent' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-100 hover:text-blue-500 shadow-sm'}`}
              style={filter === f ? { backgroundColor: settings.primaryColor, boxShadow: `0 10px 25px ${settings.primaryColor}20` } : {}}
            >
              {f === 'ALL' ? 'Tất cả' : f === 'FREE' ? 'Miễn phí' : 'Học VIP'}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col relative">
            <div className="relative h-48 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              {course.isVip && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-950 text-[8px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                  VIP
                </div>
              )}
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
              <p className="text-slate-500 text-xs mb-8 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
              
              <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PHÍ HỌC</span>
                  <span className="font-black text-sm" style={{ color: settings.primaryColor }}>
                    {course.isVip ? 'Tham gia VIP' : 'Miễn phí'}
                  </span>
                </div>
                <Link 
                  to={`/course/${course.id}`}
                  className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                    course.isVip && !canAccessVip 
                      ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' 
                      : 'text-white hover:opacity-90 active:scale-95'
                  }`}
                  style={!(course.isVip && !canAccessVip) ? { backgroundColor: settings.primaryColor } : {}}
                >
                  {course.isVip && !canAccessVip ? 'NÂNG CẤP' : 'HỌC NGAY'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-24 text-slate-400 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
             <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <p className="text-xl font-black text-slate-300">Không có khóa học nào.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
