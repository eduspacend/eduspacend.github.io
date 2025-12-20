
import React from 'react';
import { useAuth, useConfig } from '../App';
import { Role } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useConfig();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-48 relative" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.primaryColor}dd)` }}>
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=${settings.primaryColor.replace('#', '')}&color=fff`} 
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-sm" 
              alt={user.fullName} 
            />
          </div>
        </div>
        
        <div className="pt-16 pb-10 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{user.fullName}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 text-xs font-bold rounded-full uppercase" style={{ backgroundColor: `${settings.primaryColor}20`, color: settings.primaryColor }}>{user.role}</span>
                <span className="text-slate-500 text-sm">{user.email}</span>
              </div>
            </div>
            <button className="px-6 py-2 border-2 font-bold rounded-xl transition-all hover:opacity-80" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>Chỉnh sửa hồ sơ</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-slate-100 pt-8">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 text-lg">Thông tin tài khoản</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Mã quản trị</p>
                  <p className="text-slate-800 font-medium font-mono">{user.managementPassword || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Thành viên từ</p>
                  <p className="text-slate-800 font-medium">Tháng 1, 2024</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border" style={{ backgroundColor: `${settings.primaryColor}08`, borderColor: `${settings.primaryColor}20` }}>
               <h3 className="font-bold mb-4" style={{ color: settings.primaryColor }}>Tư cách thành viên</h3>
               {user.role === Role.ADMIN ? (
                 <p className="text-slate-600 text-sm">Bạn là Quản trị viên của {settings.brandName}. Bạn có toàn quyền quản lý hệ thống.</p>
               ) : user.role === Role.VIP ? (
                 <p className="text-slate-600 text-sm">Cảm ơn bạn đã nâng cấp VIP. Hãy tận hưởng các khóa học chất lượng cao!</p>
               ) : (
                 <div className="space-y-4">
                   <p className="text-slate-600 text-sm">Hiện tại bạn đang sử dụng tài khoản MIỄN PHÍ.</p>
                   <button className="w-full text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>Nâng cấp lên VIP ngay</button>
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
