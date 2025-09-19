import React, { useContext, useState, useRef, useMemo } from 'react';
import { AuthContext, CourseContext } from '../App';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/Modal';
import { ArrowRightIcon, PencilIcon } from '../components/icons';

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="rounded-lg bg-gray-500/10 p-4 text-center">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</dt>
    <dd className="mt-1 text-2xl font-semibold tracking-tight text-sky-600 dark:text-sky-400">{value}</dd>
  </div>
);

const ProfilePage: React.FC = () => {
    const { user, isAdmin, updateUser, changePassword, deleteCurrentUser } = useContext(AuthContext);
    const { courses, dispatch: dispatchCourseAction } = useContext(CourseContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Form states
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const totalTopics = useMemo(() => courses.reduce((acc, course) => acc + course.topics.length, 0), [courses]);
    const memberSinceDays = useMemo(() => {
        if (!user) return 0;
        const diff = Date.now() - user.createdAt;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }, [user]);
    const registrationDate = useMemo(() => user ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '', [user]);


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

    const inputClasses = "w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition";
    const buttonClasses = "w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400";


    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8">
                 <Link to="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
                    <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
                    <span>بازگشت به دوره‌ها</span>
                </Link>
                <h1 className="text-4xl font-bold tracking-tight">پنل کاربری</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">اطلاعات حساب خود را مدیریت کنید.</p>
            </header>

            <div className="space-y-8">
                {/* Profile Header & Stats */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative group shrink-0">
                            <img src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"/>
                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" aria-label="Change profile picture">
                                <PencilIcon className="w-8 h-8 text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*" />
                        </div>
                        <div className="text-center sm:text-right">
                            <h2 className="text-2xl font-bold">{user.username}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="تعداد دوره‌ها" value={courses.length} />
                        <StatCard title="تعداد سرفصل‌ها" value={totalTopics} />
                        <StatCard title="تاریخ عضویت" value={registrationDate} />
                        <StatCard title="روزهای عضویت" value={memberSinceDays} />
                    </dl>
                </div>
                
                 {/* Admin Panel Link */}
                {isAdmin && (
                     <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                        <h3 className="text-lg font-semibold mb-3">پنل مدیریت</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">به عنوان مدیر، شما به پنل مدیریت کاربران دسترسی دارید.</p>
                        <Link to="/admin/users" className="inline-block rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">
                            ورود به پنل مدیریت
                        </Link>
                    </div>
                )}
                
                {/* Edit Profile */}
                 <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-xl font-semibold mb-6">ویرایش پروفایل</h3>
                    <div className="space-y-8">
                        {/* Change Username Form */}
                        <form onSubmit={handleUsernameUpdate} className="space-y-4">
                             <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تغییر نام کاربری</label>
                                <input id="username" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={inputClasses}/>
                            </div>
                            <button type="submit" className={buttonClasses}>ذخیره نام کاربری</button>
                        </form>
                        {/* Change Password Form */}
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">تغییر رمز عبور</h4>
                            <div>
                                <label htmlFor="old-pass" className="sr-only">رمز عبور فعلی</label>
                                <input id="old-pass" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className={inputClasses} placeholder="رمز عبور فعلی" />
                            </div>
                            <div>
                                <label htmlFor="new-pass" className="sr-only">رمز عبور جدید</label>
                                <input id="new-pass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} placeholder="رمز عبور جدید" />
                            </div>
                             <div>
                                <label htmlFor="confirm-new-pass" className="sr-only">تکرار رمز عبور جدید</label>
                                <input id="confirm-new-pass" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={inputClasses} placeholder="تکرار رمز عبور جدید" />
                            </div>
                            <button type="submit" className={buttonClasses}>تغییر رمز عبور</button>
                        </form>
                    </div>
                </div>

                {/* Status Message */}
                {statusMessage.text && (
                    <p className={`text-sm text-center p-2 rounded-md ${statusMessage.type === 'success' ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'}`}>{statusMessage.text}</p>
                )}

                {/* Danger Zone */}
                 <div className="rounded-xl border border-red-500/50 dark:border-red-400/50 bg-red-500/10 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">منطقه خطر</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1 mb-4">این عملیات غیرقابل بازگشت است. با حذف حساب، تمام دوره‌ها و اطلاعات شما برای همیشه پاک خواهد شد.</p>
                    <button onClick={() => setIsDeleteModalOpen(true)} disabled={isAdmin} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed">
                        حذف حساب کاربری
                    </button>
                    {isAdmin && <p className="text-xs text-red-600 dark:text-red-400 mt-2">حساب مدیر قابل حذف نیست.</p>}
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
        </div>
    );
};

export default ProfilePage;