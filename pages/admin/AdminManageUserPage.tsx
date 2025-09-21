
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { User } from '../../types';
import { AuthContext, CourseContext } from '../../App';
import { useAppearance } from '../../contexts/AppearanceContext';
import { ConfirmModal } from '../../components/Modal';
import { ArrowRightIcon } from '../../components/icons';

const AdminManageUserPage: React.FC = () => {
    const { userEmail } = useParams<{ userEmail: string }>();
    const navigate = useNavigate();
    const { getAllUsers, deleteUserByEmail } = useContext(AuthContext);
    const { dispatch: dispatchCourseAction } = useContext(CourseContext);
    const { accentColor } = useAppearance();
    const [managedUser, setManagedUser] = useState<User | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (userEmail) {
            const user = getAllUsers().find(u => u.email === userEmail);
            if (user) {
                const { password, ...userData } = user;
                setManagedUser(userData);
            }
        }
    }, [userEmail, getAllUsers]);

    const handleDelete = () => {
        if (managedUser) {
            // First, dispatch action to delete user's courses
            dispatchCourseAction({ type: 'DELETE_COURSES_BY_USER', payload: { userEmail: managedUser.email } });
            // Then, delete the user
            deleteUserByEmail(managedUser.email);
            navigate('/admin/users');
        }
        setIsConfirmModalOpen(false);
    };

    if (!managedUser) {
        return <div className="text-center">کاربر یافت نشد.</div>;
    }

    const buttonClasses = "w-full text-center rounded-lg bg-gray-300 dark:bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-white transition-colors duration-300 hover:bg-gray-400 dark:hover:bg-gray-500";
    const primaryButtonClasses = `w-full text-center rounded-lg bg-${accentColor}-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-${accentColor}-500/30 transition-all duration-300 hover:bg-${accentColor}-400`;
    const destructiveButtonClasses = "w-full text-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500";


    return (
        <>
            <header className="mb-8">
                <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-${accentColor}-600 dark:text-${accentColor}-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300 mb-4 transition-colors`}>
                    <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
                    <span>بازگشت به لیست کاربران</span>
                </button>
                <div className="flex items-center gap-4">
                    <img src={managedUser.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${managedUser.username}`} alt={managedUser.username} className="h-16 w-16 rounded-full object-cover" />
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{managedUser.username}</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">{managedUser.email}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Manage Profile */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg flex flex-col">
                    <h2 className="text-xl font-bold mb-2">مدیریت پروفایل</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">تغییر نام کاربری و رمز عبور کاربر.</p>
                    <Link to={`/admin/users/${encodeURIComponent(managedUser.email)}/profile`} className={`mt-4 ${buttonClasses}`}>
                        ویرایش پروفایل
                    </Link>
                </div>

                {/* Manage Courses */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 p-6 shadow-lg backdrop-blur-lg flex flex-col">
                    <h2 className="text-xl font-bold mb-2">مدیریت دوره‌ها</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">مشاهده، ویرایش و حذف دوره‌ها و سرفصل‌های کاربر.</p>
                    <Link to={`/admin/users/${encodeURIComponent(managedUser.email)}/courses`} className={`mt-4 ${primaryButtonClasses}`}>
                        مشاهده دوره‌ها
                    </Link>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-red-500/50 dark:border-red-400/50 bg-red-500/10 p-6 shadow-lg backdrop-blur-lg flex flex-col">
                    <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">منطقه خطر</h2>
                    <p className="text-sm text-red-700 dark:text-red-400 flex-grow">حذف کامل حساب کاربری و تمام اطلاعات مرتبط با آن.</p>
                    <button onClick={() => setIsConfirmModalOpen(true)} className={`mt-4 ${destructiveButtonClasses}`}>
                        حذف کاربر
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="حذف کاربر"
                message={`آیا از حذف کاربر "${managedUser.username}" اطمینان دارید؟ تمام دوره‌های این کاربر نیز حذف خواهند شد. این عمل غیرقابل بازگشت است.`}
                confirmText="بله، حذف کن"
                isDestructive
            />
        </>
    );
};

export default AdminManageUserPage;