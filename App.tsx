

import React, { createContext, useReducer, useEffect, useState, useMemo, useContext, useRef } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { User, Course, Topic } from './types';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicDetailPage from './pages/TopicDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersListPage from './pages/admin/AdminUsersListPage';
import AdminManageUserPage from './pages/admin/AdminManageUserPage';
import AdminEditUserPage from './pages/admin/AdminEditUserPage';
import AdminUserCoursesPage from './pages/admin/AdminUserCoursesPage'; // New admin page
import { SunIcon, MoonIcon, LogoutIcon } from './components/icons';
import { ConfirmModal } from './components/Modal';
import { AnimatePresence, motion } from 'framer-motion';

// --- INITIAL DATA & LOCAL STORAGE ---

const ADMIN_EMAIL = 'bagherimahdi1300@gmail.com';

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// --- COURSE CONTEXT & REDUCER ---

type CourseAction =
  | { type: 'ADD_COURSE'; payload: { name: string; description: string; userEmail: string } }
  | { type: 'EDIT_COURSE'; payload: { courseId: string; name: string; description: string } }
  | { type: 'DELETE_COURSE'; payload: { courseId: string } }
  | { type: 'ADD_TOPIC'; payload: { courseId: string; title: string } }
  | { type: 'EDIT_TOPIC'; payload: { courseId: string; topicId: string; title: string } }
  | { type: 'DELETE_TOPIC'; payload: { courseId: string; topicId: string } }
  | { type: 'UPDATE_TOPIC_DETAILS'; payload: { courseId: string; topicId: string; notes: string; imageUrls: string[] } }
  | { type: 'DELETE_COURSES_BY_USER'; payload: { userEmail: string } };

const courseReducer = (state: Course[], action: CourseAction): Course[] => {
  switch (action.type) {
    case 'ADD_COURSE': {
      const newCourse: Course = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        topics: [],
        createdAt: Date.now(),
        userEmail: action.payload.userEmail,
      };
      return [...state, newCourse];
    }
    case 'EDIT_COURSE':
      return state.map(course =>
        course.id === action.payload.courseId
          ? { ...course, name: action.payload.name, description: action.payload.description }
          : course
      );
    case 'DELETE_COURSE':
      return state.filter(course => course.id !== action.payload.courseId);
    case 'ADD_TOPIC': {
      const newTopic: Topic = {
        id: uuidv4(),
        title: action.payload.title,
        notes: '',
        imageUrls: [],
        createdAt: Date.now(),
      };
      return state.map(course =>
        course.id === action.payload.courseId
          ? { ...course, topics: [...course.topics, newTopic] }
          : course
      );
    }
    case 'EDIT_TOPIC':
      return state.map(course =>
        course.id === action.payload.courseId
          ? {
              ...course,
              topics: course.topics.map(topic =>
                topic.id === action.payload.topicId
                  ? { ...topic, title: action.payload.title }
                  : topic
              ),
            }
          : course
      );
    case 'DELETE_TOPIC':
      return state.map(course =>
        course.id === action.payload.courseId
          ? { ...course, topics: course.topics.filter(topic => topic.id !== action.payload.topicId) }
          : course
      );
    case 'UPDATE_TOPIC_DETAILS':
      return state.map(course =>
        course.id === action.payload.courseId
          ? {
              ...course,
              topics: course.topics.map(topic =>
                topic.id === action.payload.topicId
                  ? { ...topic, notes: action.payload.notes, imageUrls: action.payload.imageUrls }
                  : topic
              ),
            }
          : course
      );
    case 'DELETE_COURSES_BY_USER':
        return state.filter(course => course.userEmail !== action.payload.userEmail);
    default:
      return state;
  }
};

interface CourseContextType {
    courses: Course[]; // Courses for the logged-in user
    allCourses: Course[]; // All courses, for admin use
    dispatch: React.Dispatch<CourseAction>;
}

export const CourseContext = createContext<CourseContextType>({
    courses: [],
    allCourses: [],
    dispatch: () => undefined,
});

const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [allCourses, dispatch] = useReducer(courseReducer, [], () => {
        // Initialize state from a single global key
        return getInitialState<Course[]>('global_courses', []);
    });

    // Persist all courses to the single global key
    useEffect(() => {
        window.localStorage.setItem('global_courses', JSON.stringify(allCourses));
    }, [allCourses]);

    // Filter courses for the currently logged-in user
    const userCourses = useMemo(() => {
        if (!user) return [];
        return allCourses.filter(course => course.userEmail === user.email);
    }, [allCourses, user]);
    
    return (
        <CourseContext.Provider value={{ courses: userCourses, allCourses, dispatch }}>
            {children}
        </CourseContext.Provider>
    );
};

