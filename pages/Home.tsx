
import React, { useState } from 'react';
import { useAuth, useConfig } from '../App';
import { Course, Role } from '../types';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { courses, user } = useAuth();
  const { settings } = useConfig();
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'VIP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalCompact, setGlobalCompact] = useState(false);
  const [individualCompact, setIndividualCompact] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCourses = courses.filter(c => {
    // Category filter
    const matchesCategory = filter === 'ALL' || (filter === 'FREE' ? !c.isVip : c.isVip);
    
    // Search filter (title or description)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(searchLower) || 
                         c.description.toLowerCase().includes(searchLower);
                         
    return matchesCategory && matchesSearch;
  });

  const canAccessVip = user && (user.role === Role.ADMIN || user.role === Role.DEVELOPER || user.role === Role.VIP);

  const handleShare = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#/course/${courseId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(courseId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleCardView = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIndividualCompact(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <section className="text-center mb-16 relative">
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

        {/* Search Bar Implementation */}
        <div className="max-w-xl mx-auto mb-12 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Tìm kiếm khóa học bạn quan tâm..."
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 outline-none text-sm font-bold text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-5 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
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

          <div className="h-8 w-px bg-slate-100 hidden md:block"></div>

          {/* Global View Mode Toggle */}
          <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setGlobalCompact(false)}
              className={`p-2 rounded-xl transition-all ${!globalCompact ? 'bg-white shadow-sm' : 'text-slate-400'}`}
              style={!globalCompact ? { color: settings.primaryColor } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </button>
            <button 
              onClick={() => setGlobalCompact(true)}
              className={`p-2 rounded-xl transition-all ${globalCompact ? 'bg-white shadow-sm' : 'text-slate-400'}`}
              style={globalCompact ? { color: settings.primaryColor } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM4 21a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z"/></svg>
            </button>
          </div>
        </div>
      </section>

      <div className={`grid gap-8 transition-all duration-500 ${globalCompact ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredCourses.map(course => {
          const isCardCompact = globalCompact || individualCompact[course.id];
          
          return (
            <div 
              key={course.id} 
              className={`news-card bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 group flex flex-col relative ${isCardCompact ? 'aspect-square md:aspect-auto md:h-64' : 'min-h-[420px]'}`}
            >
              <div className={`relative overflow-hidden transition-all duration-500 ${isCardCompact ? 'h-full' : 'h-48'}`}>
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                
                {/* Floating Action Bar */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  {/* Local View Toggle Button */}
                  <button 
                    onClick={(e) => toggleCardView(e, course.id)}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-600 hover:scale-110 transition-all active:scale-95"
                    title={isCardCompact ? "Xem chi tiết" : "Chế độ thu nhỏ"}
                  >
                    {isCardCompact ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    )}
                  </button>

                  {/* Share Button */}
                  <button 
                    onClick={(e) => handleShare(e, course.id)}
                    className={`w-8 h-8 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${copiedId === course.id ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-600'}`}
                    title="Chia sẻ"
                  >
                    {copiedId === course.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 4.684m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    )}
                  </button>
                </div>

                {/* VIP Badge */}
                {course.isVip && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-950 text-[8px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider z-10">
                    VIP
                  </div>
                )}

                {/* Compact Mode Content Overlay */}
                {isCardCompact && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <h3 className="text-white font-black text-sm uppercase tracking-tight mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{course.title}</h3>
                    <Link 
                      to={`/course/${course.id}`}
                      className="text-[8px] text-white/70 font-black uppercase tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-75"
                    >
                      BẮT ĐẦU HỌC →
                    </Link>
                  </div>
                )}
              </div>

              {/* Detailed Mode Content */}
              {!isCardCompact && (
                <div className="p-8 flex-grow flex flex-col animate-in fade-in duration-500">
                  <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-500 text-xs mb-8 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TRẠNG THÁI</span>
                      <span className="font-black text-xs" style={{ color: settings.primaryColor }}>
                        {course.isVip ? 'Yêu cầu VIP' : 'Truy cập mở'}
                      </span>
                    </div>
                    
                    <Link 
                      to={`/course/${course.id}`}
                      className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        course.isVip && !canAccessVip 
                          ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' 
                          : 'text-white hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/20'
                      }`}
                      style={!(course.isVip && !canAccessVip) ? { backgroundColor: settings.primaryColor } : {}}
                    >
                      {course.isVip && !canAccessVip ? 'NÂNG CẤP' : 'HỌC NGAY'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-24 text-slate-400 flex flex-col items-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100/50 shadow-inner">
             <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
             </svg>
          </div>
          <p className="text-xl font-black text-slate-300">Không tìm thấy khóa học phù hợp.</p>
          <button 
            onClick={() => {setSearchQuery(''); setFilter('ALL');}}
            className="mt-4 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
