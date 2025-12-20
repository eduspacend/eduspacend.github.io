
import React from 'react';
import { useAuth } from '../App';
import { Role } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-700 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563eb&color=fff`} 
              className="w-32 h-32 rounded-full border-4 border-white object-cover" 
              alt={user.fullName} 
            />
          </div>
        </div>
        
        <div className="pt-16 pb-10 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{user.fullName}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">{user.role}</span>
                <span className="text-slate-500 text-sm">{user.email}</span>
              </div>
            </div>
            <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all">Chỉnh sửa hồ sơ</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-slate-100 pt-8">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 text-lg">Thông tin cá nhân</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Mật khẩu quản trị (Nếu có)</p>
                  <p className="text-slate-800 font-medium font-mono">{user.managementPassword || 'Chưa thiết lập'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Ngày tham gia</p>
                  <p className="text-slate-800 font-medium">10 tháng 1, 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
               <h3 className="font-bold text-blue-800 mb-4">Trạng thái tài khoản</h3>
               {user.role === Role.ADMIN ? (
                 <p className="text-blue-600 text-sm">Bạn là Quản trị viên cấp cao của hệ thống EduSpace. Mọi hoạt động của bạn được ND Labs ghi nhận.</p>
               ) : user.role === Role.DEVELOPER ? (
                 <p className="text-blue-600 text-sm">Bạn đang giữ vai trò Developer. Hãy tận dụng tối đa các công cụ AI để phát triển nội dung.</p>
               ) : user.role === Role.VIP ? (
                 <p className="text-blue-600 text-sm">Cảm ơn bạn đã nâng cấp VIP. Hãy tận hưởng các khóa học chất lượng cao của chúng tôi!</p>
               ) : (
                 <div className="space-y-4">
                   <p className="text-slate-600 text-sm">Hiện tại bạn đang sử dụng tài khoản MIỄN PHÍ.</p>
                   <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700">Nâng cấp lên VIP ngay</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
