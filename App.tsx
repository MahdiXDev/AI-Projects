import React, { createContext, useReducer, useEffect, useState, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, Outlet, Link, useParams } from 'react-router-dom';
import type { Course, Topic, User } from './types';
import { v4 as uuidv4 } from 'uuid';

import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicDetailPage from './pages/TopicDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersListPage from './pages/admin/AdminUsersListPage';
import AdminManageUserPage from './pages/admin/AdminManageUserPage';
import AdminEditUserPage from './pages/admin/AdminEditUserPage';
import { ConfirmModal } from './components/Modal';
import { SunIcon, MoonIcon } from './components/icons';

// --- Types for Context ---
// This interface includes the password for internal management but it's never exposed to the UI components directly.
interface StoredUser extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (credentials: Pick<StoredUser, 'email' | 'password'>) => boolean;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  deleteCurrentUser: () => void;
  getAllUsers: () => StoredUser[];
  addUser: (newUser: StoredUser) => boolean;
  updateUserByEmail: (email: string, updates: Partial<StoredUser>) => boolean;
  deleteUserByEmail: (email: string) => void;
}

interface CourseContextType {
  courses: Course[];
  dispatch: React.Dispatch<any>;
  isManaged: boolean; // Flag to indicate if we are in admin management mode
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// --- Context Creation ---
export const AuthContext = createContext<AuthContextType>(null!);
export const CourseContext = createContext<CourseContextType>(null!);
export const ThemeContext = createContext<ThemeContextType>(null!);

// --- LocalStorage Utilities ---
const getUsersFromStorage = (): StoredUser[] => JSON.parse(localStorage.getItem('users') || '[]');
const saveUsersToStorage = (users: StoredUser[]) => localStorage.setItem('users', JSON.stringify(users));
const getCoursesFromStorage = (email: string): Course[] => JSON.parse(localStorage.getItem(`courses_${email}`) || '[]');
const saveCoursesToStorage = (email: string, courses: Course[]) => localStorage.setItem(`courses_${email}`, JSON.stringify(courses));


// --- Course Reducer ---
type CourseAction =
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: { name: string; description: string } }
  | { type: 'EDIT_COURSE'; payload: { courseId: string; name: string; description: string } }
  | { type: 'DELETE_COURSE'; payload: { courseId: string } }
  | { type: 'ADD_TOPIC'; payload: { courseId: string; title: string } }
  | { type: 'EDIT_TOPIC'; payload: { courseId: string; topicId: string; title: string } }
  | { type: 'DELETE_TOPIC'; payload: { courseId: string; topicId: string } }
  | { type: 'UPDATE_TOPIC_DETAILS'; payload: { courseId: string; topicId: string; notes: string; imageUrls: string[] } };

const courseReducer = (state: Course[], action: CourseAction): Course[] => {
  switch (action.type) {
    case 'SET_COURSES':
      return action.payload;
    case 'ADD_COURSE': {
      const newCourse: Course = { id: uuidv4(), name: action.payload.name, description: action.payload.description, topics: [], createdAt: Date.now() };
      return [...state, newCourse];
    }
    case 'EDIT_COURSE':
      return state.map(c => c.id === action.payload.courseId ? { ...c, name: action.payload.name, description: action.payload.description } : c);
    case 'DELETE_COURSE':
      return state.filter(c => c.id !== action.payload.courseId);
    case 'ADD_TOPIC': {
      const newTopic: Topic = { id: uuidv4(), title: action.payload.title, notes: '', imageUrls: [], createdAt: Date.now() };
      return state.map(c => c.id === action.payload.courseId ? { ...c, topics: [...c.topics, newTopic] } : c);
    }
    case 'EDIT_TOPIC':
      return state.map(c => c.id === action.payload.courseId ? { ...c, topics: c.topics.map(t => t.id === action.payload.topicId ? { ...t, title: action.payload.title } : t) } : c);
    case 'DELETE_TOPIC':
      return state.map(c => c.id === action.payload.courseId ? { ...c, topics: c.topics.filter(t => t.id !== action.payload.topicId) } : c);
    case 'UPDATE_TOPIC_DETAILS':
      return state.map(c => c.id === action.payload.courseId ? { ...c, topics: c.topics.map(t => t.id === action.payload.topicId ? { ...t, notes: action.payload.notes, imageUrls: action.payload.imageUrls } : t) } : c);
    default:
      return state;
  }
};

