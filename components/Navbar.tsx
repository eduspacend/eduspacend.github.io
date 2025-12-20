
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useConfig } from '../App';
import { Role } from '../types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useConfig();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white/70 backdrop-blur-2xl border-b border-slate-50 px-4 md:px-8 flex items-center justify-between z-50 shadow-[0_1px_10px_rgba(0,0,0,0.01)]">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-[0.8rem] flex items-center justify-center bg-white shadow-md shadow-blue-500/5 group-hover:scale-105 transition-transform p-1.5 border border-slate-50 overflow-hidden">
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback nếu logo.png chưa được load kịp hoặc sai đường dẫn
                (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=ES&backgroundColor=2563eb';
              }}
            />
          </div>
          <span className="text-xl font-black tracking-tighter" style={{ color: settings.primaryColor }}>{settings.brandName}</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-6 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Khám phá</Link>
          <a href="https://nd-site.github.io" target="_blank" className="hover:text-blue-600 transition-colors">ND Labs</a>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-black text-slate-800 leading-none mb-0.5">{user.fullName}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60" style={{ color: settings.primaryColor }}>{user.role}</span>
            </div>
            
            <div className="relative group">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=${settings.primaryColor.replace('#', '')}&color=fff`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-lg border border-white shadow-sm cursor-pointer group-hover:scale-105 transition-all"
              />
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-[1.2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-slate-50 p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-[60]">
                <Link to="/profile" className="flex items-center space-x-3 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                   <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                   <span>Hồ sơ</span>
                </Link>
                {user.role === Role.ADMIN && (
                  <Link to="/admin" className="flex items-center space-x-3 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 rounded-lg transition-colors" style={{ color: settings.primaryColor }}>
                    <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    <span>Quản trị</span>
                  </Link>
                )}
                <div className="my-1 border-t border-slate-50 mx-2"></div>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="px-5 py-2 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
