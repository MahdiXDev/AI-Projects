import React, { createContext, useReducer, useEffect, useState, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, Outlet, Link } from 'react-router-dom';
import type { Course, Topic, User } from './types';
import { v4 as uuidv4 } from 'uuid';

import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicDetailPage from './pages/TopicDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersListPage from './pages/admin/AdminUsersListPage';
import AdminUserDetailsPage from './pages/admin/AdminUserDetailsPage';

// --- Types for Context ---
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
}

interface CourseContextType {
  courses: Course[];
  dispatch: React.Dispatch<any>;
}

// --- Context Creation ---
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const CourseContext = createContext<CourseContextType>({
  courses: [],
  dispatch: () => {},
});

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
      const newCourse: Course = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        topics: [],
        createdAt: Date.now(),
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
                topic.id === action.payload.topicId ? { ...topic, title: action.payload.title } : topic
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
    default:
      return state;
  }
};


// --- Layout Component ---
const Layout: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-900 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <header className="sticky top-0 z-40 w-full backdrop-blur-lg border-b border-black/10 dark:border-white/10 bg-gray-100/50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <Link to="/" className="text-xl font-bold text-sky-600 dark:text-sky-400">
                        CourseBuilder
                    </Link>
                    <nav className="flex items-center gap-4">
                        {user ? (
                            <>
                                {user.email === 'admin@example.com' && (
                                    <Link to="/admin/users" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400">Admin</Link>
                                )}
                                <Link to="/profile">
                                    <img 
                                        src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
                                        alt={user.username}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                </Link>
                                <button onClick={handleLogout} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400">خروج</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400">ورود</Link>
                                <Link to="/signup" className="text-sm font-medium rounded-lg px-3 py-1.5 bg-sky-500 text-white hover:bg-sky-400 transition-colors">ثبت‌نام</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

// --- Protected Route Components ---
const ProtectedRoute: React.FC = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

const AdminRoute: React.FC = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Hardcoded admin user for demo purposes
    if (user.email !== 'admin@example.com') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

// --- Main App Component ---
const App: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Course state
  const [courses, dispatch] = useReducer(courseReducer, []);
  
  const navigate = useNavigate();

  // Load courses from localStorage on mount, specific to the logged-in user
  useEffect(() => {
    if (user) {
      const savedCourses = localStorage.getItem(`courses_${user.email}`);
      if (savedCourses) {
        dispatch({ type: 'SET_COURSES', payload: JSON.parse(savedCourses) });
      }
    } else {
        // Clear courses if no user is logged in
        dispatch({ type: 'SET_COURSES', payload: [] });
    }
  }, [user]);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`courses_${user.email}`, JSON.stringify(courses));
    }
  }, [courses, user]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const updateUser = (updatedUserData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUserData };
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      // Also update the user in the main 'users' list
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.email === user.email);
      if (userIndex > -1) {
          const password = allUsers[userIndex].password;
          allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUserData, password };
          localStorage.setItem('users', JSON.stringify(allUsers));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <CourseContext.Provider value={{ courses, dispatch }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="/course/:courseId/topic/:topicId" element={<TopicDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
             <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<AdminUsersListPage />} />
              <Route path="/admin/users/:email" element={<AdminUserDetailsPage />} />
            </Route>
          </Route>
        </Routes>
      </CourseContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
