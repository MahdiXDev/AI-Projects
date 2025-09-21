
import React, { createContext, useReducer, useEffect, useState, useMemo, useContext } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { User, Course, Topic, Subject } from './types';
import { db } from './utils/db'; // Import IndexedDB utility
import { AppearanceProvider, useAppearance } from './contexts/AppearanceContext';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicPage from './pages/TopicPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import { SunIcon, MoonIcon, LogoutIcon } from './components/icons';
import { ConfirmModal } from './components/Modal';

// --- COURSE CONTEXT & REDUCER ---

type CourseAction =
  | { type: 'SET_COURSES'; payload: Course[] } // For initializing from DB
  | { type: 'ADD_COURSE'; payload: { name: string; description: string; userEmail: string } }
  | { type: 'EDIT_COURSE'; payload: { courseId: string; name: string; description: string } }
  | { type: 'DELETE_COURSE'; payload: { courseId: string } }
  | { type: 'ADD_TOPIC'; payload: { courseId: string; title: string } }
  | { type: 'EDIT_TOPIC'; payload: { courseId: string; topicId: string; title: string } }
  | { type: 'DELETE_TOPIC'; payload: { courseId: string; topicId: string } }
  | { type: 'DELETE_COURSES_BY_USER'; payload: { userEmail: string } }
  | { type: 'REORDER_COURSES'; payload: { userEmail: string; courses: Course[] } }
  | { type: 'REORDER_TOPICS'; payload: { courseId: string; topics: Topic[] } }
  | { type: 'ADD_SUBJECT'; payload: { courseId: string; topicId: string; title: string } }
  | { type: 'EDIT_SUBJECT'; payload: { courseId: string; topicId: string; subjectId: string; title: string } }
  | { type: 'DELETE_SUBJECT'; payload: { courseId: string; topicId: string; subjectId: string } }
  | { type: 'UPDATE_SUBJECT_DETAILS'; payload: { courseId: string; topicId: string; subjectId: string; notes: string; imageUrls: string[] } }
  | { type: 'REORDER_SUBJECTS'; payload: { courseId: string; topicId: string; subjects: Subject[] } };


