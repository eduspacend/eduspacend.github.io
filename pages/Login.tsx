
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useConfig } from '../App';
import { db } from '../db';
import { Role, User } from '../types';
import { DEFAULT_AVATAR } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, refreshData } = useAuth();
  const { settings } = useConfig();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const users = db.getUsers();
      if (users.find(u => u.email === email)) {
        setError('Email này đã được đăng ký!');
        setLoading(false);
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password,
        fullName,
        role: Role.USER,
        avatar: avatarUrl.trim() || DEFAULT_AVATAR
      };
      db.saveUsers([...users, newUser]);
      refreshData();
      alert('Đăng ký thành công! Hãy đăng nhập.');
      setIsRegister(false);
      setAvatarUrl('');
      setFullName('');
    } else {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email hoặc mật khẩu không chính xác!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-slate-50/50 p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%]" style={{ backgroundColor: `${settings.primaryColor}05`, filter: 'blur(120px)', borderRadius: '100%' }}></div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white overflow-hidden relative z-10">
        
        {/* Left Side: Branding & Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-xl">
                 <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter">{settings.brandName}</span>
            </div>
            
            <h2 className="text-4xl font-black leading-tight mb-6 tracking-tight">
              {isRegister ? 'Khởi đầu hành trình tri thức mới.' : 'Tiếp tục chinh phục đỉnh cao mới.'}
            </h2>
            <p className="text-white/70 font-bold text-sm leading-relaxed max-w-xs">
              Hệ thống học tập thông minh được vận hành bởi đội ngũ ND Labs.
            </p>
          </div>

          <div className="relative z-10">
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
                <span>ND Labs</span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span>EduSpace v2.5</span>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Chào mừng bạn đến với ND Labs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                <span>{error}</span>
              </div>
            )}
            
            {isRegister && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="relative group">
                  <label className="absolute left-4 top-[-8px] bg-white px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest z-10 transition-colors group-focus-within:text-blue-600" style={isRegister ? {} : { display: 'none' }}>Họ và tên</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 outline-none text-xs font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div className="relative group">
                   <label className="absolute left-4 top-[-8px] bg-white px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest z-10 transition-colors group-focus-within:text-blue-600">Ảnh đại diện (URL)</label>
                   <input 
                    type="text" 
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 outline-none text-[10px] font-bold text-slate-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <label className="absolute left-4 top-[-8px] bg-white px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest z-10 transition-colors group-focus-within:text-blue-600">Email công việc</label>
              <input 
                required
                type="email" 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 outline-none text-xs font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <label className="absolute left-4 top-[-8px] bg-white px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest z-10 transition-colors group-focus-within:text-blue-600">Mật khẩu</label>
              <input 
                required
                type="password" 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 outline-none text-xs font-bold text-slate-800 tracking-[0.3em] focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full text-white py-4 mt-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50 active:scale-[0.97] hover:opacity-90"
              style={{ backgroundColor: settings.primaryColor, boxShadow: `0 20px 40px ${settings.primaryColor}30` }}
            >
              {loading ? 'Đang xác thực...' : (isRegister ? 'Xác nhận đăng ký' : 'Đăng nhập ngay')}
            </button>

            <div className="text-center pt-4">
              <button 
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                {isRegister ? (
                  <>Đã có tài khoản? <span style={{ color: settings.primaryColor }}>Đăng nhập</span></>
                ) : (
                  <>Chưa có tài khoản? <span style={{ color: settings.primaryColor }}>Tạo tài khoản mới</span></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 flex items-center justify-center space-x-2 text-slate-300">
             <span className="text-[8px] font-black uppercase tracking-[0.3em]">EduSpace by ND Labs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
