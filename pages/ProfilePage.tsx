import React, { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, CourseContext } from '../App';
import { ConfirmModal } from '../components/Modal';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUser, deleteUser } = useContext(AuthContext);
    const { courses } = useContext(CourseContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for forms
    const [newUsername, setNewUsername] = useState(currentUser?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // State for UI feedback
    const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    if (!currentUser) {
        return <div>کاربر یافت نشد.</div>;
    }

    // --- CALCULATED STATS ---
    const totalTopics = courses.reduce((acc, course) => acc + course.topics.length, 0);
    const memberSince = new Date(currentUser.createdAt).toLocaleDateString('fa-IR');
    const daysAsMember = Math.floor((Date.now() - currentUser.createdAt) / (1000 * 60 * 60 * 24));

    const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
        <div className="rounded-lg bg-gray-200/50 dark:bg-gray-700/50 p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{value}</p>
        </div>
    );

    // --- HANDLERS ---
    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ ...currentUser, profilePicture: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUsernameUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameMessage({ type: '', text: '' });
        if (newUsername.trim() === '') {
            setUsernameMessage({ type: 'error', text: 'نام کاربری نمی‌تواند خالی باشد.' });
            return;
        }
        if (newUsername.trim() === currentUser.username) {
            setUsernameMessage({ type: 'info', text: 'نام کاربری تغییری نکرده است.' });
            return;
        }
        updateUser({ ...currentUser, username: newUsername.trim() });
        setUsernameMessage({ type: 'success', text: 'نام کاربری با موفقیت به‌روزرسانی شد.' });
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'لطفا تمام فیلدها را پر کنید.' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'رمز عبور جدید و تکرار آن مطابقت ندارند.' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === currentUser.email);

        if (userIndex === -1 || users[userIndex].password !== currentPassword) {
            setPasswordMessage({ type: 'error', text: 'رمز عبور فعلی نادرست است.' });
            return;
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        setPasswordMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleDeleteAccount = () => {
        deleteUser();
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <header className="mb-8">
                <Link to="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
                    <span>&rarr;</span>
                    <span>بازگشت به دوره‌ها</span>
                </Link>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">پنل کاربری</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">اطلاعات حساب کاربری خود را مدیریت کنید.</p>
            </header>

            <div className="space-y-8">
                {/* Profile Header & Stats */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group shrink-0">
                             {currentUser.profilePicture ? (
                                <img src={currentUser.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-300 dark:border-gray-600">
                                    {currentUser.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm">
                                تغییر عکس
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} accept="image/*" className="hidden" />
                        </div>
                        <div className="text-center sm:text-right">
                            <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                        <StatCard title="تعداد دوره‌ها" value={courses.length} />
                        <StatCard title="تعداد سرفصل‌ها" value={totalTopics} />
                        <StatCard title="عضو از" value={memberSince} />
                        <StatCard title="روزهای عضویت" value={daysAsMember} />
                    </div>
                </div>

                {/* Admin Panel Link */}
                {currentUser.isAdmin && (
                    <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-6 shadow-lg">
                         <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">پنل مدیریت</h3>
                        <p className="text-yellow-700/80 dark:text-yellow-300/80 mt-2 mb-4 text-sm">برای مدیریت کاربران، دوره‌ها و محتوای سایت به پنل مدیریت بروید.</p>
                        <div className="flex justify-end">
                            <Link to="/admin/users" className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:bg-yellow-400">
                                ورود به پنل مدیریت کاربران
                            </Link>
                        </div>
                    </div>
                )}

                {/* Update Username */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">تغییر نام کاربری</h3>
                    <form onSubmit={handleUsernameUpdate} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام کاربری جدید</label>
                            <input
                                id="username"
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition"
                            />
                        </div>
                        {usernameMessage.text && (
                            <p className={`text-sm ${usernameMessage.type === 'error' ? 'text-red-500' : usernameMessage.type === 'success' ? 'text-green-500' : 'text-gray-500'}`}>
                                {usernameMessage.text}
                            </p>
                        )}
                        <div className="flex justify-end">
                            <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">
                                ذخیره نام کاربری
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Update Password */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">تغییر رمز عبور</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label htmlFor="current-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور فعلی</label>
                            <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition" />
                        </div>
                        <div>
                            <label htmlFor="new-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور جدید</label>
                            <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition" />
                        </div>
                        <div>
                            <label htmlFor="confirm-new-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تکرار رمز عبور جدید</label>
                            <input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition" />
                        </div>
                        {passwordMessage.text && (
                            <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                {passwordMessage.text}
                            </p>
                        )}
                        <div className="flex justify-end">
                            <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">
                                تغییر رمز عبور
                            </button>
                        </div>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400">منطقه خطر</h3>
                    <p className="text-red-700/80 dark:text-red-300/80 mt-2 mb-4 text-sm">این عملیات غیرقابل بازگشت است. لطفاً با احتیاط عمل کنید.</p>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)} 
                            disabled={currentUser.isAdmin}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                            title={currentUser.isAdmin ? 'حساب ادمین قابل حذف نیست' : ''}
                        >
                            حذف حساب کاربری
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="حذف حساب کاربری"
                message="آیا از حذف حساب کاربری خود اطمینان کامل دارید؟ تمام اطلاعات شما، شامل دوره‌ها و سرفصل‌ها، برای همیشه حذف خواهد شد."
                confirmText="بله، حسابم را حذف کن"
                isDestructive
            />
        </>
    );
};

export default ProfilePage;