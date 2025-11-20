import { Link } from 'react-router-dom';
import { Brain, Calendar, BarChart3, Heart, Zap, Sun, Sparkles, Star, Moon, Rainbow, Flower2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import EmotionalChatbot from '@/components/EmotionalChatbot'; 

const Home = () => {
  const { user } = useAuth();
  const [showChatbot, setShowChatbot] = useState(false);
  const features = [
    {
      icon: Brain,
      title: "Analyze My Mood",
      description: "Get instant insights into your current emotional state with our advanced mood analysis powered by AI magic.",
      link: "/analyze",
      gradient: "from-purple-400 via-pink-500 to-red-500",
      iconBg: "bg-gradient-to-r from-purple-100 to-pink-100",
      iconColor: "text-purple-600 dark:text-purple-300",
      hoverGradient: "from-purple-500 via-pink-600 to-red-600"
    },
    {
      icon: Calendar,
      title: "Mood Journey",
      description: "Track your daily emotions, weather conditions, sleep patterns, and receive personalized support on your wellness adventure.",
      link: "/journey",
      gradient: "from-blue-400 via-cyan-500 to-teal-500",
      iconBg: "bg-gradient-to-r from-blue-100 to-cyan-100",
      iconColor: "text-blue-600 dark:text-blue-300",
      hoverGradient: "from-blue-500 via-cyan-600 to-teal-600"
    },
    {
      icon: BarChart3,
      title: "Mood History",
      description: "Visualize your emotional patterns and track your progress over time with beautiful, detailed graphs and insights.",
      link: "/history",
      gradient: "from-green-400 via-emerald-500 to-teal-500",
      iconBg: "bg-gradient-to-r from-green-100 to-emerald-100",
      iconColor: "text-green-600 dark:text-green-300",
      hoverGradient: "from-green-500 via-emerald-600 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      {/* Fortune Link with Popup - Only for authenticated users */}
      {user && (
        <Link
          to="/fortune"
          className="fixed bottom-6 left-6 z-50"
        >
          <div className="relative group">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-600 animate-bounce">
              <Sparkles className="h-7 w-7 text-white dark:text-white animate-pulse" />
            </div>
            <div className="absolute left-20 bottom-2 bg-white dark:bg-gray-800 text-sm font-semibold text-purple-600 dark:text-gray-200 px-4 py-2 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fade-in">
              Discover your mystical fortune! ✨
            </div>
          </div>
        </Link>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-300/30 to-cyan-300/30 animate-float blur-lg" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-green-300/30 to-emerald-300/30 animate-float blur-xl" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-yellow-300/40 to-orange-300/40 animate-float blur-lg" style={{ animationDelay: '1s' }}></div>

        <Sparkles className="absolute top-32 right-1/4 h-8 w-8 text-yellow-400 animate-sparkle drop-shadow-lg dark:text-yellow-300" />
        <Star className="absolute top-64 left-1/3 h-6 w-6 text-pink-400 animate-sparkle drop-shadow-lg dark:text-pink-300" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-40 right-1/3 h-7 w-7 text-red-400 animate-sparkle drop-shadow-lg dark:text-red-300" style={{ animationDelay: '3s' }} />
        <Moon className="absolute top-80 left-20 h-8 w-8 text-indigo-400 animate-sparkle drop-shadow-lg dark:text-indigo-300" style={{ animationDelay: '2.5s' }} />
        <Rainbow className="absolute bottom-60 right-20 h-6 w-6 text-purple-400 animate-sparkle drop-shadow-lg dark:text-purple-300" style={{ animationDelay: '4s' }} />
        <Flower2 className="absolute top-96 right-1/4 h-7 w-7 text-pink-500 animate-float drop-shadow-lg dark:text-pink-300" style={{ animationDelay: '1.5s' }} />
        <Flower2 className="absolute bottom-32 left-1/3 h-6 w-6 text-emerald-400 animate-sparkle drop-shadow-lg dark:text-emerald-300" style={{ animationDelay: '3.5s' }} />

        <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-yellow-300 rounded-full animate-bounce opacity-60 dark:bg-yellow-400" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-pink-300 rounded-full animate-bounce opacity-70 dark:bg-pink-400" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-3/4 left-1/4 w-5 h-5 bg-blue-300 rounded-full animate-bounce opacity-50 dark:bg-blue-400" style={{ animationDelay: '2.1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          {/* Magical Brain Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full blur-2xl opacity-60 animate-glow group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-md opacity-30 animate-float"></div>
              
              <div className="relative p-8 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/80 group-hover:scale-110 transition-transform duration-500 animate-float">
  <Brain className="h-20 w-20 text-purple-600 animate-pulse" />

  <div className="absolute inset-0 rounded-full">
    <div className="absolute top-1/4 left-1/4 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-transparent animate-pulse opacity-70"></div>
    <div className="absolute top-3/4 right-1/4 w-8 h-0.5 bg-gradient-to-l from-pink-400 to-transparent animate-pulse opacity-70" style={{ animationDelay: '0.5s' }}></div>
    <div className="absolute bottom-1/3 left-1/3 w-5 h-0.5 bg-gradient-to-r from-blue-400 to-transparent animate-pulse opacity-70" style={{ animationDelay: '1s' }}></div>
  </div>
</div>
              
              <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-400 animate-sparkle" />
              <Star className="absolute -bottom-4 -left-4 h-6 w-6 text-pink-400 animate-sparkle" style={{animationDelay: '1s'}} />
              <Heart className="absolute top-1/2 -right-6 h-5 w-5 text-red-400 animate-sparkle" style={{animationDelay: '0.5s'}} />
              <Sparkles className="absolute bottom-1/4 -left-6 h-6 w-6 text-cyan-400 animate-sparkle" style={{animationDelay: '1.5s'}} />
              
              <div className="absolute -top-8 left-1/2 w-3 h-3 bg-purple-300 rounded-full animate-bounce opacity-60" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute -top-12 left-1/2 w-2 h-2 bg-pink-300 rounded-full animate-bounce opacity-70" style={{animationDelay: '0.4s'}}></div>
              <div className="absolute -top-16 left-1/2 w-1 h-1 bg-blue-300 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.6s'}}></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            Understand Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-300 dark:to-indigo-400 animate-gradient drop-shadow-lg">
              Beautiful Mind
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
            Discover the magic in your emotions, track your wellness journey, and receive
            personalized insights 
            to nurture your mental health with our AI-powered companion ✨
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            {user ? (
              <>
                <Link 
                  to="/analyze"
                  className="group relative px-6 py-3 
                  bg-gradient-to-r from-purple-300 to-pink-300 
                  dark:from-purple-600 dark:to-pink-600 
                  hover:from-purple-400 hover:to-pink-400 
                  dark:hover:from-purple-700 dark:hover:to-pink-700 
                  text-gray-800 dark:text-white 
                  font-semibold text-lg rounded-xl 
                  transition-all duration-300 animate-journey-pulse shadow-md hover:shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Brain className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    Analyze Mood
                    <Sparkles className="ml-2 h-5 w-5 group-hover:animate-spin" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                </Link>
                <Link 
                  to="/journey"
                  className="group relative px-6 py-3 
                  bg-gradient-to-r from-purple-300 to-pink-300 
                  dark:from-purple-600 dark:to-pink-600 
                  hover:from-purple-400 hover:to-pink-400 
                  dark:hover:from-purple-700 dark:hover:to-pink-700 
                  text-gray-800 dark:text-white 
                  font-semibold text-lg rounded-xl 
                  transition-all duration-300 animate-journey-pulse shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center justify-center">
                    <Calendar className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    Start Your Journey
                    <Star className="ml-2 h-5 w-5 group-hover:animate-spin" />
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/signup"
                  className="group relative px-6 py-3 
                          bg-gradient-to-r from-purple-300 to-pink-300 
                          dark:from-purple-600 dark:to-pink-600 
                          hover:from-purple-400 hover:to-pink-400 
                          dark:hover:from-purple-700 dark:hover:to-pink-700 
                          text-gray-800 dark:text-white 
                          font-semibold text-lg rounded-xl 
                          transition-all duration-300 animate-journey-pulse shadow-md hover:shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Sparkles className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    Register
                    <Heart className="ml-2 h-5 w-5 group-hover:animate-spin" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                </Link>
                <Link 
                  to="/login"
                  state={{ isLogin: true }}
                  className="group relative px-6 py-3 
                    bg-gradient-to-r from-purple-300 to-pink-300 
                    dark:from-purple-600 dark:to-pink-600 
                    hover:from-purple-400 hover:to-pink-400 
                    dark:hover:from-purple-700 dark:hover:to-pink-700 
                    text-gray-800 dark:text-white 
                    font-semibold text-lg rounded-xl 
                    transition-all duration-300 animate-journey-pulse shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center justify-center">
                    <Calendar className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    Login
                    <Star className="ml-2 h-5 w-5 group-hover:animate-spin" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-8 tracking-tight">Choose Your Path</h2>
          <p className="text-gray-700 dark:text-gray-200 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            {user 
              ? "Select how you'd like to explore your emotional well-being with our magical, intuitive tools"
              : "Sign in to unlock the full power of our mood tracking and analysis tools"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-8xl mx-auto">
          {features.map((feature, index) => (
            user ? (
              <Link 
                key={index}
                to={feature.link}
                className="group animate-fade-in transform hover:scale-105 transition-all duration-500"
                style={{animationDelay: `${index * 0.3}s`}}
              >
                <div className="relative p-10 bg-white/50 dark:bg-white/20 backdrop-blur-lg rounded-4xl shadow-2xl border-2 border-white/60 dark:border-purple-800/50 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:border-purple-300/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-700 dark:from-purple-900/30 dark:to-pink-900/30`}></div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl dark:from-purple-900/20 dark:to-pink-900/20`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-8 rounded-4xl ${feature.iconBg} mb-10 group-hover:scale-125 transition-transform duration-500 shadow-xl group-hover:shadow-2xl border-2 border-white/50 dark:from-purple-900/40 dark:to-pink-900/40`}>
                      <feature.icon className={`h-12 w-12 ${feature.iconColor} group-hover:animate-pulse`} />
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 group-hover:text-purple-700 transition-colors duration-300 dark:group-hover:text-purple-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-8 text-base font-medium">
                      {feature.description}
                    </p>
                    
                    <div className="inline-flex items-center text-purple-600 dark:text-purple-300 font-bold text-lg group-hover:text-purple-700 group-hover:scale-105 transition-all duration-300">
                      <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                      Get Started
                      <svg className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                key={index}
                className="group animate-fade-in transform hover:scale-105 transition-all duration-500 cursor-not-allowed opacity-75"
                style={{animationDelay: `${index * 0.3}s`}}
              >
                <div className="relative p-10 bg-white/50 dark:bg-white/20 backdrop-blur-lg rounded-4xl shadow-2xl border-2 border-white/60 dark:border-purple-800/50 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:border-purple-300/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-700 dark:from-purple-900/30 dark:to-pink-900/30`}></div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl dark:from-purple-900/20 dark:to-pink-900/20`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-8 rounded-4xl ${feature.iconBg} mb-10 group-hover:scale-125 transition-transform duration-500 shadow-xl group-hover:shadow-2xl border-2 border-white/50 dark:from-purple-900/40 dark:to-pink-900/40`}>
                      <feature.icon className={`h-12 w-12 ${feature.iconColor} group-hover:animate-pulse`} />
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 group-hover:text-purple-700 transition-colors duration-300 dark:group-hover:text-purple-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-8 text-base font-medium">
                      {feature.description}
                    </p>
                    
                    <div className="inline-flex items-center text-purple-600 dark:text-purple-300 font-bold text-lg group-hover:text-purple-700 group-hover:scale-105 transition-all duration-300">
                      <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                      Get Started
                      <svg className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className=" ">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-8 tracking-tight">Why Track Your Mood?</h2>
            <p className="text-gray-700 dark:text-gray-100 text-xl max-w-3xl mx-auto font-medium leading-relaxed">Understanding your emotions leads to better mental health and a more fulfilling, joyful life ✨</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <div className="text-center animate-fade-in transform hover:scale-105 transition-all duration-500 p-10 bg-white/50 dark:bg-white/20 backdrop-blur-sm rounded-4xl shadow-xl border-2 border-white/60 dark:border-purple-900/40 hover:shadow-2xl group" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex p-8 bg-gradient-to-r from-red-100 via-pink-100 to-rose-100 text-red-600 rounded-full mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 border-2 border-pink-200/50 dark:from-purple-900/30 dark:to-pink-900/30">
                <Heart className="h-12 w-12 group-hover:animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 group-hover:text-red-600 transition-colors dark:group-hover:text-red-400">Better Self-Awareness</h3>
              <p className="text-gray-600 dark:text-gray-100 text-base leading-relaxed font-medium">Recognize patterns and triggers in your emotional responses with detailed, loving insights that help you grow</p>
            </div>

            <div className="text-center animate-fade-in transform hover:scale-105 transition-all duration-500 p-10 bg-white/50 dark:bg-white/20 backdrop-blur-sm rounded-4xl shadow-xl border-2 border-white/60 dark:border-purple-900/40 hover:shadow-2xl group" style={{animationDelay: '0.3s'}}>
              <div className="inline-flex p-8 bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 text-yellow-600 rounded-full mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 border-2 border-yellow-200/50 dark:from-purple-900/30 dark:to-pink-900/30">
                <Zap className="h-12 w-12 group-hover:animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 group-hover:text-yellow-600 transition-colors dark:group-hover:text-yellow-400">Improved Well-being</h3>
              <p className="text-gray-600 dark:text-gray-100 text-base leading-relaxed font-medium">Make informed, positive decisions about your mental health and lifestyle choices with confidence and joy</p>
            </div>

            <div className="text-center animate-fade-in transform hover:scale-105 transition-all duration-500 p-10 bg-white/50 dark:bg-white/20 backdrop-blur-sm rounded-4xl shadow-xl border-2 border-white/60 dark:border-purple-900/40 hover:shadow-2xl group" style={{animationDelay: '0.5s'}}>
              <div className="inline-flex p-8 bg-gradient-to-r from-orange-100 via-yellow-100 to-lime-100 text-orange-600 rounded-full mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 border-2 border-orange-200/50 dark:from-purple-900/30 dark:to-pink-900/30">
                <Sun className="h-12 w-12 group-hover:animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 group-hover:text-orange-600 transition-colors dark:group-hover:text-orange-400">Positive Growth</h3>
              <p className="text-gray-600 dark:text-gray-100 text-base leading-relaxed font-medium">Track your beautiful progress and celebrate your emotional development journey with pride and happiness</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Bubble - Only for authenticated users */}
      {user && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative group">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-600 animate-bounce">
              <Heart className="h-7 w-7 text-white dark:text-white animate-pulse" />
            </div>
            <div className="absolute right-20 bottom-2 bg-white dark:bg-gray-800 text-sm font-semibold text-purple-600 dark:text-gray-200 px-4 py-2 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fade-in">
              Chat for support 💬
            </div>
          </div>
        </button>
      )}

      {/* Modal mount */}
      {user && showChatbot && (
        <EmotionalChatbot onClose={() => setShowChatbot(false)} />
      )}
    </div>
  );
};

export default Home;