import React, { useReducer, createContext, Dispatch, useEffect, useState, ReactNode, useContext } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import type { Course, Topic, User } from './types';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicDetailPage from './pages/TopicDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersListPage from './pages/admin/AdminUsersListPage';
import { ConfirmModal } from './components/Modal';

const ADMIN_EMAIL = 'bagherimahdi1300@gmail.com';

// --- STATE MANAGEMENT (useReducer) ---

type Action =
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: { name: string; description: string } }
  | { type: 'EDIT_COURSE'; payload: { courseId: string; name: string; description: string } }
  | { type: 'DELETE_COURSE'; payload: { courseId: string } }
  | { type: 'ADD_TOPIC'; payload: { courseId: string; title: string } }
  | { type: 'EDIT_TOPIC'; payload: { courseId: string; topicId: string; title: string } }
  | { type: 'DELETE_TOPIC'; payload: { courseId: string; topicId: string } }
  | { type: 'UPDATE_TOPIC_DETAILS'; payload: { courseId: string; topicId: string; notes: string; imageUrls?: string[] } };


const courseReducer = (state: Course[], action: Action): Course[] => {
  switch (action.type) {
    case 'SET_COURSES':
      return action.payload;
    case 'ADD_COURSE':
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        topics: [],
        createdAt: Date.now(),
      };
      return [newCourse, ...state];
    
    case 'EDIT_COURSE':
      return state.map(course => 
        course.id === action.payload.courseId
          ? { ...course, name: action.payload.name, description: action.payload.description }
          : course
      );

    case 'DELETE_COURSE':
      return state.filter(course => course.id !== action.payload.courseId);

    case 'ADD_TOPIC':
      return state.map(course => {
        if (course.id === action.payload.courseId) {
          const now = Date.now();
          const newTopic: Topic = {
            id: `topic-${now}`,
            title: action.payload.title,
            notes: '',
            imageUrls: [],
            createdAt: now,
          };
          // Adding new topic to the end of the array, so sort order remains old to new
          return { ...course, topics: [...course.topics, newTopic] };
        }
        return course;
      });

    case 'EDIT_TOPIC':
      return state.map(course => {
        if (course.id === action.payload.courseId) {
          const updatedTopics = course.topics.map(topic =>
            topic.id === action.payload.topicId ? { ...topic, title: action.payload.title } : topic
          );
          return { ...course, topics: updatedTopics };
        }
        return course;
      });

    case 'DELETE_TOPIC':
      return state.map(course => {
        if (course.id === action.payload.courseId) {
          const filteredTopics = course.topics.filter(topic => topic.id !== action.payload.topicId);
          return { ...course, topics: filteredTopics };
        }
        return course;
      });
      
    case 'UPDATE_TOPIC_DETAILS':
      return state.map(course => {
        if (course.id === action.payload.courseId) {
          const updatedTopics = course.topics.map(topic => {
            if (topic.id === action.payload.topicId) {
              return {
                ...topic,
                notes: action.payload.notes,
                imageUrls: action.payload.imageUrls !== undefined ? action.payload.imageUrls : topic.imageUrls,
              };
            }
            return topic;
          });
          return { ...course, topics: updatedTopics };
        }
        return course;
      });

    default:
      return state;
  }
};

const getCourseStorageKey = (email: string | null) => email ? `course-syllabus-data-${email}` : null;

// --- CONTEXTS ---
export const CourseContext = createContext<{
  courses: Course[];
  dispatch: Dispatch<Action>;
}>({
  courses: [],
  dispatch: () => null,
});

export const AuthContext = createContext<{
    currentUser: (User & { isAdmin: boolean }) | null;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    deleteUser: () => void;
}>({
    currentUser: null,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
    deleteUser: () => {},
});

type Theme = 'light' | 'dark';
export const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
}>({
    theme: 'dark',
    toggleTheme: () => {},
});