// --- Layout Component ---
const Layout: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-900 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <header className="sticky top-0 z-40 w-full backdrop-blur-lg border-b border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    {/* This group will be on the right due to RTL dir */}
                    <nav>
                        {user ? (
                            <Link to="/profile" className="flex items-center gap-3">
                                <img src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="h-9 w-9 rounded-full object-cover"/>
                                <span className="text-sm font-medium hidden sm:inline">{user.username}</span>
                            </Link>
                        ) : (
                            <div /> // Placeholder to maintain layout
                        )}
                    </nav>

                    {/* This group will be on the left due to RTL dir */}
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-slate-700" />}
                        </button>
                        {user ? (
                            <button onClick={() => setIsLogoutModalOpen(true)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400">خروج</button>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400">ورود</Link>
                                <Link to="/signup" className="text-sm font-medium rounded-lg px-3 py-1.5 bg-sky-500 text-white hover:bg-sky-400 transition-colors">ثبت‌نام</Link>
                            </>
                        )}
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
                confirmText="خروج"
                cancelText="انصراف"
                isDestructive={true}
            />
        </div>
    );
};

// --- Protected Route Components ---
const ProtectedRoute: React.FC = () => {
    const { user } = useContext(AuthContext);
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC = () => {
    const { isAdmin } = useContext(AuthContext);
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

// --- Admin Management Layout ---
const AdminManagementLayout: React.FC = () => {
    const { userEmail } = useParams<{ userEmail: string }>();
    const [courses, dispatch] = useReducer(courseReducer, []);
    const [managedUser, setManagedUser] = useState<User | null>(null);

    useEffect(() => {
        if(userEmail) {
            const users = getUsersFromStorage();
            const foundUser = users.find(u => u.email === userEmail);
            if (foundUser) {
                const { password, ...userData } = foundUser;
                setManagedUser(userData);
                dispatch({ type: 'SET_COURSES', payload: getCoursesFromStorage(userEmail) });
            }
        }
    }, [userEmail]);

    useEffect(() => {
        if(userEmail && managedUser) {
            saveCoursesToStorage(userEmail, courses);
        }
    }, [courses, userEmail, managedUser]);

    if (!managedUser) return <div className="text-center">Loading user data...</div>;

    return (
        <CourseContext.Provider value={{ courses, dispatch, isManaged: true }}>
            <Outlet context={{ managedUser }} />
        </CourseContext.Provider>
    );
}

// --- Main App Component ---
const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [courses, dispatch] = useReducer(courseReducer, []);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
    const navigate = useNavigate();
    const ADMIN_EMAIL = 'bagherimahdi1300@gmail.com';

    // --- Admin Seeding ---
    useEffect(() => {
      const users = getUsersFromStorage();
      const adminExists = users.some(u => u.email === ADMIN_EMAIL);
      if (!adminExists) {
        users.push({
          email: ADMIN_EMAIL,
          password: '1382_Mahdi_1382',
          username: 'Admin',
          createdAt: Date.now(),
          profilePicture: null
        });
        saveUsersToStorage(users);
      }
    }, []);

    // --- Theme Management ---
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));

    // --- Course Data Management ---
    useEffect(() => {
        if (user) {
            dispatch({ type: 'SET_COURSES', payload: getCoursesFromStorage(user.email) });
        } else {
            dispatch({ type: 'SET_COURSES', payload: [] });
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            saveCoursesToStorage(user.email, courses);
        }
    }, [courses, user]);
    
    // --- Auth & User Management Logic ---
    const authContextValue: AuthContextType = {
        user,
        isAdmin: user?.email === ADMIN_EMAIL,
        login: (credentials) => {
            const users = getUsersFromStorage();
            const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
            if (foundUser) {
                const { password, ...userData } = foundUser;
                setUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
                return true;
            }
            return false;
        },
        logout: () => {
            setUser(null);
            localStorage.removeItem('currentUser');
            navigate('/login');
        },
        updateUser: (updatedUserData) => {
            if (user) {
                const newUser = { ...user, ...updatedUserData };
                setUser(newUser);
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                authContextValue.updateUserByEmail(user.email, updatedUserData);
            }
        },
        changePassword: (oldPassword, newPassword) => {
            if(!user) return false;
            const users = getUsersFromStorage();
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex > -1 && users[userIndex].password === oldPassword) {
                users[userIndex].password = newPassword;
                saveUsersToStorage(users);
                return true;
            }
            return false;
        },
        deleteCurrentUser: () => {
            if (user && user.email !== ADMIN_EMAIL) {
                authContextValue.deleteUserByEmail(user.email);
                authContextValue.logout();
            }
        },
        getAllUsers: () => getUsersFromStorage(),
        addUser: (newUser) => {
            const users = getUsersFromStorage();
            if (users.some(u => u.email === newUser.email)) return false;
            users.push(newUser);
            saveUsersToStorage(users);
            return true;
        },
        updateUserByEmail: (email, updates) => {
            const users = getUsersFromStorage();
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex > -1) {
                users[userIndex] = { ...users[userIndex], ...updates };
                saveUsersToStorage(users);
                if (user?.email === email) { // update current user session if they are being edited
                     const newUser = { ...user, ...updates };
                     setUser(newUser);
                     localStorage.setItem('currentUser', JSON.stringify(newUser));
                }
                return true;
            }
            return false;
        },
        deleteUserByEmail: (email) => {
            if (email === ADMIN_EMAIL) return; // Safeguard
            const users = getUsersFromStorage();
            saveUsersToStorage(users.filter(u => u.email !== email));
            localStorage.removeItem(`courses_${email}`);
        }
    };
    

    return (
        <AuthContext.Provider value={authContextValue}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route element={<Layout />}>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={
                            <CourseContext.Provider value={{ courses, dispatch, isManaged: false }}>
                                <HomePage />
                            </CourseContext.Provider>
                        } />
                        <Route path="/course/:courseId" element={
                            <CourseContext.Provider value={{ courses, dispatch, isManaged: false }}>
                                <CoursePage />
                            </CourseContext.Provider>
                        } />
                        <Route path="/course/:courseId/topic/:topicId" element={
                             <CourseContext.Provider value={{ courses, dispatch, isManaged: false }}>
                                <TopicDetailPage />
                            </CourseContext.Provider>
                        } />
                        <Route path="/profile" element={
                            <CourseContext.Provider value={{ courses, dispatch, isManaged: false }}>
                                <ProfilePage />
                            </CourseContext.Provider>
                        } />

                        <Route path="/admin" element={<AdminRoute />}>
                            <Route path="users" element={<AdminUsersListPage />} />
                            <Route path="users/:userEmail" element={<AdminManageUserPage />} />
                            <Route path="users/:userEmail/profile" element={<AdminEditUserPage />} />
                            <Route path="users/:userEmail/courses" element={<AdminManagementLayout />}>
                               <Route index element={<HomePage />} />
                               <Route path="course/:courseId" element={<CoursePage />} />
                               <Route path="course/:courseId/topic/:topicId" element={<TopicDetailPage />} />
                            </Route>
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </ThemeContext.Provider>
        </AuthContext.Provider>
    );
};

export default App;