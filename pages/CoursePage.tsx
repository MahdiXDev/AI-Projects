import React, { useContext, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Topic } from '../types';
import { CourseContext } from '../App';
import Modal, { ConfirmModal } from '../components/Modal';
import { ArrowLeftIcon, PlusIcon, DotsVerticalIcon, PencilIcon, TrashIcon } from '../components/icons';

const TopicListItem: React.FC<{ topic: Topic, index: number, onEdit: () => void, onDelete: () => void }> = ({ topic, index, onEdit, onDelete }) => {
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
    <div className="group flex items-center justify-between rounded-xl border border-white/10 bg-gray-800/40 p-4 transition-all duration-300 hover:bg-gray-700/50 hover:border-sky-400/30">
      <Link to={`topic/${topic.id}`} className="flex items-center gap-4 flex-grow">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sky-400 font-bold">{index + 1}</span>
        <span className="font-medium text-white group-hover:text-sky-300 transition-colors">{topic.title}</span>
      </Link>
      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <DotsVerticalIcon />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-white/10">
            <div className="py-1">
              <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80">
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
              <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses, dispatch } = useContext(CourseContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <div className="text-center text-red-400">Course not found.</div>;
  }
  
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
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 mb-4 transition-colors">
          <ArrowLeftIcon />
          Back to Courses
        </button>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">{course.name}</h1>
                <p className="mt-1 text-gray-400">{course.description}</p>
            </div>
            <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
            >
            <PlusIcon className="h-5 w-5" />
            New Topic
            </button>
        </div>
      </header>
      
      <div className="space-y-4">
        {course.topics.length > 0 ? (
          course.topics.map((topic, index) => (
            <TopicListItem 
              key={topic.id} 
              topic={topic} 
              index={index}
              onEdit={() => openEditModal(topic)}
              onDelete={() => handleDeleteTopic(topic.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-700">
            <h3 className="text-xl font-medium text-gray-400">No topics yet.</h3>
            <p className="text-gray-500 mt-1">Add your first topic to get started!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTopic ? "Edit Topic" : "Add New Topic"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTopic(); }}>
          <div>
            <label htmlFor="topic-title" className="block text-sm font-medium text-gray-300 mb-1">Topic Title</label>
            <input
              id="topic-title"
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="e.g., Components and Props"
              className="w-full rounded-md border-white/20 bg-gray-700/50 px-3 py-2 text-white focus:border-sky-500 focus:ring-sky-500 transition"
              required
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
            >
              {editingTopic ? 'Save Changes' : 'Create Topic'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTopic}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
      />
    </>
  );
};

export default CoursePage;