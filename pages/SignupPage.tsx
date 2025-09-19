import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { EyeIcon, EyeOffIcon } from '../components/icons';

const SignupPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { addUser, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }

        if (password !== confirmPassword) {
            setError('رمزهای عبور با هم مطابقت ندارند.');
            return;
        }

        const success = addUser({
            username,
            email,
            password,
            createdAt: Date.now(),
            profilePicture: null,
        });

        if (success) {
            login({ email, password });
            navigate('/');
        } else {
            setError('کاربری با این ایمیل قبلاً ثبت‌نام کرده است.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 dark:bg-gray-900 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="w-full max-w-md p-8 space-y-8 rounded-xl border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-800/50 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">ایجاد حساب کاربری</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        یا{' '}
                        <Link to="/login" className="font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300">
                            وارد حساب کاربری خود شوید
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                           <label htmlFor="username" className="sr-only">نام کاربری</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none rounded-t-lg relative block w-full px-3 py-2 border border-gray-400 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="نام کاربری"
                            />
                        </div>
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
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-400 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="آدرس ایمیل"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password"className="sr-only">رمز عبور</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-400 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="رمز عبور"
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-300"
                                aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                            >
                                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                         <div>
                            <label htmlFor="confirm-password"className="sr-only">تکرار رمز عبور</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none rounded-b-lg relative block w-full px-3 py-2 border border-gray-400 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="تکرار رمز عبور"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 transition-colors"
                        >
                            ثبت نام
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;