// --- LAYOUT FOR AUTHENTICATED USERS ---
const AuthenticatedLayout = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    const handleLogoutConfirm = () => {
        logout();
        setIsLogoutConfirmOpen(false);
    }
    
    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white selection:bg-sky-400 selection:text-sky-900">
                <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-900 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                
                <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-black/10 dark:border-white/10">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <Link to="/profile" className="flex items-center gap-2 group">
                                {currentUser?.profilePicture ? (
                                    <img src={currentUser.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-gray-500 group-hover:border-sky-400 transition" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold border-2 border-gray-500 group-hover:border-sky-400 transition">
                                        {currentUser?.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition">{currentUser?.username}</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <span className="text-sm font-medium">{theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}</span>
                            </button>
                            <button onClick={() => setIsLogoutConfirmOpen(true)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <span className="text-sm font-medium">خروج</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    <Outlet />
                </main>
            </div>
            <ConfirmModal
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={handleLogoutConfirm}
                title="خروج از حساب"
                message="آیا برای خروج از حساب کاربری خود اطمینان دارید؟"
                confirmText="خروج"
                cancelText="بازگشت"
            />
        </>
    )
}

// --- PROTECTED & ADMIN ROUTE COMPONENTS ---
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (!currentUser.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};


// --- DATA PROVIDERS ---
const CourseDataProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useContext(AuthContext);
    
    const initializer = (user: User | null): Course[] => {
        const storageKey = getCourseStorageKey(user?.email || null);
        if (!storageKey) return [];
        try {
            const storedData = localStorage.getItem(storageKey);
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) { console.error("Error reading from localStorage:", error); return []; }
    };

    const [courses, dispatch] = useReducer(courseReducer, currentUser, initializer);

    useEffect(() => {
        dispatch({ type: 'SET_COURSES', payload: initializer(currentUser) });
    }, [currentUser]);

    useEffect(() => {
        const storageKey = getCourseStorageKey(currentUser?.email || null);
        if (storageKey) {
            try { localStorage.setItem(storageKey, JSON.stringify(courses)); } 
            catch (error) { console.error("Error writing to localStorage:", error); }
        }
    }, [courses, currentUser]);

    return (
        <CourseContext.Provider value={{ courses, dispatch }}>
            {children}
        </CourseContext.Provider>
    );
};

// --- LAYOUT FOR ADMIN MANAGEMENT VIEW ---
const AdminManagementLayout = () => {
    const { userEmail } = useParams<{ userEmail: string }>();
    const navigate = useNavigate();
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find((u: any) => u.email === userEmail);
        setTargetUser(foundUser || null);
    }, [userEmail]);

    const initializer = (): Course[] => {
        const storageKey = getCourseStorageKey(userEmail || null);
        if (!storageKey) return [];
        try {
            const storedData = localStorage.getItem(storageKey);
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) { console.error("Error reading from localStorage:", error); return []; }
    };

    const [courses, dispatch] = useReducer(courseReducer, initializer());

    useEffect(() => {
        const storageKey = getCourseStorageKey(userEmail || null);
        if (storageKey) {
            try { localStorage.setItem(storageKey, JSON.stringify(courses)); } 
            catch (error) { console.error("Error writing to localStorage:", error); }
        }
    }, [courses, userEmail]);
    
    const handleDeleteUser = () => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter((u: any) => u.email !== userEmail);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        const courseKey = getCourseStorageKey(userEmail || null);
        if (courseKey) localStorage.removeItem(courseKey);

        setIsDeleteModalOpen(false);
        navigate('/admin/users');
    };

    if (!targetUser) {
        return <div className="text-center p-8">کاربر یافت نشد.</div>;
    }

    return (
        <CourseContext.Provider value={{ courses, dispatch }}>
            <div className="mb-6 p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-500/20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-right">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">مدیریت کاربر: <span className="font-mono">{targetUser.username}</span></h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">شما در حال مشاهده و ویرایش دوره‌های این کاربر هستید.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/admin/users" className="rounded-lg bg-gray-500/50 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-500">بازگشت به لیست</Link>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500">حذف این کاربر</button>
                    </div>
                </div>
            </div>
            <Outlet />
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title={`حذف کاربر ${targetUser.username}`}
                message="آیا از حذف این کاربر اطمینان دارید؟ تمام دوره‌ها و اطلاعات او برای همیشه حذف خواهد شد."
                confirmText="بله، حذف کن"
                isDestructive
            />
        </CourseContext.Provider>
    )
};


// --- THEME PROVIDER ---
const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    const [currentUser, setCurrentUser] = useState<(User & { isAdmin: boolean }) | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) return null;
        const user = JSON.parse(storedUser);
        return { ...user, isAdmin: user.email === ADMIN_EMAIL };
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Seed admin user if not exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const adminExists = users.some((u: any) => u.email === ADMIN_EMAIL);
        if (!adminExists) {
            const adminUser = {
                email: ADMIN_EMAIL,
                password: '1382_Mahdi_1382',
                username: 'Admin',
                createdAt: Date.now(),
                profilePicture: null
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }, []);

    const login = (user: User) => {
        const isAdmin = user.email === ADMIN_EMAIL;
        const userWithAdmin = { ...user, isAdmin };
        setCurrentUser(userWithAdmin);
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/');
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const updateUser = (updatedUser: User) => {
        if (!currentUser) return;
        const isAdmin = updatedUser.email === ADMIN_EMAIL;
        setCurrentUser({ ...updatedUser, isAdmin });
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === updatedUser.email);
        if (userIndex > -1) {
            const oldPassword = users[userIndex].password;
            users[userIndex] = { ...updatedUser, password: oldPassword }; 
            localStorage.setItem('users', JSON.stringify(users));
        }
    };

    const deleteUser = () => {
        if (!currentUser || currentUser.isAdmin) return;
        
        const courseKey = getCourseStorageKey(currentUser.email);
        if(courseKey) localStorage.removeItem(courseKey);

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter((u: any) => u.email !== currentUser.email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        logout();
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, updateUser, deleteUser }}>
            <ThemeProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    <Route 
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <CourseDataProvider>
                                    <Routes>
                                        <Route element={<AuthenticatedLayout />}>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                            <Route path="/course/:courseId" element={<CoursePage />} />
                                            <Route path="/course/:courseId/topic/:topicId" element={<TopicDetailPage />} />

                                            <Route path="/admin/users" element={
                                                <AdminRoute><AdminUsersListPage /></AdminRoute>
                                            } />
                                            {/* FIX: Refactored nested routing for admin user management to align with react-router-dom v6 best practices. 
                                                This resolves a type error where AdminManagementLayout was incorrectly passed children.
                                                The new structure uses AdminManagementLayout as a layout route with an <Outlet/>. */}
                                            <Route path="/admin/users/:userEmail" element={
                                                <AdminRoute>
                                                    <AdminManagementLayout />
                                                </AdminRoute>
                                            }>
                                                <Route index element={<HomePage />} />
                                                <Route path="course/:courseId" element={<CoursePage />} />
                                                <Route path="course/:courseId/topic/:topicId" element={<TopicDetailPage />} />
                                            </Route>
                                            <Route path="*" element={<Navigate to="/" />} />
                                        </Route>
                                    </Routes>
                                </CourseDataProvider>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </ThemeProvider>
        </AuthContext.Provider>
    );
};

export default App;
