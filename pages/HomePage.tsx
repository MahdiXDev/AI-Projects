
import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { CourseContext, AuthContext } from '../App';
import type { Course } from '../types';
import Modal, { ConfirmModal } from '../components/Modal';
import { DotsVerticalIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, ChevronDownIcon, ReorderIcon, SaveIcon, XIcon } from '../components/icons';

// A component for each course in the list
const CourseCard: React.FC<{ course: Course, onEdit: () => void, onDelete: () => void, onReorder: () => void }> = ({ course, onEdit, onDelete, onReorder }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const topicCount = course.topics.length;

    return (
        <div className={`group relative rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/60 backdrop-blur-lg hover:border-sky-500/30 dark:hover:border-sky-400/30 shadow-md hover:shadow-xl ${menuOpen ? 'z-10' : ''}`}>
            <div className="absolute top-4 right-4" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors opacity-50 group-hover:opacity-100">
                    <DotsVerticalIcon className="w-5 h-5" />
                </button>
                <AnimatePresence>
                {menuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 mt-2 w-40 origin-top-right rounded-lg bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-black/10 dark:border-white/10">
                        <div className="py-1">
                             <button onClick={() => { onReorder(); setMenuOpen(false); }} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10">
                                <ReorderIcon className="w-4 h-4" />
                                <span>چیدمان</span>
                            </button>
                            <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10">
                                <PencilIcon className="w-4 h-4" />
                                <span>ویرایش</span>
                            </button>
                            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20">
                                <TrashIcon className="w-4 h-4" />
                                <span>حذف</span>
                            </button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            <Link to={`course/${course.id}`} className="flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors pr-8">{course.name}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-2">{course.description}</p>
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 text-xs text-gray-500">
                    <span>{topicCount} {topicCount === 1 ? 'سرفصل' : 'سرفصل‌ها'}</span>
                </div>
            </Link>
        </div>
    );
};

const ReorderableCourseItem: React.FC<{ course: Course }> = ({ course }) => {
    const controls = useDragControls();
    return (
        <Reorder.Item value={course} dragListener={false} dragControls={controls}>
            <div className="group relative rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 transition-all duration-300 backdrop-blur-lg shadow-md flex items-center gap-4">
                <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-gray-500 dark:text-gray-400 p-2">
                    <ReorderIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col h-full flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.name}</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-1">{course.description}</p>
                </div>
            </div>
        </Reorder.Item>
    );
};


type SortOption = 'manual' | 'newest' | 'oldest' | 'alpha-asc' | 'alpha-desc';

