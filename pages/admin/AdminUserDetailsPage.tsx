import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User, Course } from '../../types';
import { ConfirmModal } from '../../components/Modal';
import { AuthContext } from '../../App';

interface StoredUser extends User {
    password?: string;
}

const AdminUserDetailsPage: React.FC = () => {
    const { email } = useParams<{ email: string }>();
    const navigate = useNavigate();
    const { user: adminUser } = useContext(AuthContext);
    const [user, setUser] = useState<StoredUser | null>(null);
    const [userCourses, setUserCourses] = useState<Course[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (email) {
            const decodedEmail = decodeURIComponent(email);
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const foundUser = storedUsers.find((u: StoredUser) => u.email === decodedEmail);
            setUser(foundUser || null);

            const savedCourses = localStorage.getItem(`courses_${decodedEmail}`);
            if (savedCourses) {
                setUserCourses(JSON.parse(savedCourses));
            }
        }
    }, [email]);

    const handleDeleteUser = () => {
        if (user) {
            // Prevent admin from deleting themselves
            if (adminUser?.email === user.email) {
                alert("شما نمی‌توانید حساب کاربری خودتان را حذف کنید.");
                return;
            }
            setIsConfirmModalOpen(true);
        }
    };
    
    const confirmDeleteUser = () => {
        if (user) {
            // Remove user from 'users' list
            const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = storedUsers.filter(u => u.email !== user.email);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Remove user's courses
            localStorage.removeItem(`courses_${user.email}`);
            
            setIsConfirmModalOpen(false);
            navigate('/admin/users');
        }
    };

    if (!user) {
        return <div className="text-center text-red-400">کاربر یافت نشد.</div>;
    }

    return (
        <>
            <div>
                 <header className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
                        <span>&rarr;</span>
                        <span>بازگشت به لیست کاربران</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                         <div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">جزئیات کاربر</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">مشاهده اطلاعات و دوره‌های کاربر {user.username}.</p>
                        </div>
                        <button
                            onClick={handleDeleteUser}
                            disabled={adminUser?.email === user.email}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500 disabled:bg-gray-400 disabled:shadow-none"
                        >
                            <span>🗑️</span>
                            <span>حذف کاربر</span>
                        </button>
                    </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Info */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg">
                             <div className="flex flex-col items-center text-center">
                                <img
                                    src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
                                    alt={user.username}
                                    className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                                />
                                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                    عضو از: {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                                </p>
                             </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {/* Courses List */}
                         <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-lg">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">دوره‌های کاربر ({userCourses.length})</h3>
                             {userCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {userCourses.map(course => (
                                        <div key={course.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{course.name}</p>
                                            <p className="text-xs text-gray-500">{course.topics.length} سرفصل</p>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">این کاربر هنوز هیچ دوره‌ای ایجاد نکرده است.</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>
             <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDeleteUser}
                title="حذف کاربر"
                message={`آیا از حذف کاربر "${user.username}" اطمینان دارید؟ تمام دوره‌های این کاربر نیز حذف خواهند شد. این عمل غیرقابل بازگشت است.`}
                confirmText="بله، حذف کن"
            />
        </>
    );
};

export default AdminUserDetailsPage;
