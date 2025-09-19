import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseContext, AuthContext } from '../../App';
import type { Course, User } from '../../types';
import Modal, { ConfirmModal } from '../../components/Modal';
import { DotsVerticalIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, ChevronDownIcon, ArrowRightIcon } from '../../components/icons';


const CourseCard: React.FC<{ course: Course, onEdit: () => void, onDelete: () => void }> = ({ course, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
    
    // Admin cannot navigate to topic detail pages as they are not designed for admin edits.
    // This could be a future enhancement. For now, clicking the card does nothing.
    const handleCardClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Potentially navigate to an admin version of the course page in the future
    };

    return (
        <div className={`group relative rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/60 backdrop-blur-lg hover:border-sky-500/30 dark:hover:border-sky-400/30 shadow-md hover:shadow-xl ${menuOpen ? 'z-10' : ''}`}>
            <div className="absolute top-4 right-4" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors opacity-50 group-hover:opacity-100">
                    <DotsVerticalIcon className="w-5 h-5" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-lg bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-black/10 dark:border-white/10">
                        <div className="py-1">
                            <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10">
                                <PencilIcon className="w-4 h-4" />
                                <span>ویرایش</span>
                            </button>
                            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20">
                                <TrashIcon className="w-4 h-4" />
                                <span>حذف</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <a href="#" onClick={handleCardClick} className="flex flex-col h-full cursor-not-allowed">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors pr-8">{course.name}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-2">{course.description}</p>
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 text-xs text-gray-500">
                    <span>{topicCount} {topicCount === 1 ? 'سرفصل' : 'سرفصل‌ها'}</span>
                </div>
            </a>
        </div>
    );
};

const AdminUserCoursesPage: React.FC = () => {
    const { userEmail } = useParams<{ userEmail: string }>();
    const { allCourses, dispatch } = useContext(CourseContext);
    const { getAllUsers } = useContext(AuthContext);

    const [managedUser, setManagedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (userEmail) {
            const user = getAllUsers().find(u => u.email === userEmail);
            setManagedUser(user || null);
        }
    }, [userEmail, getAllUsers]);

    const displayedCourses = useMemo(() => {
        if (!userEmail) return [];
        const lowercasedQuery = searchQuery.toLocaleLowerCase('fa');
        
        return allCourses
            .filter(course => course.userEmail === userEmail)
            .filter(course =>
                course.name.toLocaleLowerCase('fa').includes(lowercasedQuery) ||
                course.description.toLocaleLowerCase('fa').includes(lowercasedQuery)
            )
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [allCourses, searchQuery, userEmail]);

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
        if (courseName.trim() === '' || !userEmail) return;

        if (editingCourse) {
            dispatch({ type: 'EDIT_COURSE', payload: { courseId: editingCourse.id, name: courseName, description: courseDescription } });
        } else {
            dispatch({ type: 'ADD_COURSE', payload: { name: courseName, description: courseDescription, userEmail: userEmail } });
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

    if (!managedUser) {
        return <div className="text-center">در حال بارگذاری اطلاعات کاربر...</div>;
    }

    return (
        <>
            <header className="mb-8">
                <Link to={`/admin/users/${encodeURIComponent(managedUser.email)}`} className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
                  <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
                  <span>بازگشت به مدیریت کاربر</span>
                </Link>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">دوره‌های {managedUser.username}</h1>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">دوره‌های این کاربر را مدیریت کنید.</p>
                  </div>
                  <button
                      onClick={openAddModal}
                      className="flex items-center justify-center gap-2 h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400 shrink-0 w-full md:w-auto self-start md:self-center"
                  >
                      <PlusIcon className="w-5 h-5" />
                      <span>افزودن دوره برای کاربر</span>
                  </button>
                </div>
            </header>
            
            <div className="mb-6 relative">
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

            {displayedCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedCourses.map(course => (
                        <CourseCard 
                          key={course.id} 
                          course={course}
                          onEdit={() => openEditModal(course)}
                          onDelete={() => handleDeleteCourse(course.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-700">
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{searchQuery ? 'نتیجه‌ای یافت نشد' : 'این کاربر هنوز دوره‌ای ایجاد نکرده است.'}</h3>
                    <p className="text-gray-500 mt-1">{searchQuery ? `هیچ دوره‌ای با عبارت "${searchQuery}" مطابقت ندارد.` : 'شما می‌توانید برای این کاربر یک دوره جدید ایجاد کنید.'}
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

export default AdminUserCoursesPage;