const HomePage: React.FC = () => {
    const { courses, dispatch } = useContext(CourseContext);
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('manual');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement>(null);
    
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [reorderedCourses, setReorderedCourses] = useState<Course[]>([]);

    useEffect(() => {
        if (isReorderMode) {
            setReorderedCourses(courses.sort((a, b) => (a.sortOrder || a.createdAt) - (b.sortOrder || b.createdAt)));
        }
    }, [isReorderMode, courses]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'manual', label: 'چیدمان دستی' },
        { value: 'newest', label: 'جدیدترین' },
        { value: 'oldest', label: 'قدیمی‌ترین' },
        { value: 'alpha-asc', label: 'الفبا (صعودی)' },
        { value: 'alpha-desc', label: 'الفبا (نزولی)' },
    ];
    const currentSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label;

    const displayedCourses = useMemo(() => {
        const lowercasedQuery = searchQuery.toLocaleLowerCase('fa');
        
        const filtered = courses.filter(course =>
            course.name.toLocaleLowerCase('fa').includes(lowercasedQuery) ||
            course.description.toLocaleLowerCase('fa').includes(lowercasedQuery)
        );
        const sorted = [...filtered];

        switch (sortOption) {
            case 'oldest':
                return sorted.sort((a, b) => a.createdAt - b.createdAt);
            case 'alpha-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
            case 'alpha-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name, 'fa'));
            case 'newest':
                 return sorted.sort((a, b) => b.createdAt - a.createdAt);
            case 'manual':
            default:
                return sorted.sort((a, b) => (a.sortOrder || a.createdAt) - (b.sortOrder || b.createdAt));
        }
    }, [courses, searchQuery, sortOption]);

    const handleSaveReorder = () => {
        if (!user) return;
        dispatch({ type: 'REORDER_COURSES', payload: { userEmail: user.email, courses: reorderedCourses } });
        setIsReorderMode(false);
    };

    const handleCancelReorder = () => {
        setIsReorderMode(false);
        setReorderedCourses([]);
    };

    const openAddModal = () => {
        setEditingCourse(null);
        setCourseName('');
        setCourseDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setCourseName(course.name);
        setCourseDescription(course.description);
        setIsModalOpen(true);
    };

    const handleSaveCourse = () => {
        if (courseName.trim() === '' || !user) return;

        if (editingCourse) {
            dispatch({ type: 'EDIT_COURSE', payload: { courseId: editingCourse.id, name: courseName, description: courseDescription } });
        } else {
            dispatch({ type: 'ADD_COURSE', payload: { name: courseName, description: courseDescription, userEmail: user.email } });
        }
        setIsModalOpen(false);
    };

    const handleDeleteCourse = (courseId: string) => {
        setDeletingCourseId(courseId);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteCourse = () => {
        if (deletingCourseId) {
            dispatch({ type: 'DELETE_COURSE', payload: { courseId: deletingCourseId } });
        }
        setIsConfirmModalOpen(false);
        setDeletingCourseId(null);
    };

    return (
        <>
            <header className="mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isReorderMode ? 'چیدمان دوره‌ها' : 'دوره‌های من'}
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {isReorderMode ? 'کارت‌ها را بکشید تا ترتیب دلخواه خود را تنظیم کنید.' : 'دوره‌های آموزشی خود را مدیریت کنید.'}
                    </p>
                </div>
            </header>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              {isReorderMode ? (
                  <>
                    <div className="flex-grow flex items-center justify-end gap-4">
                        <button onClick={handleCancelReorder} className="flex items-center justify-center gap-2 h-10 rounded-lg bg-gray-500 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-400 shrink-0">
                            <XIcon className="w-5 h-5" />
                            <span>انصراف</span>
                        </button>
                        <button onClick={handleSaveReorder} className="flex items-center justify-center gap-2 h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">
                            <SaveIcon className="w-5 h-5" />
                            <span>ذخیره چیدمان</span>
                        </button>
                    </div>
                  </>
              ) : (
                <>
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <SearchIcon className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="جستجوی دوره..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 rounded-lg border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-700/50 pr-10 pl-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-sky-500 focus:ring-sky-500 transition"
                        />
                    </div>
                    <div className="relative shrink-0" ref={sortMenuRef}>
                        <button
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                            className="flex items-center justify-between w-full md:w-48 h-10 rounded-lg border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-700/50 px-4 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition"
                        >
                            <span>{currentSortLabel}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isSortMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-black/10 dark:border-white/10"
                                >
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortOption(option.value);
                                                    setIsSortMenuOpen(false);
                                                }}
                                                className={`w-full text-right block px-4 py-2 text-sm ${sortOption === option.value ? 'bg-sky-500/20 text-sky-600 dark:bg-sky-500/30 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300'} hover:bg-black/5 dark:hover:bg-white/10`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400 shrink-0 w-full md:w-auto"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>دوره جدید</span>
                    </button>
                </>
              )}
            </div>

            {isReorderMode ? (
                 <Reorder.Group
                    axis="y"
                    values={reorderedCourses}
                    onReorder={setReorderedCourses}
                    className="space-y-4 max-w-2xl mx-auto"
                >
                    {reorderedCourses.map(course => (
                        <ReorderableCourseItem key={course.id} course={course} />
                    ))}
                </Reorder.Group>
            ) : displayedCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedCourses.map(course => (
                        <CourseCard 
                          key={course.id} 
                          course={course}
                          onEdit={() => openEditModal(course)}
                          onDelete={() => handleDeleteCourse(course.id)}
                          onReorder={() => setIsReorderMode(true)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-700">
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز دوره‌ای ایجاد نکرده‌اید.'}</h3>
                    <p className="text-gray-500 mt-1">{searchQuery ? `هیچ دوره‌ای با عبارت "${searchQuery}" مطابقت ندارد.` : 'برای شروع، اولین دوره خود را بسازید!'}
                    </p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? "ویرایش دوره" : "افزودن دوره جدید"}>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام دوره</label>
                            <input
                                id="course-name"
                                type="text"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="مثال: آموزش React پیشرفته"
                                className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">توضیحات</label>
                            <textarea
                                id="course-description"
                                value={courseDescription}
                                onChange={(e) => setCourseDescription(e.target.value)}
                                placeholder="در این دوره چه چیزهایی آموزش داده می‌شود؟"
                                rows={3}
                                className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition resize-none"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
                        >
                            {editingCourse ? 'ذخیره تغییرات' : 'ایجاد دوره'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDeleteCourse}
                title="حذف دوره"
                message="آیا از حذف این دوره اطمینان دارید؟ تمام سرفصل‌های آن نیز حذف خواهند شد."
                confirmText="بله، حذف کن"
            />
        </>
    );
};

export default HomePage;
