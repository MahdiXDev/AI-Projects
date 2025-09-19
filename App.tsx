// Fix: Imported `useContext` from React.
import React, { useReducer, createContext, Dispatch, useEffect, useState, ReactNode, useContext } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { Course, Topic, User } from './types';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicDetailPage from './pages/TopicDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { ConfirmModal } from './components/Modal';
import { UserIcon, LogoutIcon } from './components/icons';

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
          return { ...course, topics: [newTopic, ...course.topics] };
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

const getCourseStorageKey = (user: User | null) => user ? `course-syllabus-data-${user.email}` : null;

// --- CONTEXTS ---
export const CourseContext = createContext<{
  courses: Course[];
  dispatch: Dispatch<Action>;
}>({
  courses: [],
  dispatch: () => null,
});

export const AuthContext = createContext<{
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
}>({
    currentUser: null,
    login: () => {},
    logout: () => {},
});

// --- LAYOUT FOR AUTHENTICATED USERS ---
const AuthenticatedLayout = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    const handleLogoutConfirm = () => {
        logout();
        setIsLogoutConfirmOpen(false);
    }
    
    return (
        <>
            <div className="min-h-screen bg-gray-900 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
                <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                
                <header className="sticky top-0 z-40 bg-gray-900/70 backdrop-blur-lg border-b border-white/10">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">{currentUser?.username || currentUser?.email}</span>
                        </div>
                        <button onClick={() => setIsLogoutConfirmOpen(true)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <LogoutIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">خروج</span>
                        </button>
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

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};


// --- COURSE DATA PROVIDER (for authenticated users) ---
const CourseDataProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useContext(AuthContext);
    
    const initializer = (user: User | null): Course[] => {
        const storageKey = getCourseStorageKey(user);
        if (!storageKey) return [];

        try {
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                const courses: Course[] = JSON.parse(storedData);
                return courses.map(course => ({
                    ...course,
                    createdAt: course.createdAt || Date.now(),
                    topics: (course.topics || []).map(topic => ({
                        ...topic,
                        createdAt: topic.createdAt || Date.now()
                    }))
                }));
            }
        } catch (error) {
            console.error("Error reading from localStorage:", error);
        }
        return [];
    };

    const [courses, dispatch] = useReducer(courseReducer, currentUser, initializer);

    useEffect(() => {
        // This effect re-initializes data when the user changes (login/logout)
        dispatch({ type: 'SET_COURSES', payload: initializer(currentUser) });
    }, [currentUser]);

    useEffect(() => {
        const storageKey = getCourseStorageKey(currentUser);
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(courses));
            } catch (error) {
                console.error("Error writing to localStorage:", error);
            }
        }
    }, [courses, currentUser]);

    return (
        <CourseContext.Provider value={{ courses, dispatch }}>
            {children}
        </CourseContext.Provider>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const navigate = useNavigate();

    const login = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/');
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
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
                                        <Route path="/course/:courseId" element={<CoursePage />} />
                                        <Route path="/course/:courseId/topic/:topicId" element={<TopicDetailPage />} />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Route>
                                </Routes>
                            </CourseDataProvider>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthContext.Provider>
    );
};

export default App;