import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseContext } from '../App';
import { ArrowLeftIcon, UploadIcon, XIcon } from '../components/icons';

const TopicDetailPage: React.FC = () => {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const { courses, dispatch } = useContext(CourseContext);

  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [isDirty, setIsDirty] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const topic = course?.topics.find(t => t.id === topicId);

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes);
      setImageUrl(topic.imageUrl);
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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImageUrl('');
    setIsDirty(true);
  }

  const handleSaveChanges = () => {
    if (courseId && topicId) {
      dispatch({
        type: 'UPDATE_TOPIC_DETAILS',
        payload: { courseId, topicId, notes, imageUrl },
      });
      setIsDirty(false);
      // Optional: Show a success message
    }
  };

  return (
    <div>
      <header className="mb-8">
        <button onClick={() => navigate(`/course/${courseId}`)} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 mb-4 transition-colors">
          <ArrowLeftIcon className="h-6 w-6 rtl:scale-x-[-1]" />
          بازگشت به سرفصل‌ها
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">{topic.title}</h1>
              <p className="mt-1 text-gray-400">یادداشت‌ها و منابع برای این سرفصل.</p>
            </div>
            {isDirty && (
                <button
                onClick={handleSaveChanges}
                className="mt-4 md:mt-0 w-full md:w-auto shrink-0 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400"
                >
                ذخیره تغییرات
                </button>
            )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notes Editor */}
        <div className="rounded-xl border border-white/10 bg-gray-800/40 p-6 shadow-lg">
          <label htmlFor="notes" className="block text-lg font-semibold text-white mb-3">یادداشت‌ها</label>
          <textarea
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            rows={15}
            placeholder="یادداشت‌های خود را اینجا بنویسید..."
            className="w-full h-full resize-none rounded-md border-white/20 bg-gray-700/50 p-4 text-gray-200 focus:border-sky-500 focus:ring-sky-500 transition placeholder-gray-500"
          />
        </div>
        
        {/* Image Uploader */}
        <div className="rounded-xl border border-white/10 bg-gray-800/40 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-3">تصویر مرتبط</h2>
          <div className="w-full aspect-video rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-700/50 overflow-hidden">
            {imageUrl ? (
              <div className="relative w-full h-full group">
                <img src={imageUrl} alt="Topic visual" className="w-full h-full object-cover" />
                <button 
                  onClick={removeImage} 
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <label htmlFor="file-upload" className="relative cursor-pointer mt-2 text-sm font-medium text-sky-400 hover:text-sky-300">
                  <span>بارگذاری تصویر</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                </label>
                <p className="text-xs text-gray-500">PNG, JPG, GIF تا ۱۰ مگابایت</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailPage;