
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Role, User, Course, Suggestion } from './types';
import { db } from './db';
import { ADMIN_EMAILS } from './constants';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DevDashboard from './pages/DevDashboard';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updated: User) => void;
  users: User[];
  courses: Course[];
  suggestions: Suggestion[];
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [courses, setCourses] = useState<Course[]>(db.getCourses());
  const [suggestions, setSuggestions] = useState<Suggestion[]>(db.getSuggestions());

  useEffect(() => {
    const savedUser = localStorage.getItem('eduspace_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Recovery: Force Admin role if email is in ADMIN_EMAILS
      if (ADMIN_EMAILS.includes(parsedUser.email) && parsedUser.role !== Role.ADMIN) {
        parsedUser.role = Role.ADMIN;
        localStorage.setItem('eduspace_current_user', JSON.stringify(parsedUser));
      }
      setUser(parsedUser);
    }
  }, []);

  const refreshData = () => {
    const allUsers = db.getUsers();
    setUsers(allUsers);
    setCourses(db.getCourses());
    setSuggestions(db.getSuggestions());
  };

  const login = async (email: string, pass: string) => {
    let allUsers = db.getUsers();
    const foundIndex = allUsers.findIndex(u => u.email === email && u.password === pass);
    
    if (foundIndex !== -1) {
      let foundUser = allUsers[foundIndex];
      
      // Safety net: Nếu email nằm trong danh sách Admin hardcoded, buộc phải là Admin
      if (ADMIN_EMAILS.includes(email) && foundUser.role !== Role.ADMIN) {
        foundUser.role = Role.ADMIN;
        allUsers[foundIndex] = foundUser;
        db.saveUsers(allUsers);
      }
      
      setUser(foundUser);
      localStorage.setItem('eduspace_current_user', JSON.stringify(foundUser));
      refreshData();
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduspace_current_user');
  };

  const updateUser = (updated: User) => {
    const allUsers = db.getUsers().map(u => u.id === updated.id ? updated : u);
    db.saveUsers(allUsers);
    if (user?.id === updated.id) {
      setUser(updated);
      localStorage.setItem('eduspace_current_user', JSON.stringify(updated));
    }
    setUsers(allUsers);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, users, courses, suggestions, refreshData }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children?: React.ReactNode, role?: Role[] }> = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && !role.includes(user.role)) return <Navigate to="/" />;
  if (user.role === Role.DEVELOPER && !user.isApproved) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6 text-center">
         <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-200">
           <h2 className="text-2xl font-bold text-blue-700 mb-4">Đang chờ phê duyệt</h2>
           <p className="text-slate-600">Tài khoản Developer của bạn đang chờ Admin xác nhận. Vui lòng quay lại sau.</p>
           <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">Về trang chủ</Link>
         </div>
       </div>
     );
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute role={[Role.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/developer" 
                element={
                  <ProtectedRoute role={[Role.DEVELOPER, Role.ADMIN]}>
                    <DevDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-blue-900 text-white py-8 px-4 text-center mt-auto">
            <p className="mb-2">EduSpace © 2024 ND Labs. Mọi quyền được bảo lưu.</p>
            <a href="https://nd-site.github.io" target="_blank" className="text-blue-300 hover:text-white underline text-sm">ND Labs Homepage</a>
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
