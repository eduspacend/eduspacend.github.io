
import { User, Course, Role, Suggestion, SiteSettings } from './types';
import { INITIAL_USERS, INITIAL_COURSES, DEFAULT_LOGO } from './constants';

const USERS_KEY = 'eduspace_users';
const COURSES_KEY = 'eduspace_courses';
const SUGGESTIONS_KEY = 'eduspace_suggestions';
const SETTINGS_KEY = 'eduspace_settings';

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'EduSpace',
  logoUrl: DEFAULT_LOGO,
  primaryColor: '#2563eb',
  heroTitle: 'Nâng Tầm Kiến Thức Với EduSpace',
  heroSubtitle: 'Hệ thống giáo dục trực tuyến hàng đầu của ND Labs. Học tập mọi lúc, mọi nơi với các chuyên gia.'
};

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  getCourses: (): Course[] => {
    const data = localStorage.getItem(COURSES_KEY);
    return data ? JSON.parse(data) : INITIAL_COURSES;
  },
  saveCourses: (courses: Course[]) => {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  },
  getSuggestions: (): Suggestion[] => {
    const data = localStorage.getItem(SUGGESTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSuggestions: (suggestions: Suggestion[]) => {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  },
  getSettings: (): SiteSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    try {
      const settings = JSON.parse(data);
      
      // Kiểm tra nghiêm ngặt: nếu logoUrl không phải là 'logo.png' và cũng không phải là 
      // một chuỗi base64 (người dùng tự upload), thì ép nó về mặc định.
      const isCorrectLogo = settings.logoUrl === 'logo.png' || settings.logoUrl === '/logo.png' || settings.logoUrl.startsWith('data:image');
      
      if (!isCorrectLogo) {
        settings.logoUrl = DEFAULT_LOGO;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      }
      
      return settings;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: (settings: SiteSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
