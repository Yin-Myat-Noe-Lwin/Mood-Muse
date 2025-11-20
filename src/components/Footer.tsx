import { Brain, Heart, Star } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold">Mood Analyzer</span>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-4">
              Understanding your emotions, supporting your mental wellness journey.
              Track, analyze, and improve your mood with personalized insights.
            </p>
            <div className="flex items-center space-x-4">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-400 dark:text-gray-500">Made with care for your well-being</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Home</a></li>
              <li><a href="/analyze" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Analyze Mood</a></li>
              <li><a href="/journey" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Mood Journey</a></li>
              <li><a href="/history" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">History</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/Support" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Help Center</a></li>
              <li><a href="/Support" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Privacy Policy</a></li>
              <li><a href="/Support" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Terms of Service</a></li>
              <li><a href="/Support" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-200 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © 2024 Mood Analyzer. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400 dark:text-gray-500">Your mental health matters</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
