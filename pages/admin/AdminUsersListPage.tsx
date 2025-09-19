import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { AuthContext } from '../../App';
import Modal from '../../components/Modal';
import { PlusIcon, ArrowRightIcon } from '../../components/icons';

interface StoredUser extends User {
    password?: string;
}

const AdminUsersListPage: React.FC = () => {
    const { user: adminUser, getAllUsers, addUser } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state for adding a new user
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const users = getAllUsers().filter(u => u.email !== adminUser?.email); // Exclude admin from list

    const openAddUserModal = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setError('');
        setIsModalOpen(true);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !email || !password) {
            setError("تمام فیلدها الزامی هستند.");
            return;
        }

        const success = addUser({
            username,
            email,
            password,
            createdAt: Date.now(),
            profilePicture: null
        });

        if (success) {
            setIsModalOpen(false);
            // The user list will re-render automatically because getAllUsers() gets fresh data
        } else {
            setError("کاربری با این ایمیل از قبل وجود دارد.");
        }
    };
    
    const inputClasses = "w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition";
    const primaryButtonClasses = "flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400";


    return (
        <div>
            <Link to="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-4 transition-colors">
                <ArrowRightIcon className="w-5 h-5 transform scale-x-[-1]" />
                <span>بازگشت به دوره‌های من</span>
            </Link>
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">مدیریت کاربران</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">فهرست تمام کاربران ثبت‌شده در سیستم.</p>
                </div>
                <button onClick={openAddUserModal} className={`${primaryButtonClasses} self-start md:self-center`}>
                   <PlusIcon className="w-5 h-5" />
                   <span>افزودن کاربر</span>
                </button>
            </header>

            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 shadow-lg backdrop-blur-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400 rtl:text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-black/5 dark:bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-3">نام کاربری</th>
                                <th scope="col" className="px-6 py-3">ایمیل</th>
                                <th scope="col" className="px-6 py-3">تاریخ عضویت</th>
                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">مدیریت</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.email} className="border-b dark:border-gray-700 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
                                            {user.username}
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                                    <td className="px-6 py-4 text-left">
                                        <Link to={`/admin/users/${encodeURIComponent(user.email)}`} className="font-medium text-sky-600 dark:text-sky-500 hover:underline">
                                            مدیریت
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="افزودن کاربر جدید">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام کاربری</label>
                        <input id="new-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="new-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
                        <input id="new-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور</label>
                        <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} />
                    </div>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">ایجاد کاربر</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminUsersListPage;