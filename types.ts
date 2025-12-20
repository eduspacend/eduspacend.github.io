
export enum Role {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  VIP = 'VIP',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  role: Role;
  avatar?: string;
  isApproved?: boolean;
  vipUntil?: string | 'PERMANENT';
  managementPassword?: string;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
  summary?: string;
}

export type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';

export interface Quiz {
  id: string;
  type: QuizType;
  question: string;
  options?: string[]; // Dùng cho MULTIPLE_CHOICE
  correctAnswer?: string | number; // Index cho MC/TF, String cho Short Answer
  explanation?: string; // Gợi ý đáp án hoặc tiêu chí chấm cho Essay
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isVip: boolean;
  lessons: Lesson[];
  quizzes: Quiz[];
  authorId: string;
  status: 'PENDING' | 'PUBLISHED';
}

export interface Suggestion {
  id: string;
  userId: string;
  type: 'COURSE' | 'USER_REFORM' | 'INTERFACE';
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
}
