
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { db } from '../db';
import { Role, User } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, refreshData } = useAuth();
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
        avatar: `https://picsum.photos/seed/${Date.now()}/200`
      };
      db.saveUsers([...users, newUser]);
      refreshData();
      alert('Đăng ký thành công! Hãy đăng nhập.');
      setIsRegister(false);
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-blue-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">{isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h2>
          <p className="text-blue-100 mt-2">{isRegister ? 'Đăng ký để bắt đầu học ngay' : 'Đăng nhập vào EduSpace'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input 
              required
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (isRegister ? 'Đăng ký ngay' : 'Đăng nhập')}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </button>
          </div>
        </form>

        <div className="p-6 bg-slate-50 text-xs text-slate-400 text-center space-y-1">
          <p>Admin mẫu: nhatdang10.nd@gmail.com / cnd5110@.c</p>
          <p>Mật khẩu quản trị mặc định: adminpassword123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
