import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, Heart, Sparkles, Star, Zap, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login"; // detect mode from route

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : "An error occurred during authentication."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center py-12 px-4 relative overflow-hidden transition-colors">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-300/40 to-pink-300/40 dark:from-purple-500/20 dark:to-pink-500/20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-gradient-to-r from-blue-300/40 to-cyan-300/40 dark:from-blue-500/20 dark:to-cyan-500/20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-indigo-300/40 to-purple-300/40 dark:from-indigo-500/20 dark:to-purple-500/20 animate-float" style={{ animationDelay: '4s' }}></div>

        {/* Floating Icons */}
        <Heart className="absolute top-32 left-32 h-8 w-8 text-pink-300 dark:text-pink-400 animate-sparkle" />
        <Sparkles className="absolute top-60 right-40 h-6 w-6 text-purple-300 dark:text-purple-400 animate-sparkle" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-40 right-32 h-7 w-7 text-yellow-300 dark:text-yellow-400 animate-sparkle" style={{ animationDelay: '2s' }} />
        <Zap className="absolute bottom-60 left-40 h-6 w-6 text-blue-300 dark:text-blue-400 animate-sparkle" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Auth Card */}
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 dark:border-white/20 animate-fade-in transition-colors">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="relative mb-6">
              <div className="relative inline-flex p-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 rounded-full shadow-xl">
                <Brain className="h-10 w-10 text-white dark:text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3 transition-colors">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 animate-gradient-shift">
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors">
              {isLogin ? 'Sign in to continue your mood journey ✨' : 'Create your account to start tracking your mood ✨'}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-colors transition-border bg-white/70 dark:bg-white/10 backdrop-blur-sm text-lg text-gray-700 dark:text-white hover:border-purple-300 dark:hover:border-purple-400"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-colors transition-border bg-white/70 dark:bg-white/10 backdrop-blur-sm text-lg text-gray-700 dark:text-white hover:border-purple-300 dark:hover:border-purple-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 border-2 border-gray-300 dark:border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-colors transition-border bg-white/70 dark:bg-white/10 backdrop-blur-sm text-lg text-gray-700 dark:text-white hover:border-purple-300 dark:hover:border-purple-400"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white py-4 rounded-2xl font-bold text-lg transition-colors transition-transform hover:from-purple-700 dark:hover:from-purple-600 hover:to-pink-700 dark:hover:to-pink-600 shadow-xl hover:shadow-2xl hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In ✨' : 'Create Account ✨')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              {isLogin ? (
                <Link
                  to="/signup"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold hover:underline transition-colors"
                >
                  Sign up
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold hover:underline transition-colors"
                >
                  Sign in
                </Link>
              )}
            </p>
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
