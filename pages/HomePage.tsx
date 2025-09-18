import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import { CourseContext } from '../App';
import Modal, { ConfirmModal } from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons';

const CourseCard: React.FC<{ course: Course, onEdit: () => void, onDelete: () => void }> = ({ course, onEdit, onDelete }) => (
  <div className="group relative rounded-xl border border-white/10 bg-gray-800/40 p-6 shadow-lg transition-all duration-300 hover:bg-gray-700/50 hover:border-sky-400/30">
    <Link to={`/course/${course.id}`} className="absolute inset-0 z-10" aria-label={`View ${course.name}`}></Link>
    <div className="relative z-20">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors duration-300">{course.name}</h3>
          <p className="mt-2 text-gray-400 text-sm">{course.description}</p>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} className="p-2 rounded-full hover:bg-white/10" aria-label="Edit course"><PencilIcon className="w-5 h-5"/></button>
           <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="p-2 rounded-full hover:bg-red-500/20 text-red-400" aria-label="Delete course"><TrashIcon className="w-5 h-5"/></button>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-sky-400">{course.topics.length} {course.topics.length === 1 ? 'Topic' : 'Topics'}</p>
    </div>
  </div>
);


const HomePage: React.FC = () => {
  const { courses, dispatch } = useContext(CourseContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

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
    if (courseName.trim() === '') return;
    if (editingCourse) {
      dispatch({ type: 'EDIT_COURSE', payload: { courseId: editingCourse.id, name: courseName, description: courseDescription } });
    } else {
      dispatch({ type: 'ADD_COURSE', payload: { name: courseName, description: courseDescription } });
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
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">My Courses</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400 hover:shadow-sky-400/40"
        >
          <PlusIcon className="h-5 w-5" />
          New Course
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course}
            onEdit={() => openEditModal(course)}
            onDelete={() => handleDeleteCourse(course.id)}
          />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? "Edit Course" : "Add New Course"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="course-name" className="block text-sm font-medium text-gray-300 mb-1">Course Name</label>
              <input
                id="course-name"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Introduction to React"
                className="w-full rounded-md border-white/20 bg-gray-700/50 px-3 py-2 text-white focus:border-sky-500 focus:ring-sky-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="course-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                id="course-desc"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                rows={3}
                placeholder="A short description of the course."
                className="w-full rounded-md border-white/20 bg-gray-700/50 px-3 py-2 text-white focus:border-sky-500 focus:ring-sky-500 transition"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
            >
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message="Are you sure you want to delete this course and all its topics? This action cannot be undone."
      />
    </>
  );
};

export default HomePage;