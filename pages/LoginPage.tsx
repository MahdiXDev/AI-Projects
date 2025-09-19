import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import type { User } from '../types';
import { EyeIcon, EyeOffIcon } from '../components/icons';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('لطفاً ایمیل و رمز عبور را وارد کنید.');
            return;
        }

        try {
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = storedUsers.find((u: any) => u.email === email && u.password === password);

            if (user) {
                const userData: User = { 
                    email: user.email,
                    username: user.username || user.email.split('@')[0] // Fallback for old users
                };
                login(userData);
                // Redirect them to the page they were trying to visit or to the homepage.
                navigate(from, { replace: true });
            } else {
                setError('ایمیل یا رمز عبور نامعتبر است.');
            }
        // Fix: Corrected a syntax error in the catch block. The stray underscore was removed.
        } catch (err) {
            setError('خطایی در فرآیند ورود رخ داد.');
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="w-full max-w-md p-8 space-y-8 rounded-xl border border-white/20 bg-gray-800/50 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-bold text-center text-white">ورود به حساب کاربری</h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        یا{' '}
                        <Link to="/signup" className="font-medium text-sky-400 hover:text-sky-300">
                            یک حساب جدید بسازید
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">آدرس ایمیل</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-t-lg relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="آدرس ایمیل"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password"className="sr-only">رمز عبور</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-b-lg relative block w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="رمز عبور"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-400 hover:text-white"
                                aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                            >
                                {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 transition-colors"
                        >
                            ورود
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;