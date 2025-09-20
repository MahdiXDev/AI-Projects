
import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import type { Topic } from '../types';
import { CourseContext } from '../App';
import Modal, { ConfirmModal } from '../components/Modal';
import { DotsVerticalIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, ArrowRightIcon, ReorderIcon, SaveIcon, XIcon } from '../components/icons';

const TopicListItem: React.FC<{ topic: Topic, index: number, onEdit: () => void, onDelete: () => void, onReorder: () => void }> = ({ topic, index, onEdit, onDelete, onReorder }) => {
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

  return (
    <div className={`group relative flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-4 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/60 backdrop-blur-lg hover:border-sky-500/30 dark:hover:border-sky-400/30 shadow-md hover:shadow-lg ${menuOpen ? 'z-10' : ''}`}>
      <Link to={`topic/${topic.id}`} className="flex items-center gap-4 flex-grow min-w-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-sky-600 dark:text-sky-400 font-bold shrink-0">{index + 1}</span>
        <span className="font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors truncate">{topic.title}</span>
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

const ReorderableTopicItem: React.FC<{ topic: Topic, index: number }> = ({ topic, index }) => {
    const controls = useDragControls();
    return (
        <Reorder.Item value={topic} dragListener={false} dragControls={controls}>
            <div className="group relative flex items-center gap-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-4 transition-all duration-300 backdrop-blur-lg shadow-md">
                <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-gray-500 dark:text-gray-400 p-2">
                    <ReorderIcon className="w-5 h-5" />
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-sky-600 dark:text-sky-400 font-bold shrink-0">{index + 1}</span>
                <span className="font-medium text-gray-900 dark:text-white truncate">{topic.title}</span>
            </div>
        </Reorder.Item>
    );
};

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, dispatch } = useContext(CourseContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedTopics, setReorderedTopics] = useState<Topic[]>([]);

  const course = courses.find(c => c.id === courseId);
  
  useEffect(() => {
    if (isReorderMode && course) {
        setReorderedTopics([...course.topics].sort((a, b) => (a.sortOrder || a.createdAt) - (b.sortOrder || b.createdAt)));
    }
  }, [isReorderMode, course]);

  const displayedTopics = useMemo(() => {
    if (!course) return [];
    
    const lowercasedQuery = searchQuery.toLocaleLowerCase('fa');
    const filteredTopics = course.topics.filter(topic =>
        topic.title.toLocaleLowerCase('fa').includes(lowercasedQuery)
    );

    return [...filteredTopics].sort((a, b) => (a.sortOrder || a.createdAt) - (b.sortOrder || b.createdAt));
  }, [course, searchQuery]);

  if (!course) {
    return <div className="text-center text-red-400">دوره یافت نشد.</div>;
  }
  
  const handleSaveReorder = () => {
    if (!courseId) return;
    dispatch({ type: 'REORDER_TOPICS', payload: { courseId, topics: reorderedTopics }});
    setIsReorderMode(false);
  };
  
  const handleCancelReorder = () => {
      setIsReorderMode(false);
      setReorderedTopics([]);
  };

  const openAddModal = () => {
    setEditingTopic(null);
    setTopicTitle('');
    setIsModalOpen(true);
  };
  
  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicTitle(topic.title);
    setIsModalOpen(true);
  };

  const handleSaveTopic = () => {
    if (topicTitle.trim() === '' || !courseId) return;

    if (editingTopic) {
      dispatch({ type: 'EDIT_TOPIC', payload: { courseId, topicId: editingTopic.id, title: topicTitle } });
    } else {
      dispatch({ type: 'ADD_TOPIC', payload: { courseId, title: topicTitle } });
    }
    setIsModalOpen(false);
  };

  const handleDeleteTopic = (topicId: string) => {
    setDeletingTopicId(topicId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTopic = () => {
    if (courseId && deletingTopicId) {
        dispatch({ type: 'DELETE_TOPIC', payload: { courseId, topicId: deletingTopicId } });
    }
    setIsConfirmModalOpen(false);
    setDeletingTopicId(null);
  };


  return (
    <>
      <header className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
          <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
          <span>بازگشت به دوره‌ها</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-grow">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{course.name}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{isReorderMode ? 'سرفصل‌ها را بکشید تا ترتیب دلخواه خود را تنظیم کنید.' : course.description}</p>
            </div>
            {!isReorderMode && (
                <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400 shrink-0 self-start md:self-center"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>سرفصل جدید</span>
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
                <button onClick={handleSaveReorder} className="flex items-center justify-center gap-2 h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">
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
                  placeholder="جستجوی سرفصل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-700/50 pr-10 pl-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-sky-500 focus:ring-sky-500 transition"
                />
            </div>
        )}
      </div>
      
      <div className="space-y-4">
        {isReorderMode ? (
            <Reorder.Group axis="y" values={reorderedTopics} onReorder={setReorderedTopics} className="space-y-4">
                {reorderedTopics.map((topic, index) => (
                    <ReorderableTopicItem key={topic.id} topic={topic} index={index} />
                ))}
            </Reorder.Group>
        ) : displayedTopics.length > 0 ? (
          displayedTopics.map((topic, index) => (
            <TopicListItem 
              key={topic.id} 
              topic={topic} 
              index={index}
              onEdit={() => openEditModal(topic)}
              onDelete={() => handleDeleteTopic(topic.id)}
              onReorder={() => setIsReorderMode(true)}
            />
          ))
        ) : (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-700">
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز سرفصلی وجود ندارد.'}</h3>
            <p className="text-gray-500 mt-1">{searchQuery ? `هیچ سرفصلی با عبارت "${searchQuery}" مطابقت ندارد.` : 'برای شروع، اولین سرفصل خود را اضافه کنید!'}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTopic ? "ویرایش سرفصل" : "افزودن سرفصل جدید"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTopic(); }}>
          <div>
            <label htmlFor="topic-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان سرفصل</label>
            <input
              id="topic-title"
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="مثال: کامپوننت‌ها و Props"
              className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition"
              required
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
            >
              {editingTopic ? 'ذخیره تغییرات' : 'ایجاد سرفصل'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTopic}
        title="حذف سرفصل"
        message="آیا از حذف این سرفصل اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        confirmText="بله، حذف کن"
      />
    </>
  );
};

export default CoursePage;
