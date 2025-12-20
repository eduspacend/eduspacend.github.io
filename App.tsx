
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Role, User, Course, Suggestion, SiteSettings } from './types';
import { db } from './db';
import { ADMIN_EMAILS } from './constants';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DevDashboard from './pages/DevDashboard';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import Studio from './pages/Studio';
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

interface ConfigContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const ConfigContext = createContext<ConfigContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig must be used within ConfigProvider");
  return context;
};

const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  const updateSettings = (newSettings: SiteSettings) => {
    db.saveSettings(newSettings);
    setSettings(newSettings);
  };

  return (
    <ConfigContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ConfigContext.Provider>
  );
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
      if (ADMIN_EMAILS.includes(parsedUser.email) && parsedUser.role !== Role.ADMIN) {
        parsedUser.role = Role.ADMIN;
        localStorage.setItem('eduspace_current_user', JSON.stringify(parsedUser));
      }
      setUser(parsedUser);
    }
  }, []);

  const refreshData = () => {
    setUsers(db.getUsers());
    setCourses(db.getCourses());
    setSuggestions(db.getSuggestions());
  };

  const login = async (email: string, pass: string) => {
    let allUsers = db.getUsers();
    const foundIndex = allUsers.findIndex(u => u.email === email && u.password === pass);
    if (foundIndex !== -1) {
      let foundUser = allUsers[foundIndex];
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
  return <>{children}</>;
};

const App: React.FC = () => {
  const settings = db.getSettings();
  
  return (
    <ConfigProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow pt-14">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute role={[Role.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/developer" element={<ProtectedRoute role={[Role.DEVELOPER, Role.ADMIN]}><DevDashboard /></ProtectedRoute>} />
                <Route path="/studio" element={<ProtectedRoute role={[Role.DEVELOPER, Role.ADMIN]}><Studio /></ProtectedRoute>} />
                <Route path="/studio/:courseId" element={<ProtectedRoute role={[Role.DEVELOPER, Role.ADMIN]}><Studio /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-slate-50 py-4 px-6 md:px-12 mt-auto">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-100 p-1 shadow-sm flex items-center justify-center">
                    <img src={settings.logoUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                  <p className="text-[11px] font-black text-slate-800 tracking-tight">
                    {settings.brandName} <span className="text-slate-300 font-bold mx-1">by</span> <span className="text-blue-600">ND Labs</span>
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                   <a href="https://nd-site.github.io" target="_blank" className="text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-black uppercase tracking-[0.2em]">ND LABS</a>
                   <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-black uppercase tracking-[0.2em]">BẢO MẬT</a>
                   <p className="text-[9px] text-slate-300 font-black">© 2024</p>
                </div>
              </div>
            </footer>
          </div>
        </HashRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
