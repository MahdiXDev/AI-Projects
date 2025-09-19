import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [statusMessage, setStatusMessage] = useState('');

    if (!user) {
        // This case should ideally not be reached due to ProtectedRoute, but as a fallback:
        return <div className="text-center">در حال بارگذاری پروفایل...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser({ profilePicture: base64String });
                setStatusMessage('تصویر پروفایل با موفقیت به‌روزرسانی شد.');
                setTimeout(() => setStatusMessage(''), 3000);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">پروفایل کاربری</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">اطلاعات حساب کاربری خود را مشاهده و مدیریت کنید.</p>
            </header>

            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <img
                            src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
                            alt={user.username}
                            className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                        />
                        <button 
                            onClick={triggerFileSelect}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            aria-label="Change profile picture"
                        >
                            <span className="text-white text-3xl">✏️</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePictureChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>

                <div className="border-t border-black/10 dark:border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-2">اطلاعات حساب</h3>
                    <div className="text-sm space-y-2">
                        <p><span className="font-medium text-gray-600 dark:text-gray-300">نام کاربری:</span> {user.username}</p>
                        <p><span className="font-medium text-gray-600 dark:text-gray-300">ایمیل:</span> {user.email}</p>
                        <p><span className="font-medium text-gray-600 dark:text-gray-300">تاریخ عضویت:</span> {new Date(user.createdAt).toLocaleDateString('fa-IR')}</p>
                    </div>
                </div>
                
                {statusMessage && <p className="text-green-600 dark:text-green-400 text-sm">{statusMessage}</p>}

                <div className="border-t border-black/10 dark:border-white/10 pt-6 flex justify-end">
                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500"
                    >
                        خروج از حساب
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
