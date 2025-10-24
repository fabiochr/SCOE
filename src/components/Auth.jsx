import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email for confirmation!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Successfully signed in!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Construction Business Management</h1>
          <p className="text-blue-100">Manage your construction projects</p>
        </div>

        <div className="bg-white rounded shadow-lg overflow-hidden">
          <div className="bg-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
          </div>

          <form onSubmit={handleAuth} className="p-6 space-y-4">
            {message.text && (
              <div className={`p-3 rounded text-sm ${
                message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage({ type: '', text: '' });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;