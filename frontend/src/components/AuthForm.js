import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

const AuthForm = ({ isLogin = true }) => {
  const navigate = useNavigate();
  const { signup, login, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      navigate('/chat');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    clearError();
    navigate(isLogin ? '/signup' : '/login');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="mb-4 text-center">
          <h1 className="text-2xl text-slate-100 font-semibold">Ruhi AI</h1>
          <p className="text-sm text-slate-400">{isLogin ? 'Welcome Back' : 'Get Started'}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-800 text-red-200 p-2 rounded-md mb-3">
            <FiAlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Full Name</label>
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-md">
                <FiUser size={18} className="text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="flex-1 bg-transparent outline-none text-slate-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1">Email Address</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-md">
              <FiMail size={18} className="text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-md">
              <FiLock size={18} className="text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={toggleForm} className="ml-2 text-blue-400">{isLogin ? 'Sign Up' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
