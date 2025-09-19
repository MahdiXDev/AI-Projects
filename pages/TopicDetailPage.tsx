import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseContext } from '../App';
import { ImageLightbox } from '../components/Modal';

const TopicDetailPage: React.FC = () => {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const { courses, dispatch } = useContext(CourseContext);

  const [notes, setNotes] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const topic = course?.topics.find(t => t.id === topicId);

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes);
      setImageUrls(topic.imageUrls || []);
      setCurrentImageIndex(0);
      setIsDirty(false);
    }
  }, [topic]);

  if (!course || !topic) {
    return <div className="text-center text-red-400">سرفصل یافت نشد.</div>;
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
    if (courseId && topicId) {
      dispatch({
        type: 'UPDATE_TOPIC_DETAILS',
        payload: { courseId, topicId, notes, imageUrls },
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
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
              <span>&rarr;</span>
              <span>بازگشت به سرفصل‌ها</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{topic.title}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">یادداشت‌ها و منابع برای این سرفصل.</p>
              </div>
              {isDirty && (
                  <button
                  onClick={handleSaveChanges}
                  className="mt-4 md:mt-0 w-full md:w-auto shrink-0 flex items-center gap-2 justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
                  >
                    <span>ذخیره تغییرات</span>
                  </button>
              )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes Editor */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg">
            <label htmlFor="notes" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">یادداشت‌ها</label>
            <textarea
              id="notes"
              value={notes}
              onChange={handleNotesChange}
              rows={15}
              placeholder="یادداشت‌های خود را اینجا بنویسید..."
              className="w-full resize-none rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 p-4 text-gray-800 dark:text-gray-200 focus:border-sky-500 focus:ring-sky-500 transition placeholder-gray-500"
            />
          </div>
          
          {/* Image Uploader & Slider */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">تصاویر مرتبط</h2>
              <div 
                className={`relative w-full aspect-video rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 overflow-hidden group ${imageUrls.length > 0 ? 'cursor-pointer' : ''}`}
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
                      <span role="img" aria-label="trash">🗑️</span>
                    </button>

                    {imageUrls.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                          className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <span>&gt;</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); goToNext(); }}
                          className="absolute top-1/2 left-2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <span>&lt;</span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-5xl mb-2">🖼️</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">تصویری آپلود نشده است</p>
                  </div>
                )}
              </div>
              {imageUrls.length > 1 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{currentImageIndex + 1} / {imageUrls.length}</p>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="file-upload" className="relative cursor-pointer w-full flex items-center justify-center gap-2 text-center rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300 transition-colors duration-300 hover:bg-sky-500/30">
                <span>{imageUrls.length > 0 ? 'افزودن تصاویر بیشتر' : 'بارگذاری تصویر'}</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-gray-500 text-center mt-1">PNG, JPG, GIF تا ۱۰ مگابایت</p>
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

export default TopicDetailPage;