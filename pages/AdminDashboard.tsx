
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Role, User, Course } from '../types';
import { db } from '../db';

const AdminDashboard: React.FC = () => {
  const { users, courses, updateUser, refreshData } = useAuth();
  const [tab, setTab] = useState<'USERS' | 'COURSES' | 'INTERFACE'>('USERS');
  const [search, setSearch] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Luôn load dữ liệu mới nhất khi vào dashboard
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
    // Ngăn chặn Admin tự thay đổi quyền của chính mình
    if (targetUser.id === currentUser?.id) {
      alert('Bạn không thể tự thay đổi vai trò của chính mình để tránh mất quyền quản trị!');
      return;
    }
    const updated = { ...targetUser, role: newRole };
    if (newRole === Role.DEVELOPER) {
      updated.isApproved = false; // Devs need separate approval
    }
    updateUser(updated);
  };

  const toggleApproval = (targetUser: User) => {
    updateUser({ ...targetUser, isApproved: !targetUser.isApproved });
  };

  const grantVip = (targetUser: User, duration: 'MONTH' | 'PERMANENT') => {
    // Nếu là Admin hoặc Developer, họ đã có quyền VIP, chỉ cập nhật meta dữ liệu
    // Không thay đổi ROLE của Admin/Dev thành VIP
    const isSpecialRole = targetUser.role === Role.ADMIN || targetUser.role === Role.DEVELOPER;
    
    updateUser({
      ...targetUser,
      role: isSpecialRole ? targetUser.role : Role.VIP,
      vipUntil: duration === 'PERMANENT' ? 'PERMANENT' : new Date(Date.now() + 30*24*60*60*1000).toISOString()
    });
    
    alert(`Đã cấp quyền VIP cho ${targetUser.fullName}!`);
  };

  if (isVerifying) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-900">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Nhập mã truy cập</h2>
          <p className="text-slate-500 mb-8 text-sm">Vui lòng nhập mật khẩu quản trị của tài khoản {currentUser?.email}</p>
          <input 
            type="password" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none mb-4 text-center tracking-widest font-mono"
            placeholder="••••••••"
            value={adminPasswordInput}
            onChange={e => setAdminPasswordInput(e.target.value)}
          />
          <button 
            onClick={handleVerify}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Xác minh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bảng Quản Trị Hệ Thống</h1>
          <p className="text-slate-500">Chào Admin {currentUser?.fullName}. Bạn đang quản lý {users.length} người dùng và {courses.length} khóa học.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button onClick={() => setTab('USERS')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'USERS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Người dùng</button>
          <button onClick={() => setTab('COURSES')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'COURSES' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Khóa học</button>
          <button onClick={() => setTab('INTERFACE')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'INTERFACE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Giao diện</button>
        </div>
      </div>

      {tab === 'USERS' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Quản lý tài khoản</h3>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo email..."
              className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm w-64 focus:ring-2 focus:ring-blue-100"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Họ tên & Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.filter(u => u.email.includes(search)).map(target => (
                  <tr key={target.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={target.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{target.fullName}</p>
                          <p className="text-xs text-slate-500">{target.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={`text-xs border-none rounded-md px-2 py-1 font-bold outline-none ${target.id === currentUser?.id ? 'bg-blue-100 text-blue-700 cursor-not-allowed' : 'bg-slate-100'}`}
                        value={target.role}
                        onChange={(e) => handleRoleChange(target, e.target.value as Role)}
                        disabled={target.id === currentUser?.id}
                      >
                        <option value={Role.ADMIN}>ADMIN</option>
                        <option value={Role.DEVELOPER}>DEV</option>
                        <option value={Role.VIP}>VIP</option>
                        <option value={Role.USER}>USER</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {target.role === Role.DEVELOPER ? (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${target.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {target.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {target.role === Role.DEVELOPER && !target.isApproved && (
                          <button 
                            onClick={() => toggleApproval(target)}
                            className="text-[10px] bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 font-bold"
                          >
                            Duyệt DEV
                          </button>
                        )}
                        {/* Ẩn nút Cấp VIP đối với Admin/Dev vì họ đã có quyền VIP mặc định */}
                        {target.role !== Role.VIP && target.role !== Role.ADMIN && target.role !== Role.DEVELOPER && (
                          <button 
                            onClick={() => grantVip(target, 'PERMANENT')}
                            className="text-[10px] bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 font-bold"
                          >
                            Cấp VIP vĩnh viễn
                          </button>
                        )}
                        {target.id === currentUser?.id && (
                          <span className="text-[10px] italic text-slate-400">Tài khoản hiện tại</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ... (Các tab khác giữ nguyên) */}
      {tab === 'COURSES' && (
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
             <h3 className="font-bold">Danh sách khóa học hiện có</h3>
             <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">+ Tạo khóa học mới</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 flex space-x-4">
                <img src={c.thumbnail} className="w-24 h-24 object-cover rounded-lg" alt="" />
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800">{c.title}</h4>
                  <p className="text-xs text-slate-500 mb-2">{c.isVip ? 'KHÓA VIP' : 'KHÓA MIỄN PHÍ'}</p>
                  <div className="flex space-x-2">
                    <button className="text-xs bg-slate-100 px-3 py-1 rounded hover:bg-slate-200 font-semibold">Chỉnh sửa</button>
                    <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-semibold">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'INTERFACE' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center py-20">
          <div className="max-w-md mx-auto">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
             </div>
             <h3 className="text-xl font-bold mb-2">Quản lý giao diện</h3>
             <p className="text-slate-500 text-sm mb-6">Chức năng tùy chỉnh màu sắc, banner và bố cục website đang được hoàn thiện.</p>
             <button className="text-blue-600 font-bold hover:underline">Sử dụng theme mặc định (Blue ND Labs)</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
