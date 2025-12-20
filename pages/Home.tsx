
import React, { useState } from 'react';
import { useAuth } from '../App';
import { Course, Role } from '../types';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { courses, user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'VIP'>('ALL');

  const filteredCourses = courses.filter(c => {
    if (filter === 'FREE') return !c.isVip;
    if (filter === 'VIP') return c.isVip;
    return true;
  });

  const canAccessVip = user && (user.role === Role.ADMIN || user.role === Role.DEVELOPER || user.role === Role.VIP);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          Nâng Tầm Kiến Thức Với <span className="text-blue-600">EduSpace</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Hệ thống giáo dục trực tuyến hàng đầu của ND Labs. Học tập mọi lúc, mọi nơi với các chuyên gia.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('FREE')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'FREE' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
          >
            Miễn phí
          </button>
          <button 
            onClick={() => setFilter('VIP')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'VIP' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
          >
            VIP
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-blue-50 group">
            <div className="relative h-48 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {course.isVip && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  VIP
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
              <p className="text-slate-600 text-sm mb-6 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-bold text-lg">
                  {course.isVip ? 'Tham gia VIP' : 'Miễn phí'}
                </span>
                <Link 
                  to={`/course/${course.id}`}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                    course.isVip && !canAccessVip 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  }`}
                >
                  {course.isVip && !canAccessVip ? 'Khóa VIP' : 'Học ngay'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-xl">Không tìm thấy khóa học nào phù hợp.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
