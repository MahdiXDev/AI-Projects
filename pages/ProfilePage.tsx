import React, { useContext, useState, useRef, useMemo } from 'react';
import { AuthContext, CourseContext } from '../App';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/Modal';
import { ArrowRightIcon, PencilIcon, UploadIcon, DownloadIcon } from '../components/icons';
import { db } from '../utils/db'; // Import IndexedDB utility
import { useAppearance, AccentColor, BackgroundPattern, Theme } from '../contexts/AppearanceContext';

interface AppData {
    users: any[];
    global_courses: any[];
}

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => {
    const { accentColor } = useAppearance();
    return (
      <div className="rounded-lg bg-gray-500/10 p-4 text-center">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</dt>
        <dd className={`mt-1 text-2xl font-semibold tracking-tight text-${accentColor}-600 dark:text-${accentColor}-400`}>{value}</dd>
      </div>
    );
};

const ProfilePage: React.FC = () => {
    const { user, updateUser, changePassword, deleteCurrentUser } = useContext(AuthContext);
    const { courses, dispatch: dispatchCourseAction } = useContext(CourseContext);
    const { 
        theme, setTheme, 
        accentColor, setAccentColor,
        backgroundPattern, setBackgroundPattern
    } = useAppearance();
    
    const profilePicInputRef = useRef<HTMLInputElement>(null);
    const importFileInputRef = useRef<HTMLInputElement>(null);
    
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importData, setImportData] = useState<AppData | null>(null);

    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const totalTopics = useMemo(() => courses.reduce((acc, course) => acc + course.topics.length, 0), [courses]);
    const registrationDate = useMemo(() => user ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '', [user]);
    
    const accentColorOptions: { name: AccentColor, bgClass: string }[] = [
        { name: 'sky', bgClass: 'bg-sky-500' },
        { name: 'emerald', bgClass: 'bg-emerald-500' },
        { name: 'rose', bgClass: 'bg-rose-500' },
        { name: 'violet', bgClass: 'bg-violet-500' },
        { name: 'amber', bgClass: 'bg-amber-500' },
        { name: 'teal', bgClass: 'bg-teal-500' },
        { name: 'orange', bgClass: 'bg-orange-500' },
        { name: 'indigo', bgClass: 'bg-indigo-500' },
    ];

    const backgroundPatternOptions: { name: BackgroundPattern, label: string, previewClass: string }[] = [
        { name: 'grid', label: 'شبکه‌ای', previewClass: 'bg-[size:2rem_2rem] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]' },
        { name: 'dots', label: 'نقطه‌چین', previewClass: '[background-size:0.75rem_0.75rem] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)]' },
        { name: 'waves', label: 'موج', previewClass: `bg-size-[40px_20px] bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 20' width='40' height='20'%3e%3cpath d='M0 10 C10 0, 30 0, 40 10' stroke='%23d1d5db' fill='none' stroke-width='2'/%3e%3c/svg%3e")] dark:bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 20' width='40' height='20'%3e%3cpath d='M0 10 C10 0, 30 0, 40 10' stroke='%23374151' fill='none' stroke-width='2'/%3e%3c/svg%3e")]`},
        { name: 'triangles', label: 'مثلث', previewClass: `bg-size-[30px_30px] bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 100 100'%3e%3cpath d='M0 100 L50 0 L100 100 Z' fill='%23e5e7eb'/%3e%3c/svg%3e")] dark:bg-[image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 100 100'%3e%3cpath d='M0 100 L50 0 L100 100 Z' fill='%231f2937'/%3e%3c/svg%3e")]` },
        { name: 'checkerboard', label: 'شطرنجی', previewClass: 'bg-size-[20px_20px] bg-[image:linear-gradient(45deg,#d1d5db_25%,transparent_25%),linear-gradient(-45deg,#d1d5db_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#d1d5db_75%),linear-gradient(-45deg,transparent_75%,#d1d5db_75%)] dark:bg-[image:linear-gradient(45deg,#374151_25%,transparent_25%),linear-gradient(-45deg,#374151_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#374151_75%),linear-gradient(-45deg,transparent_75%,#374151_75%)]' },
        { name: 'none', label: 'ساده', previewClass: '' },
    ];

    if (!user) {
        return <div className="text-center">در حال بارگذاری پروفایل...</div>;
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ profilePicture: reader.result as string });
                showMessage('success', 'تصویر پروفایل با موفقیت به‌روزرسانی شد.');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUsernameUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUsername.trim() && newUsername.trim() !== user.username) {
            updateUser({ username: newUsername.trim() });
            showMessage('success', 'نام کاربری با موفقیت تغییر کرد.');
        } else {
            showMessage('error', 'نام کاربری جدید نمی‌تواند خالی یا مشابه نام قبلی باشد.');
        }
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if(!oldPassword || !newPassword || !confirmNewPassword) {
            showMessage('error', 'لطفا تمام فیلدهای رمز عبور را پر کنید.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showMessage('error', 'رمز عبور جدید با تکرار آن مطابقت ندارد.');
            return;
        }
        if (changePassword(oldPassword, newPassword)) {
            showMessage('success', 'رمز عبور با موفقیت تغییر کرد.');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } else {
            showMessage('error', 'رمز عبور فعلی نامعتبر است.');
        }
    };
    
    const handleDeleteAccount = () => {
        if (user) {
            dispatchCourseAction({ type: 'DELETE_COURSES_BY_USER', payload: { userEmail: user.email }});
            deleteCurrentUser();
        }
        setIsDeleteModalOpen(false);
    };
    
    const handleExport = async () => {
        try {
            const users = await db.getAllUsers();
            const courses = await db.getAllCourses();
            
            if (users.length === 0 && courses.length === 0) {
                showMessage('error', 'داده‌ای برای خروجی گرفتن وجود ندارد.');
                return;
            }
            const dataToExport = {
                users: users,
                global_courses: courses,
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
            const link = document.createElement('a');
            link.href = jsonString;
            link.download = 'course_manager_backup.json';
            link.click();
            showMessage('success', 'داده‌ها با موفقیت خروجی گرفته شد.');
        } catch (error) {
            showMessage('error', 'خطا در خروجی گرفتن داده‌ها.');
            console.error("Export error:", error);
        }
    };

    const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') throw new Error('فایل معتبر نیست.');
                const data = JSON.parse(text);
                
                if (!data.users || !data.global_courses || !Array.isArray(data.users) || !Array.isArray(data.global_courses)) {
                    throw new Error('ساختار فایل پشتیبان معتبر نیست.');
                }
                setImportData(data);
                setIsImportModalOpen(true);
            } catch (error) {
                showMessage('error', error instanceof Error ? error.message : 'خطا در خواندن فایل.');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    };

    const confirmImport = async () => {
        if (!importData) return;
        try {
            await db.saveAllUsers(importData.users);
            await db.saveAllCourses(importData.global_courses);
            setIsImportModalOpen(false);
            setImportData(null);
            alert('داده‌ها با موفقیت وارد شد. برنامه برای اعمال تغییرات مجدداً بارگذاری می‌شود.');
            window.location.reload();
        } catch (error) {
            showMessage('error', 'خطا در ذخیره‌سازی داده‌های وارد شده.');
        }
    };

    const inputClasses = `w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-${accentColor}-500 focus:ring-${accentColor}-500 transition`;
    const buttonClasses = `w-full rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`;


    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8">
                 <Link to="/" className={`flex items-center gap-2 text-${accentColor}-600 dark:text-${accentColor}-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300 mb-4 transition-colors`}>
                    <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
                    <span>بازگشت به دوره‌ها</span>
                </Link>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">پنل کاربری</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">اطلاعات حساب خود را مدیریت کنید.</p>
            </header>

            <div className="space-y-8">
                {/* Profile Header & Stats */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative group shrink-0">
                            <img src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"/>
                            <button onClick={() => profilePicInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" aria-label="Change profile picture">
                                <PencilIcon className="w-8 h-8 text-white" />
                            </button>
                            <input type="file" ref={profilePicInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*" />
                        </div>
                        <div className="text-center sm:text-right">
                            <h2 className="text-2xl font-bold">{user.username}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <StatCard title="تعداد دوره‌ها" value={courses.length} />
                        <StatCard title="تعداد سرفصل‌ها" value={totalTopics} />
                        <StatCard title="تاریخ عضویت" value={registrationDate} />
                    </dl>
                </div>
                
                 {/* App Settings */}
                 <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-xl font-semibold mb-6">تنظیمات برنامه</h3>
                    <div className="space-y-6">
                        {/* Theme */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تم</label>
                            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-gray-200 dark:bg-gray-700/50">
                                <button onClick={() => setTheme('light')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${theme === 'light' ? `bg-white text-gray-800 shadow` : 'text-gray-600 dark:text-gray-300'}`}>روشن</button>
                                <button onClick={() => setTheme('dark')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${theme === 'dark' ? `bg-gray-900 text-white shadow` : 'text-gray-600 dark:text-gray-300'}`}>تاریک</button>
                            </div>
                        </div>
                        {/* Accent Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رنگ اصلی</label>
                            <div className="flex flex-wrap items-center gap-3">
                                {accentColorOptions.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setAccentColor(color.name)}
                                        aria-label={`Select ${color.name} theme`}
                                        className={`w-8 h-8 rounded-full ${color.bgClass} transition-transform hover:scale-110 ${accentColor === color.name ? `ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-950 ring-${color.name}-500` : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Background Pattern */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">طرح پس‌زمینه</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {backgroundPatternOptions.map(pattern => (
                                    <button 
                                      key={pattern.name} 
                                      onClick={() => setBackgroundPattern(pattern.name)}
                                      className={`relative p-2 h-20 w-full rounded-lg text-center transition-all duration-200 ${backgroundPattern === pattern.name ? `ring-2 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-950 ring-${accentColor}-500` : 'ring-1 ring-gray-300 dark:ring-gray-600'}`}
                                    >
                                      <div className={`absolute inset-0 rounded-md bg-gray-200 dark:bg-gray-900 ${pattern.previewClass}`}></div>
                                      <span className="relative z-10 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-950/50 px-2 py-1 rounded-md">{pattern.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-xl font-semibold mb-6">ویرایش پروفایل</h3>
                    <div className="space-y-8">
                        <form onSubmit={handleUsernameUpdate} className="space-y-4">
                             <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تغییر نام کاربری</label>
                                <input id="username" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={inputClasses}/>
                            </div>
                            <button type="submit" className={buttonClasses}>ذخیره نام کاربری</button>
                        </form>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">تغییر رمز عبور</h4>
                            <div>
                                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className={inputClasses} placeholder="رمز عبور فعلی" autoComplete="current-password" />
                            </div>
                            <div>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} placeholder="رمز عبور جدید" autoComplete="new-password" />
                            </div>
                             <div>
                                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={inputClasses} placeholder="تکرار رمز عبور جدید" autoComplete="new-password" />
                            </div>
                            <button type="submit" className={buttonClasses}>تغییر رمز عبور</button>
                        </form>
                    </div>
                </div>

                {statusMessage.text && (
                    <p className={`text-sm text-center p-2 rounded-md ${statusMessage.type === 'success' ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'}`}>{statusMessage.text}</p>
                )}

                {/* Data Management */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-lg font-semibold">مدیریت داده‌ها</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-4">برای یکپارچه‌سازی اطلاعات بین دستگاه‌های مختلف، از داده‌های خود خروجی گرفته و در دستگاه دیگر وارد کنید.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-500">
                            <DownloadIcon className="w-5 h-5"/>
                            <span>خروجی گرفتن از داده‌ها</span>
                        </button>
                        <button onClick={() => importFileInputRef.current?.click()} className={`flex-1 flex items-center justify-center gap-2 rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`}>
                           <UploadIcon className="w-5 h-5"/>
                           <span>وارد کردن داده‌ها</span>
                        </button>
                        <input type="file" ref={importFileInputRef} onChange={handleImportFileSelect} className="hidden" accept=".json" />
                    </div>
                </div>

                 <div className="rounded-xl border border-red-500/50 dark:border-red-400/50 bg-red-500/10 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">منطقه خطر</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1 mb-4">این عملیات غیرقابل بازگشت است. با حذف حساب، تمام دوره‌ها و اطلاعات شما برای همیشه پاک خواهد شد.</p>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed">
                        حذف حساب کاربری
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="تایید حذف حساب"
                message="آیا کاملاً مطمئن هستید؟ تمام اطلاعات شما برای همیشه حذف خواهد شد."
                confirmText="بله، حسابم را حذف کن"
                isDestructive
            />
            <ConfirmModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onConfirm={confirmImport}
                title="تایید وارد کردن داده‌ها"
                message="آیا مطمئن هستید؟ تمام داده‌های فعلی شما با اطلاعات موجود در فایل جایگزین خواهد شد. این عمل غیرقابل بازگشت است."
                confirmText="بله، جایگزین کن"
                isDestructive
            />
        </div>
    );
};

export default ProfilePage;