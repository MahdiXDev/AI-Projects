import React, { useReducer, createContext, Dispatch, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Course, Topic } from './types';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import TopicDetailPage from './pages/TopicDetailPage';

// --- STATE MANAGEMENT (useReducer) ---

type Action =
  | { type: 'ADD_COURSE'; payload: { name: string; description: string } }
  | { type: 'EDIT_COURSE'; payload: { courseId: string; name: string; description: string } }
  | { type: 'DELETE_COURSE'; payload: { courseId: string } }
  | { type: 'ADD_TOPIC'; payload: { courseId: string; title: string } }
  | { type: 'EDIT_TOPIC'; payload: { courseId: string; topicId: string; title: string } }
  | { type: 'DELETE_TOPIC'; payload: { courseId: string; topicId: string } }
  | { type: 'UPDATE_TOPIC_DETAILS'; payload: { courseId: string; topicId: string; notes: string; imageUrl?: string } };

const initialState: Course[] = [
  {
    id: 'course-1',
    name: 'مقدمه‌ای بر ری‌اکت',
    description: 'اصول ساخت برنامه‌های وب مدرن با ری‌اکت را بیاموزید.',
    topics: [
      { id: 'topic-1-1', title: 'کامپوننت‌ها و Props', notes: 'کامپوننت‌ها بلوک‌های سازنده برنامه‌های ری‌اکت هستند. Props روشی برای انتقال داده از والد به فرزند است.', imageUrl: 'https://picsum.photos/800/400?random=1' },
      { id: 'topic-1-2', title: 'State و چرخه حیات', notes: 'State به کامپوننت‌ها اجازه می‌دهد تا داده‌های خود را مدیریت کنند. متدهای چرخه حیات به شما امکان می‌دهند کد را در زمان‌های خاصی از عمر کامپوننت اجرا کنید.', imageUrl: 'https://picsum.photos/800/400?random=2' },
      { id: 'topic-1-3', title: 'مدیریت رویدادها', notes: 'یاد بگیرید چگونه تعاملات کاربر مانند کلیک و ارسال فرم را مدیریت کنید.', imageUrl: '' },
    ],
  },
  {
    id: 'course-2',
    name: 'Tailwind CSS پیشرفته',
    description: 'بر فریم‌ورک CSS مبتنی بر ابزار برای توسعه سریع UI مسلط شوید.',
    topics: [
      { id: 'topic-2-1', title: 'شخصی‌سازی تم', notes: 'تم پیش‌فرض Tailwind را با رنگ‌ها، فاصله‌گذاری و فونت‌های خود گسترش دهید.', imageUrl: 'https://picsum.photos/800/400?random=3' },
      { id: 'topic-2-2', title: 'کامپایلر Just-in-Time (JIT)', notes: 'مزایای موتور JIT را برای عملکرد و تجربه توسعه‌دهنده درک کنید.', imageUrl: '' },
    ],
  },
];

const courseReducer = (state: Course[], action: Action): Course[] => {
  switch (action.type) {
    case 'ADD_COURSE':
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        topics: [],
      };
      return [...state, newCourse];
    
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
          const newTopic: Topic = {
            id: `topic-${Date.now()}`,
            title: action.payload.title,
            notes: '',
            imageUrl: '',
          };
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
                imageUrl: action.payload.imageUrl !== undefined ? action.payload.imageUrl : topic.imageUrl,
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

const COURSE_STORAGE_KEY = 'course-syllabus-data';

const initializer = (): Course[] => {
  try {
    const storedData = localStorage.getItem(COURSE_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return initialState;
};


export const CourseContext = createContext<{
  courses: Course[];
  dispatch: Dispatch<Action>;
}>({
  courses: [],
  dispatch: () => null,
});

// --- MAIN APP COMPONENT ---

const App = () => {
  const [courses, dispatch] = useReducer(courseReducer, initializer());

  useEffect(() => {
    try {
      localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [courses]);


  return (
    <CourseContext.Provider value={{ courses, dispatch }}>
      <div className="min-h-screen bg-gray-900 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/topic/:topicId" element={<TopicDetailPage />} />
          </Routes>
        </main>
      </div>
    </CourseContext.Provider>
  );
};

export default App;