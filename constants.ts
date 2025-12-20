
import { Role, User, Course } from './types';

export const ADMIN_EMAILS = [
  'nhatdang10.nd@gmail.com',
  'chaunhatdangne5110@gmail.com'
];

// Sử dụng đường dẫn tương đối để đảm bảo logo.png được tìm thấy chính xác
export const DEFAULT_LOGO = 'logo.png';

export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'nhatdang10.nd@gmail.com',
    password: 'cnd5110@.c',
    fullName: 'Nhật Đăng (Admin)',
    role: Role.ADMIN,
    managementPassword: 'adminpassword123',
    avatar: 'https://picsum.photos/seed/admin1/200'
  },
  {
    id: 'admin-2',
    email: 'chaunhatdangne5110@gmail.com',
    password: 'defaultpassword',
    fullName: 'Châu Nhật Đăng (Admin)',
    role: Role.ADMIN,
    managementPassword: 'adminpassword456',
    avatar: 'https://picsum.photos/seed/admin2/200'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Lập trình React cơ bản',
    description: 'Khóa học dành cho người mới bắt đầu với React và Tailwind CSS.',
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    isVip: false,
    authorId: 'admin-1',
    status: 'PUBLISHED',
    lessons: [
      { id: 'l1', title: 'Giới thiệu về React', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Nội dung bài học đầu tiên về React.' }
    ],
    quizzes: []
  },
  {
    id: 'c2',
    title: 'NodeJS Nâng Cao (VIP)',
    description: 'Học cách xây dựng server-side mạnh mẽ với NodeJS và Express.',
    thumbnail: 'https://picsum.photos/seed/node/800/450',
    isVip: true,
    authorId: 'admin-2',
    status: 'PUBLISHED',
    lessons: [
      { id: 'l2', title: 'Cấu trúc thư mục chuyên nghiệp', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Học cách tổ chức code Nodejs.' }
    ],
    quizzes: []
  }
];
