
import { User, Course, Role, Suggestion } from './types';
import { INITIAL_USERS, INITIAL_COURSES } from './constants';

const USERS_KEY = 'eduspace_users';
const COURSES_KEY = 'eduspace_courses';
const SUGGESTIONS_KEY = 'eduspace_suggestions';

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
  }
};
