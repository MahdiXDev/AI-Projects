
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { useAppearance } from '../../contexts/AppearanceContext';
import type { User } from '../../types';
import { ArrowRightIcon } from '../../components/icons';

const AdminEditUserPage: React.FC = () => {
    const { userEmail } = useParams<{ userEmail: string }>();
    const navigate = useNavigate();
    const { getAllUsers, updateUserByEmail } = useContext(AuthContext);
    const { accentColor } = useAppearance();
    
    const [managedUser, setManagedUser] = useState<User | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (userEmail) {
            const user = getAllUsers().find(u => u.email === userEmail);
            if (user) {
                const { password, ...userData } = user;
                setManagedUser(userData);
                setNewUsername(userData.username);
            }
        }
    }, [userEmail, getAllUsers]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const handleUsernameUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (managedUser && newUsername.trim()) {
            updateUserByEmail(managedUser.email, { username: newUsername.trim() });
            showMessage('success', 'نام کاربری با موفقیت به‌روزرسانی شد.');
        }
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (managedUser && newPassword) {
            updateUserByEmail(managedUser.email, { password: newPassword });
            showMessage('success', 'رمز عبور با موفقیت برای کاربر تنظیم شد.');
            setNewPassword('');
        }
    };
    
    const inputClasses = `w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-${accentColor}-500 focus:ring-${accentColor}-500 transition`;
    const buttonClasses = `w-full rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`;

    if (!managedUser) {
        return <div className="text-center">کاربر یافت نشد.</div>;
    }

    return (
        <div>
            <header className="mb-8">
                <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-${accentColor}-600 dark:text-${accentColor}-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300 mb-4 transition-colors`}>
                    <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
                    <span>بازگشت به مدیریت کاربر</span>
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">ویرایش پروفایل کاربر: {managedUser.username}</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-lg font-semibold mb-4">تغییر نام کاربری</h3>
                    <form onSubmit={handleUsernameUpdate} className="space-y-4">
                         <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام کاربری جدید</label>
                            <input id="username" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={inputClasses}/>
                        </div>
                        <button type="submit" className={buttonClasses}>ذخیره نام کاربری</button>
                    </form>
                </div>
                 <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg">
                    <h3 className="text-lg font-semibold mb-4">تنظیم رمز عبور جدید</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                         <div>
                            <label htmlFor="new-pass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور جدید</label>
                            <input id="new-pass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} placeholder="برای کاربر یک رمز جدید وارد کنید"/>
                        </div>
                        <button type="submit" className={buttonClasses}>تنظیم رمز عبور</button>
                    </form>
                </div>
            </div>
            {statusMessage.text && (
                <p className={`mt-6 text-sm text-center p-2 rounded-md ${statusMessage.type === 'success' ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'}`}>{statusMessage.text}</p>
            )}
        </div>
    );
};

export default AdminEditUserPage;