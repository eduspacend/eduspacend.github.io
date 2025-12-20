
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Role } from '../types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-blue-100 px-4 md:px-8 flex items-center justify-between z-50 shadow-sm">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">EduSpace</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-slate-600 font-medium">
          <Link to="/" className="hover:text-blue-600 transition-colors">Khám phá</Link>
          <a href="https://nd-site.github.io" target="_blank" className="hover:text-blue-600 transition-colors">ND Labs</a>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-900 leading-tight">{user.fullName}</span>
              <span className="text-xs text-blue-600 font-bold uppercase">{user.role}</span>
            </div>
            
            <div className="relative group">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563eb&color=fff`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-blue-100 cursor-pointer"
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-blue-50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50">Tài khoản của tôi</Link>
                {user.role === Role.ADMIN && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-blue-700 font-semibold hover:bg-blue-50">Quản trị Admin</Link>
                )}
                {(user.role === Role.DEVELOPER || user.role === Role.ADMIN) && (
                  <Link to="/developer" className="block px-4 py-2 text-sm text-indigo-700 font-semibold hover:bg-blue-50">Quản trị Developer</Link>
                )}
                <hr className="my-1 border-blue-50" />
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
