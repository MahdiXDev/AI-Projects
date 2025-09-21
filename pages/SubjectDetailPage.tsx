
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseContext } from '../App';
import { useAppearance } from '../contexts/AppearanceContext';
import { ImageLightbox } from '../components/Modal';
import { ArrowRightIcon, SaveIcon, ImageIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, UploadIcon } from '../components/icons';

const SubjectDetailPage: React.FC = () => {
  const { courseId, topicId, subjectId } = useParams<{ courseId: string; topicId: string; subjectId: string }>();
  const navigate = useNavigate();
  const { courses, dispatch } = useContext(CourseContext);
  const { accentColor } = useAppearance();

  const [notes, setNotes] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const topic = course?.topics.find(t => t.id === topicId);
  const subject = topic?.subjects.find(s => s.id === subjectId);

  useEffect(() => {
    if (subject) {
      setNotes(subject.notes);
      setImageUrls(subject.imageUrls || []);
      setCurrentImageIndex(0);
      setIsDirty(false);
    }
  }, [subject]);

  if (!course || !topic || !subject) {
    return <div className="text-center text-red-400">موضوع یافت نشد.</div>;
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsDirty(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(newBase64Urls => {
        setImageUrls(prev => [...prev, ...newBase64Urls]);
        setIsDirty(true);
      }).catch(error => console.error("Error reading files:", error));
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    const newImageUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newImageUrls);
    if (currentImageIndex >= newImageUrls.length) {
      setCurrentImageIndex(Math.max(0, newImageUrls.length - 1));
    }
    setIsDirty(true);
  }

  const handleSaveChanges = () => {
    if (courseId && topicId && subjectId) {
      dispatch({
        type: 'UPDATE_SUBJECT_DETAILS',
        payload: { courseId, topicId, subjectId, notes, imageUrls },
      });
      setIsDirty(false);
    }
  };
  
  const goToPrevious = () => setCurrentImageIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  const goToNext = () => setCurrentImageIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));

  return (
    <>
      <div>
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-${accentColor}-600 dark:text-${accentColor}-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300 mb-4 transition-colors`}>
              <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
              <span>بازگشت</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{subject.title}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">یادداشت‌ها و منابع برای این موضوع.</p>
              </div>
              {isDirty && (
                  <button
                  onClick={handleSaveChanges}
                  className={`mt-4 md:mt-0 w-full md:w-auto shrink-0 flex items-center gap-2 justify-center rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`}
                  >
                    <SaveIcon className="w-5 h-5" />
                    <span>ذخیره تغییرات</span>
                  </button>
              )}
          </div>
        </header>

        <div className="space-y-8">
          {/* Notes Editor */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
            <label htmlFor="notes" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">یادداشت‌ها</label>
            <textarea
              id="notes"
              value={notes}
              onChange={handleNotesChange}
              rows={15}
              placeholder="یادداشت‌های خود را اینجا بنویسید..."
              className={`w-full resize-none rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 p-4 text-gray-800 dark:text-gray-200 focus:border-${accentColor}-500 focus:ring-${accentColor}-500 transition placeholder-gray-500`}
            />
          </div>
          
          {/* Image Uploader & Slider */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">تصاویر مرتبط</h2>
              <div 
                className={`relative w-full aspect-video rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/50 overflow-hidden group ${imageUrls.length > 0 ? 'cursor-pointer' : ''}`}
                onClick={() => imageUrls.length > 0 && setLightboxImageUrl(imageUrls[currentImageIndex])}
              >
                {imageUrls.length > 0 ? (
                  <>
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={currentImageIndex}
                        src={imageUrls[currentImageIndex]}
                        alt={`Topic visual ${currentImageIndex + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(currentImageIndex); }} 
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500/80"
                      aria-label="Remove image"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>

                    {imageUrls.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                          className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <ChevronRightIcon className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); goToNext(); }}
                          className="absolute top-1/2 left-2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">تصویری آپلود نشده است</p>
                  </div>
                )}
              </div>
              {imageUrls.length > 1 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{currentImageIndex + 1} / {imageUrls.length}</p>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="file-upload" className={`relative cursor-pointer w-full flex items-center justify-center gap-2 text-center rounded-lg bg-${accentColor}-500/20 px-4 py-2 text-sm font-semibold text-${accentColor}-600 dark:text-${accentColor}-300 transition-colors duration-300 hover:bg-${accentColor}-500/30`}>
                <UploadIcon className="w-5 h-5" />
                <span>{imageUrls.length > 0 ? 'افزودن تصاویر بیشتر' : 'بارگذاری تصویر'}</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-gray-500 text-center mt-2">PNG, JPG, GIF تا ۱۰ مگابایت</p>
            </div>

          </div>
        </div>
      </div>
      <ImageLightbox 
        isOpen={!!lightboxImageUrl}
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />
    </>
  );
};

export default SubjectDetailPage;