// --- AUTH CONTEXT ---
interface StoredUser extends User {
    password?: string;
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    isInitialized: boolean;
    login: (credentials: { email: string; password?: string }) => boolean;
    logout: () => void;
    addUser: (user: StoredUser) => boolean;
    updateUser: (updates: Partial<User>) => void;
    changePassword: (oldPass: string, newPass: string) => boolean;
    deleteCurrentUser: () => void;
    getAllUsers: () => StoredUser[];
    updateUserByEmail: (email: string, updates: Partial<StoredUser>) => boolean;
    deleteUserByEmail: (email: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<StoredUser[]>(() => getInitialState<StoredUser[]>('users', [{
        username: 'Admin',
        email: ADMIN_EMAIL,
        password: '1382_Mahdi_1382',
        createdAt: Date.now(),
        profilePicture: null,
    }]));
    const [user, setUser] = useState<User | null>(() => getInitialState<User | null>('currentUser', null));
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.localStorage.setItem('users', JSON.stringify(users));
    }, [users]);
    
    useEffect(() => {
        window.localStorage.setItem('currentUser', JSON.stringify(user));
        if (!isInitialized) setIsInitialized(true);
    }, [user, isInitialized]);
    
    const authContextValue = useMemo(() => ({
        user,
        isAdmin: user?.email === ADMIN_EMAIL,
        isInitialized,
        login: ({ email, password }) => {
            const foundUser = users.find(u => u.email === email && u.password === password);
            if (foundUser) {
                const { password, ...userToStore } = foundUser;
                setUser(userToStore);
                return true;
            }
            return false;
        },
        logout: () => {
            setUser(null);
            navigate('/login');
        },
        addUser: (newUser) => {
            if (users.some(u => u.email === newUser.email)) return false;
            setUsers(prev => [...prev, newUser]);
            return true;
        },
        updateUser: (updates) => {
            if (!user) return;
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            setUsers(prev => prev.map(u => u.email === user.email ? { ...u, ...updatedUser } : u));
        },
        changePassword: (oldPass, newPass) => {
            if (!user) return false;
            const userWithPass = users.find(u => u.email === user.email);
            if (userWithPass && userWithPass.password === oldPass) {
                setUsers(prev => prev.map(u => u.email === user.email ? { ...u, password: newPass } : u));
                return true;
            }
            return false;
        },
        deleteCurrentUser: () => {
            if (!user || user.email === ADMIN_EMAIL) return;
            const userEmail = user.email;
            setUsers(prev => prev.filter(u => u.email !== userEmail));
            setUser(null);
            navigate('/login');
        },
        getAllUsers: () => users,
        updateUserByEmail: (email, updates) => {
            if (!users.some(u => u.email === email)) return false;
            setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updates } : u));
            if (user?.email === email) {
                setUser(prev => prev ? {...prev, ...updates} : null);
            }
            return true;
        },
        deleteUserByEmail: (email) => {
            if (email === ADMIN_EMAIL) return false;
            setUsers(prev => prev.filter(u => u.email !== email));
            return true;
        },
    }), [user, users, isInitialized, navigate]);

    return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// --- THEME ---
const useTheme = () => {
    const [theme, setTheme] = useState(() => getInitialState<'light' | 'dark'>('theme', 'dark'));

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    return { theme, toggleTheme };
};


// --- LAYOUT ---
const Layout: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
             <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-900 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <header className="sticky top-0 z-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-b border-black/10 dark:border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Right Side: User Profile */}
                         <Link to="/profile" className="flex items-center gap-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <img src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                            <span className="font-semibold">{user.username}</span>
                        </Link>

                        {/* Left Side: Controls */}
                        <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                            </button>
                            <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <LogoutIcon className="w-5 h-5" />
                                <span>خروج</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={logout}
                title="خروج از حساب"
                message="آیا برای خروج از حساب خود اطمینان دارید؟"
                confirmText="خروج از حساب"
                cancelText="انصراف"
                isDestructive={true}
            />
        </div>
    );
};

// --- ROUTE PROTECTION ---
const PrivateRoute: React.FC = () => {
    const { user, isInitialized } = useContext(AuthContext);
    const location = useLocation();

    if (!isInitialized) return null;

    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

const AdminRoute: React.FC = () => {
    const { user, isAdmin, isInitialized } = useContext(AuthContext);

    if (!isInitialized) return null;

    return user && isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<Layout />}>
            <Route element={<PrivateRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/course/:courseId" element={<CoursePage />} />
                <Route path="/course/:courseId/topic/:topicId" element={<TopicDetailPage />} />
                <Route element={<AdminRoute />}>
                    <Route path="/admin/users" element={<AdminUsersListPage />} />
                    <Route path="/admin/users/:userEmail" element={<AdminManageUserPage />} />
                    <Route path="/admin/users/:userEmail/profile" element={<AdminEditUserPage />} />
                    <Route path="/admin/users/:userEmail/courses" element={<AdminUserCoursesPage />} />
                </Route>
            </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);


function App() {
  return (
    <AuthProvider>
        <CourseProvider>
            <AppRoutes />
        </CourseProvider>
    </AuthProvider>
  );
}

export default App;