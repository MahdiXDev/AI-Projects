import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import Modal from '../../components/Modal';

const AdminUsersListPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    // Form state for adding a new user
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loadUsers = useCallback(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const adminEmail = 'bagherimahdi1300@gmail.com';
        // Filter out the admin user from the list
        setUsers(storedUsers.filter((u: any) => u.email !== adminEmail));
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !username || !password) {
            setError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }
        if (password.length < 6) {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            return;
        }

        try {
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = storedUsers.find((u: any) => u.email === email);

            if (existingUser) {
                setError('این ایمیل قبلاً ثبت‌نام کرده است.');
                return;
            }

            const newUser = { 
                email, 
                username, 
                password,
                createdAt: Date.now(),
                profilePicture: null
            };
            storedUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(storedUsers));
            
            // Reset form and close modal
            setEmail('');
            setUsername('');
            setPassword('');
            setIsAddUserModalOpen(false);
            loadUsers(); // Reload the user list

        } catch (err) {
            setError('خطایی در فرآیند افزودن کاربر رخ داد.');
            console.error(err);
        }
    };
    
    const openAddUserModal = () => {
        setEmail('');
        setUsername('');
        setPassword('');
        setError('');
        setIsAddUserModalOpen(true);
    };

    return (
        <>
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">مدیریت کاربران</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">کاربران ثبت‌نام شده در سیستم را مشاهده و مدیریت کنید.</p>
                </div>
                 <button
                  onClick={openAddUserModal}
                  className="flex items-center justify-center gap-2 h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400 shrink-0 w-full md:w-auto"
              >
                  <span>+</span>
                  <span>افزودن کاربر</span>
              </button>
            </header>

            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 shadow-lg overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-200/50 dark:bg-gray-700/50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">نام کاربری</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hidden sm:table-cell">ایمیل</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">تاریخ عضویت</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.email} className={`border-t border-black/10 dark:border-white/10 ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-500/10'}`}>
                                <td className="p-4 font-medium">{user.username}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{user.email}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                    {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                                </td>
                                <td className="p-4">
                                    <Link to={`/admin/users/${user.email}`} className="rounded-md bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-300 transition-colors hover:bg-sky-500/30">
                                        مدیریت
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {users.length === 0 && (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        هیچ کاربری (به جز شما) یافت نشد.
                    </div>
                )}
            </div>
            
            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="افزودن کاربر جدید">
                <form onSubmit={handleAddUser} className="space-y-4">
                     <div>
                        <label htmlFor="email-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس ایمیل</label>
                        <input id="email-add" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition" />
                    </div>
                     <div>
                        <label htmlFor="username-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام کاربری</label>
                        <input id="username-add" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition" />
                    </div>
                     <div>
                        <label htmlFor="password-add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور</label>
                        <input id="password-add" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-sky-500 transition" />
                    </div>
                     {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400">
                            ایجاد کاربر
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminUsersListPage;
