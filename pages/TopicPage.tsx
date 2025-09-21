
import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import type { Subject } from '../types';
import { CourseContext } from '../App';
import { useAppearance } from '../contexts/AppearanceContext';
import Modal, { ConfirmModal } from '../components/Modal';
import { DotsVerticalIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, ArrowRightIcon, ReorderIcon, SaveIcon, XIcon } from '../components/icons';

const SubjectListItem: React.FC<{ subject: Subject, index: number, onEdit: () => void, onDelete: () => void, onReorder: () => void }> = ({ subject, index, onEdit, onDelete, onReorder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { accentColor } = useAppearance();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`group relative flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-4 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/60 backdrop-blur-lg hover:border-${accentColor}-500/30 dark:hover:border-${accentColor}-400/30 shadow-md hover:shadow-lg ${menuOpen ? 'z-10' : ''}`}>
      <Link to={`subject/${subject.id}`} className="flex items-center gap-4 flex-grow min-w-0">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-${accentColor}-600 dark:text-${accentColor}-400 font-bold shrink-0`}>{index + 1}</span>
        <span className={`font-medium text-gray-900 dark:text-white group-hover:text-${accentColor}-600 dark:group-hover:text-${accentColor}-300 transition-colors truncate`}>{subject.title}</span>
      </Link>
      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors">
           <DotsVerticalIcon className="w-5 h-5" />
        </button>
        <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute left-0 mt-2 w-40 origin-top-left rounded-lg bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-black/10 dark:border-white/10">
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
    </div>
  );
};

const ReorderableSubjectItem: React.FC<{ subject: Subject, index: number }> = ({ subject, index }) => {
    const controls = useDragControls();
    const { accentColor } = useAppearance();
    return (
        <Reorder.Item value={subject} dragListener={false} dragControls={controls}>
            <div className="group relative flex items-center gap-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-4 transition-all duration-300 backdrop-blur-lg shadow-md">
                <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-gray-500 dark:text-gray-400 p-2">
                    <ReorderIcon className="w-5 h-5" />
                </div>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-${accentColor}-600 dark:text-${accentColor}-400 font-bold shrink-0`}>{index + 1}</span>
                <span className="font-medium text-gray-900 dark:text-white truncate">{subject.title}</span>
            </div>
        </Reorder.Item>
    );
};

const TopicPage: React.FC = () => {
  const { courseId, topicId } = useParams<{ courseId: string, topicId: string }>();
  const { courses, dispatch } = useContext(CourseContext);
  const { accentColor } = useAppearance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedSubjects, setReorderedSubjects] = useState<Subject[]>([]);

  const course = courses.find(c => c.id === courseId);
  const topic = course?.topics.find(t => t.id === topicId);
  
  useEffect(() => {
    if (isReorderMode && topic) {
        setReorderedSubjects([...topic.subjects].sort((a, b) => (a.sortOrder || a.createdAt) - (b.sortOrder || b.createdAt)));
    }
  }, [isReorderMode, topic]);

  const displayedSubjects = useMemo(() => {
    if (!topic) return [];
    
    const lowercasedQuery = searchQuery.toLocaleLowerCase('fa');
    const filteredSubjects = topic.subjects.filter(subject =>
        subject.title.toLocaleLowerCase('fa').includes(lowercasedQuery)
    );

    return [...filteredSubjects].sort((a, b) => (a.sortOrder || a.createdAt) - (b.sortOrder || b.createdAt));
  }, [topic, searchQuery]);

  if (!course || !topic) {
    return <div className="text-center text-red-400">سرفصل یافت نشد.</div>;
  }
  
  const handleSaveReorder = () => {
    if (!courseId || !topicId) return;
    dispatch({ type: 'REORDER_SUBJECTS', payload: { courseId, topicId, subjects: reorderedSubjects }});
    setIsReorderMode(false);
  };
  
  const handleCancelReorder = () => {
      setIsReorderMode(false);
      setReorderedSubjects([]);
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setSubjectTitle('');
    setIsModalOpen(true);
  };
  
  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectTitle(subject.title);
    setIsModalOpen(true);
  };

  const handleSaveSubject = () => {
    if (subjectTitle.trim() === '' || !courseId || !topicId) return;

    if (editingSubject) {
      dispatch({ type: 'EDIT_SUBJECT', payload: { courseId, topicId, subjectId: editingSubject.id, title: subjectTitle } });
    } else {
      dispatch({ type: 'ADD_SUBJECT', payload: { courseId, topicId, title: subjectTitle } });
    }
    setIsModalOpen(false);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setDeletingSubjectId(subjectId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteSubject = () => {
    if (courseId && topicId && deletingSubjectId) {
        dispatch({ type: 'DELETE_SUBJECT', payload: { courseId, topicId, subjectId: deletingSubjectId } });
    }
    setIsConfirmModalOpen(false);
    setDeletingSubjectId(null);
  };


  return (
    <>
      <header className="mb-8">
        <Link to={`/course/${courseId}`} className={`flex items-center gap-2 text-${accentColor}-600 dark:text-${accentColor}-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300 mb-4 transition-colors`}>
          <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
          <span>بازگشت به سرفصل‌ها</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-grow">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{topic.title}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{isReorderMode ? 'موضوعات را بکشید تا ترتیب دلخواه خود را تنظیم کنید.' : 'موضوعات این سرفصل را مدیریت کنید.'}</p>
            </div>
            {!isReorderMode && (
                <button
                onClick={openAddModal}
                className={`flex items-center gap-2 rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400 shrink-0 self-start md:self-center`}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>موضوع جدید</span>
                </button>
            )}
        </div>
      </header>

      <div className="mb-6">
        {isReorderMode ? (
             <div className="flex items-center justify-end gap-4">
                <button onClick={handleCancelReorder} className="flex items-center justify-center gap-2 h-10 rounded-lg bg-gray-500 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-400 shrink-0">
                    <XIcon className="w-5 h-5" />
                    <span>انصراف</span>
                </button>
                <button onClick={handleSaveReorder} className={`flex items-center justify-center gap-2 h-10 rounded-lg bg-${accentColor}-500 px-4 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`}>
                    <SaveIcon className="w-5 h-5" />
                    <span>ذخیره چیدمان</span>
                </button>
            </div>
        ) : (
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <SearchIcon className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="جستجوی موضوع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-lg border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-700/50 pr-10 pl-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-${accentColor}-500 focus:ring-${accentColor}-500 transition`}
                />
            </div>
        )}
      </div>
      
      <div className="space-y-4">
        {isReorderMode ? (
            <Reorder.Group axis="y" values={reorderedSubjects} onReorder={setReorderedSubjects} className="space-y-4">
                {reorderedSubjects.map((subject, index) => (
                    <ReorderableSubjectItem key={subject.id} subject={subject} index={index} />
                ))}
            </Reorder.Group>
        ) : displayedSubjects.length > 0 ? (
          displayedSubjects.map((subject, index) => (
            <SubjectListItem 
              key={subject.id} 
              subject={subject} 
              index={index}
              onEdit={() => openEditModal(subject)}
              onDelete={() => handleDeleteSubject(subject.id)}
              onReorder={() => setIsReorderMode(true)}
            />
          ))
        ) : (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-700">
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز موضوعی وجود ندارد.'}</h3>
            <p className="text-gray-500 mt-1">{searchQuery ? `هیچ موضوعی با عبارت "${searchQuery}" مطابقت ندارد.` : 'برای شروع، اولین موضوع خود را اضافه کنید!'}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSubject ? "ویرایش موضوع" : "افزودن موضوع جدید"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSubject(); }}>
          <div>
            <label htmlFor="subject-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان موضوع</label>
            <input
              id="subject-title"
              type="text"
              value={subjectTitle}
              onChange={(e) => setSubjectTitle(e.target.value)}
              placeholder="مثال: مدیریت State با Redux"
              className={`w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-${accentColor}-500 focus:ring-${accentColor}-500 transition`}
              required
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className={`rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`}
            >
              {editingSubject ? 'ذخیره تغییرات' : 'ایجاد موضوع'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteSubject}
        title="حذف موضوع"
        message="آیا از حذف این موضوع اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        confirmText="بله، حذف کن"
      />
    </>
  );
};

export default TopicPage;