import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';

interface StoredUser extends User {
    password?: string;
}

const AdminUsersListPage: React.FC = () => {
    const [users, setUsers] = useState<StoredUser[]>([]);

    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(storedUsers);
    }, []);

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">مدیریت کاربران</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">فهرست تمام کاربران ثبت‌شده در سیستم.</p>
            </header>

            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/40 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400 rtl:text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">نام کاربری</th>
                                <th scope="col" className="px-6 py-3">ایمیل</th>
                                <th scope="col" className="px-6 py-3">تاریخ عضویت</th>
                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">مشاهده</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.email} className="bg-white dark:bg-gray-800/80 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
                                                alt={user.username}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                            {user.username}
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <Link to={`/admin/users/${encodeURIComponent(user.email)}`} className="font-medium text-sky-600 dark:text-sky-500 hover:underline">
                                            مشاهده جزئیات
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersListPage;
