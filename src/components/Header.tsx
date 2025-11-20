import { useState, useEffect } from 'react';
import { Menu, X, Brain, LogIn, LogOut, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const { user, signOut } = useAuth();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    if (user) {
      const fetchAvatar = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

          if (!error && data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      };
      fetchAvatar();
    }
  }, [user]);

  // Hide login button if on /login or /signup page
  const showLoginButton = !['/login', '/signup'].includes(location.pathname) && !user;

  // Helper function to determine link class based on active state
  const getLinkClass = (path) => {
    return `${
      location.pathname === path ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'
    } hover:text-purple-600 dark:hover:text-purple-400 transition-colors`;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Moodmuse</span>
          </Link>

          {/* Desktop Navigation */}
                  <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={getLinkClass('/')}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/analyze"
                  className={getLinkClass('/analyze')}
                >
                  Analyze Mood
                </Link>
                <Link
                  to="/journey"
                  className={getLinkClass('/journey')}
                >
                  Mood Journey
                </Link>
                <Link
                  to="/history"
                  className={getLinkClass('/history')}
                >
                  History
                </Link>
                <Link
                  to="/moodgarden"
                  className={getLinkClass('/moodgarden')}
                >
                  Mood Garden
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray stava300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-800" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/profile" className="flex items-center hover:scale-105 transition-transform">
                  <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent hover:border-purple-300 transition-colors">
                    <AvatarImage src={avatarUrl} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              showLoginButton && (
                <Link
                  to="/login"
                  className="hidden md:flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={getLinkClass('/')}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to="/analyze"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass('/analyze')}
                  >
                    Analyze Mood
                  </Link>
                  <Link
                    to="/journey"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass('/journey')}
                  >
                    Mood Journey
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass('/history')}
                  >
                    History
                  </Link>
                  <Link
                    to="/moodgarden"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass('/moodgarden')}
                  >
                    Mood Garden
                  </Link>
                  <div className="flex items-center space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={getLinkClass('/profile')}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span>Profile Settings</span>
                    </Link>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                showLoginButton && (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass('/login')}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;