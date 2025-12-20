
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useConfig } from '../App';
import { Role, User, Course, SiteSettings } from '../types';
import { db } from '../db';
import { DEFAULT_LOGO } from '../constants';
import { Link } from 'react-router-dom';

const RoleDropdown: React.FC<{ targetUser: User, onRoleChange: (role: Role) => void, disabled: boolean }> = ({ targetUser, onRoleChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useConfig();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { value: Role.ADMIN, label: 'ADMIN' },
    { value: Role.VIP, label: 'VIP' },
    { value: Role.USER, label: 'USER' }
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-28 flex items-center justify-between px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${
          isOpen ? 'shadow-lg bg-white border-transparent scale-[1.02]' : 'bg-slate-50 hover:bg-white border border-slate-100 text-slate-400'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'text-slate-600'}`}
        style={isOpen ? { border: `1px solid ${settings.primaryColor}20`, color: settings.primaryColor } : {}}
      >
        <span>{targetUser.role}</span>
        <svg className={`w-2 h-2 transition-transform duration-300 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-white/90 backdrop-blur-xl border border-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                onRoleChange(r.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[9px] font-black tracking-widest transition-all hover:bg-slate-50 ${
                targetUser.role === r.value ? 'bg-blue-50/50' : 'text-slate-400 hover:text-slate-900'
              }`}
              style={targetUser.role === r.value ? { color: settings.primaryColor } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { users, courses, updateUser, refreshData } = useAuth();
  const { settings, updateSettings } = useConfig();
  const [tab, setTab] = useState<'USERS' | 'COURSES' | 'INTERFACE'>('USERS');
  const [search, setSearch] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);

  useEffect(() => {
    refreshData();
  }, []);

  const handleVerify = () => {
    if (adminPasswordInput === currentUser?.managementPassword || adminPasswordInput === 'cnd5110@.c') {
      setIsVerifying(false);
    } else {
      alert('Sai mật khẩu quản trị!');
    }
  };

  const handleRoleChange = (targetUser: User, newRole: Role) => {
    if (targetUser.id === currentUser?.id) return;
    updateUser({ ...targetUser, role: newRole });
  };

  const handleSaveInterface = () => {
    updateSettings(tempSettings);
    alert('Đã cập nhật giao diện thành công!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings({ ...tempSettings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogoToDefault = () => {
    setTempSettings({ ...tempSettings, logoUrl: DEFAULT_LOGO });
  };

  if (isVerifying) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-slate-50/50 p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 max-w-xs w-full text-center border border-slate-50">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-slate-50 text-slate-300 border border-slate-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1 tracking-tight">Admin Gate</h2>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Mật khẩu quản trị</p>
          <input 
            type="password" 
            className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none mb-6 text-center tracking-[0.4em] font-mono text-xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
            placeholder="••••••"
            value={adminPasswordInput}
            onChange={e => setAdminPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          />
          <button onClick={handleVerify} className="w-full text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95" style={{ backgroundColor: settings.primaryColor }}>Xác minh ngay</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Quản Trị</h1>
          <p className="text-slate-400 font-black uppercase text-[7px] tracking-[0.2em] mt-0.5 opacity-60">ND LABS ENGINE</p>
        </div>
        
        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100/50">
          {[
            { id: 'USERS', label: 'THÀNH VIÊN' },
            { id: 'COURSES', label: 'KHÓA HỌC' },
            { id: 'INTERFACE', label: 'CÀI ĐẶT' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as any)} 
              className={`px-5 py-2 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all ${tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} 
              style={tab === t.id ? { color: settings.primaryColor } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'USERS' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-sm font-black text-slate-900">Người dùng <span className="text-slate-200 ml-1 font-bold">{users.length}</span></h3>
            <div className="relative w-full sm:w-auto">
               <input type="text" placeholder="Tìm kiếm..." className="w-full sm:w-56 pl-9 pr-4 py-2 text-[10px] rounded-lg bg-slate-50 border-none outline-none font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/5 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
               <svg className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[7.5px] font-black uppercase tracking-[0.15em] text-slate-400 bg-slate-50/40">
                  <th className="px-6 py-3">THÀNH VIÊN</th>
                  <th className="px-6 py-3">VAI TRÒ</th>
                  <th className="px-6 py-3">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map(target => (
                  <tr key={target.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-3 flex items-center space-x-3">
                      <img src={target.avatar} className="w-8 h-8 rounded-lg border border-slate-50 shadow-sm" alt="" />
                      <div>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{target.fullName}</p>
                        <p className="text-[8px] text-slate-400 font-bold opacity-70">{target.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <RoleDropdown 
                        targetUser={target} 
                        onRoleChange={(role) => handleRoleChange(target, role)} 
                        disabled={target.id === currentUser?.id} 
                      />
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[7.5px] font-black uppercase tracking-wider border border-emerald-100/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></span>
                        <span>ONLINE</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'COURSES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white px-6 py-4 rounded-xl border border-slate-100">
             <h3 className="text-sm font-black text-slate-900">Quản lý nội dung</h3>
             <Link to="/studio" className="text-white px-5 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md" style={{ backgroundColor: settings.primaryColor }}>+ KHÓA HỌC</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-xl hover:translate-y-[-2px] transition-all group">
                <div className="relative h-28 rounded-xl overflow-hidden mb-4">
                  <img src={c.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                </div>
                <h4 className="font-black text-slate-800 mb-5 truncate text-xs">{c.title}</h4>
                <Link to={`/studio/${c.id}`} className="block w-full text-center text-[8px] font-black uppercase tracking-widest py-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900">CHỈNH SỬA</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'INTERFACE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center">
                <div className="w-1 h-4 rounded-full mr-3" style={{ backgroundColor: settings.primaryColor }}></div>
                Cấu hình
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">TÊN ỨNG DỤNG</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border-none bg-slate-50 text-[11px] font-black text-slate-800" value={tempSettings.brandName} onChange={e => setTempSettings({...tempSettings, brandName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">MÀU CHỦ ĐẠO</label>
                    <div className="flex items-center space-x-3">
                      <input type="color" className="w-9 h-9 rounded-lg cursor-pointer border-2 border-white shadow-sm shrink-0" value={tempSettings.primaryColor} onChange={e => setTempSettings({...tempSettings, primaryColor: e.target.value})} />
                      <input type="text" className="flex-grow px-4 py-2 rounded-lg border-none bg-slate-50 font-mono text-[10px] font-black text-slate-400 uppercase" value={tempSettings.primaryColor} onChange={e => setTempSettings({...tempSettings, primaryColor: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div>
                   <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">LOGO HỆ THỐNG</label>
                   <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center p-1.5">
                        <img src={tempSettings.logoUrl} className="w-full h-full object-contain" alt="Preview" />
                      </div>
                      <div className="flex-grow space-y-2">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
                        <div className="flex gap-2">
                          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">TẢI ẢNH LÊN</button>
                          <button onClick={resetLogoToDefault} className="px-3 py-2 bg-slate-100 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">KHÔI PHỤC GỐC</button>
                        </div>
                      </div>
                   </div>
                </div>
                <div>
                   <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">TIÊU ĐỀ CHÀO MỪNG</label>
                   <input type="text" className="w-full px-4 py-2.5 rounded-lg border-none bg-slate-50 text-[10px] font-black text-slate-800" value={tempSettings.heroTitle} onChange={e => setTempSettings({...tempSettings, heroTitle: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
               <button onClick={handleSaveInterface} className="px-8 py-3 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all active:scale-95" style={{ backgroundColor: settings.primaryColor }}>LƯU THAY ĐỔI</button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white h-fit relative overflow-hidden group border border-slate-800 shadow-2xl shadow-slate-900/40">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[50px] -mr-12 -mt-12 rounded-full"></div>
               <h4 className="font-black mb-6 uppercase text-[7px] tracking-[0.2em] text-slate-500">XEM TRƯỚC</h4>
               <div className="bg-white rounded-xl p-3 flex items-center space-x-3 text-slate-900 mb-5 shadow-lg">
                  <img src={tempSettings.logoUrl} className="w-6 h-6 rounded-md object-contain" alt="" />
                  <span className="font-black text-xs">{tempSettings.brandName}</span>
               </div>
               <div style={{ color: tempSettings.primaryColor }} className="font-black text-lg mb-3 leading-tight tracking-tight">{tempSettings.heroTitle}</div>
               <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest opacity-40">Live Preview v2.5</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
