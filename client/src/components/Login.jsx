import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Renders the login page for email/password and Google authentication
export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/user/auth/login', formData, {
        withCredentials: true
      });
      toast.success('Login successful!');
      navigate(`/login/success?user=${encodeURIComponent(JSON.stringify(res.data))}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full mx-4 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto rounded-full w-20 h-20 flex items-center justify-center">
            <img src='/logo.png' className="w-20 rounded-lg" alt="Logo" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="youmail@gamil.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>



        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}