const courseReducer = (state: Course[], action: CourseAction): Course[] => {
  switch (action.type) {
    case 'SET_COURSES':
      return action.payload;
    case 'ADD_COURSE': {
      const userCourses = state.filter(c => c.userEmail === action.payload.userEmail);
      const newCourse: Course = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        topics: [],
        createdAt: Date.now(),
        userEmail: action.payload.userEmail,
        sortOrder: (userCourses.reduce((max, c) => Math.max(c.sortOrder || 0, max), 0)) + 1,
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
      return state.map(course => {
        if (course.id === action.payload.courseId) {
            const newTopic: Topic = {
                id: uuidv4(),
                title: action.payload.title,
                subjects: [],
                createdAt: Date.now(),
                sortOrder: (course.topics.reduce((max, t) => Math.max(t.sortOrder || 0, max), 0)) + 1,
            };
            return { ...course, topics: [...course.topics, newTopic] };
        }
        return course;
      });
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
    case 'DELETE_COURSES_BY_USER':
        return state.filter(course => course.userEmail !== action.payload.userEmail);
    case 'REORDER_COURSES': {
        const { userEmail, courses: reorderedUserCourses } = action.payload;
        const otherUsersCourses = state.filter(c => c.userEmail !== userEmail);
        const updatedUserCourses = reorderedUserCourses.map((course, index) => ({
            ...course,
            sortOrder: index + 1,
        }));
        return [...otherUsersCourses, ...updatedUserCourses];
    }
    case 'REORDER_TOPICS': {
        return state.map(course => {
            if (course.id === action.payload.courseId) {
                const reorderedTopics = action.payload.topics.map((topic, index) => ({
                    ...topic,
                    sortOrder: index + 1,
                }));
                return { ...course, topics: reorderedTopics };
            }
            return course;
        });
    }
    case 'ADD_SUBJECT':
        return state.map(course => {
            if (course.id !== action.payload.courseId) return course;
            return {
                ...course,
                topics: course.topics.map(topic => {
                    if (topic.id !== action.payload.topicId) return topic;
                    const newSubject: Subject = {
                        id: uuidv4(),
                        title: action.payload.title,
                        notes: '',
                        imageUrls: [],
                        createdAt: Date.now(),
                        sortOrder: (topic.subjects.reduce((max, s) => Math.max(s.sortOrder || 0, max), 0)) + 1,
                    };
                    return { ...topic, subjects: [...topic.subjects, newSubject] };
                }),
            };
        });
    case 'EDIT_SUBJECT':
        return state.map(course => {
            if (course.id !== action.payload.courseId) return course;
            return {
                ...course,
                topics: course.topics.map(topic => {
                    if (topic.id !== action.payload.topicId) return topic;
                    return {
                        ...topic,
                        subjects: topic.subjects.map(subject =>
                            subject.id === action.payload.subjectId
                                ? { ...subject, title: action.payload.title }
                                : subject
                        ),
                    };
                }),
            };
        });
    case 'DELETE_SUBJECT':
        return state.map(course => {
            if (course.id !== action.payload.courseId) return course;
            return {
                ...course,
                topics: course.topics.map(topic => {
                    if (topic.id !== action.payload.topicId) return topic;
                    return {
                        ...topic,
                        subjects: topic.subjects.filter(subject => subject.id !== action.payload.subjectId),
                    };
                }),
            };
        });
    case 'UPDATE_SUBJECT_DETAILS':
        return state.map(course => {
            if (course.id !== action.payload.courseId) return course;
            return {
                ...course,
                topics: course.topics.map(topic => {
                    if (topic.id !== action.payload.topicId) return topic;
                    return {
                        ...topic,
                        subjects: topic.subjects.map(subject =>
                            subject.id === action.payload.subjectId
                                ? { ...subject, notes: action.payload.notes, imageUrls: action.payload.imageUrls }
                                : subject
                        ),
                    };
                }),
            };
        });
    case 'REORDER_SUBJECTS': {
        return state.map(course => {
            if (course.id !== action.payload.courseId) return course;
            return {
                ...course,
                topics: course.topics.map(topic => {
                    if (topic.id !== action.payload.topicId) return topic;
                    const reorderedSubjects = action.payload.subjects.map((subject, index) => ({
                        ...subject,
                        sortOrder: index + 1,
                    }));
                    return { ...topic, subjects: reorderedSubjects };
                }),
            };
        });
    }
    default:
      return state;
  }
};

interface CourseContextType {
    courses: Course[];
    allCourses: Course[];
    dispatch: React.Dispatch<CourseAction>;
}

export const CourseContext = createContext<CourseContextType>({
    courses: [],
    allCourses: [],
    dispatch: () => undefined,
});

const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isInitialized: authInitialized } = useContext(AuthContext);
    const [allCourses, dispatch] = useReducer(courseReducer, []);
    const [coursesLoaded, setCoursesLoaded] = useState(false);

    useEffect(() => {
        db.getAllCourses().then(courses => {
            dispatch({ type: 'SET_COURSES', payload: courses });
        }).catch(err => {
            console.error("Failed to load courses from DB:", err);
        }).finally(() => {
             setCoursesLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (!coursesLoaded) return;
        db.saveAllCourses(allCourses).catch(error => {
            console.error("Failed to save courses to DB:", error);
            alert("خطا در ذخیره‌سازی اطلاعات دوره‌ها در پایگاه داده داخلی.");
        });
    }, [allCourses, coursesLoaded]);

    const userCourses = useMemo(() => {
        if (!user) return [];
        return allCourses.filter(course => course.userEmail === user.email);
    }, [allCourses, user]);
    
    return (
        <CourseContext.Provider value={{ courses: userCourses, allCourses, dispatch }}>
            {authInitialized && coursesLoaded ? children : null}
        </CourseContext.Provider>
    );
};

// --- AUTH CONTEXT ---
interface StoredUser extends User {
    password?: string;
}

interface AuthContextType {
    user: User | null;
    isInitialized: boolean;
    login: (credentials: { email: string; password?: string }) => boolean;
    logout: () => void;
    addUser: (user: StoredUser) => boolean;
    updateUser: (updates: Partial<User>) => void;
    changePassword: (oldPass: string, newPass: string) => boolean;
    deleteCurrentUser: () => void;
    getAllUsers: () => StoredUser[];
    updateUserByEmail: (email: string, updates: Partial<StoredUser>) => void;
    deleteUserByEmail: (email: string) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<StoredUser[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [storedUsers, storedCurrentUser] = await Promise.all([
                    db.getAllUsers(),
                    db.getSetting<User | null>('currentUser')
                ]);
                setUsers(storedUsers || []);
                setUser(storedCurrentUser || null);
            } catch (error) {
                console.error("Failed to load auth data from DB", error);
            } finally {
                setIsInitialized(true);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        db.saveAllUsers(users).catch(error => {
            console.error("Failed to save users to DB:", error);
            alert("خطا در ذخیره‌سازی اطلاعات کاربران در پایگاه داده داخلی.");
        });
    }, [users, isInitialized]);
    
    useEffect(() => {
        if (!isInitialized) return;
        db.setSetting('currentUser', user).catch(error => {
            console.error("Failed to save current user to DB:", error);
             alert("خطا در ذخیره‌سازی اطلاعات کاربر فعلی در پایگاه داده داخلی.");
        });
    }, [user, isInitialized]);
    
    const authContextValue = useMemo(() => ({
        user,
        isInitialized,
        login: ({ email, password }) => {
            const foundUser = users.find(u => u.email === email && u.password === password);
            if (foundUser) {
                const { password: _, ...userToStore } = foundUser;
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
            if (!user) return;
            const userEmail = user.email;
            setUsers(prev => prev.filter(u => u.email !== userEmail));
            setUser(null);
            navigate('/login');
        },
        getAllUsers: () => users,
        updateUserByEmail: (email: string, updates: Partial<StoredUser>) => {
            setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updates } : u));
        },
        deleteUserByEmail: (email: string) => {
            setUsers(prev => prev.filter(u => u.email !== email));
        },
    }), [user, users, isInitialized, navigate]);

    return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

const Background = () => {
    const { backgroundClass } = useAppearance();
    return (
        <div className={`absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-950 ${backgroundClass}`}></div>
    );
};

// --- LAYOUT ---
const Layout: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useAppearance();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-white transition-colors duration-300">
             <Background />
            <header className="sticky top-0 z-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-b border-black/10 dark:border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                         <Link to="/profile" className="flex items-center gap-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <img src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                            <span className="font-semibold">{user.username}</span>
                        </Link>

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

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
                <div className="text-xl font-semibold">در حال بارگذاری اطلاعات...</div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

const AppRoutes: React.FC = () => (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/course/:courseId" element={<CoursePage />} />
                <Route path="/course/:courseId/topic/:topicId" element={<TopicPage />} />
                <Route path="/course/:courseId/topic/:topicId/subject/:subjectId" element={<SubjectDetailPage />} />
            </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);


function App() {
  return (
    <AuthProvider>
      <AppearanceProvider>
        <CourseProvider>
            <AppRoutes />
        </CourseProvider>
      </AppearanceProvider>
    </AuthProvider>
  );
}

export default App;