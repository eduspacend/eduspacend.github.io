
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
  isApproved?: boolean; // For Developer role
  vipUntil?: string | 'PERMANENT'; // ISO date or permanent
  managementPassword?: string; // Unique password for Admin/Dev access
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
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
