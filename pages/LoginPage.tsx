
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { useAppearance } from '../contexts/AppearanceContext';
import { EyeIcon, EyeOffIcon } from '../components/icons';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const { accentColor, backgroundClass } = useAppearance();
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

        const success = login({ email, password });
        
        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('ایمیل یا رمز عبور نامعتبر است.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
            <div className={`absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-950 ${backgroundClass}`}></div>
            <div className="w-full max-w-md p-8 space-y-8 rounded-xl border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-800/50 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white">ورود به حساب کاربری</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        یا{' '}
                        <Link to="/signup" className={`font-medium text-${accentColor}-600 dark:text-${accentColor}-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300`}>
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
                                className={`appearance-none rounded-t-lg relative block w-full px-3 py-2 border border-gray-400 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-${accentColor}-500 focus:border-${accentColor}-500 focus:z-10 sm:text-sm`}
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
                                className={`appearance-none rounded-b-lg relative block w-full pl-10 pr-3 py-2 border border-gray-400 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-${accentColor}-500 focus:border-${accentColor}-500 focus:z-10 sm:text-sm`}
                                placeholder="رمز عبور"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-${accentColor}-500 dark:hover:text-${accentColor}-300`}
                                aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                            >
                                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-${accentColor}-600 hover:bg-${accentColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-${accentColor}-500 transition-colors`}
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