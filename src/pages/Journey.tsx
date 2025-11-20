import { useState, useEffect } from 'react';
import {  Calendar,
  Cloud,
  Bed,
  Star,
  Heart,
  Sparkles,
  Sun,
  Moon,
  Users,
  Laugh,
  Smile,
  Meh,
  Frown,
  
  User,
  Briefcase,
  Home,
  CloudRain,
  Snowflake,
  CloudLightning } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';  // Adjust to your toast
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const Journey = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [journeyData, setJourneyData] = useState({
    mood: '',
    partner: '',
    weather: '',
    sleep: '',
    dayQuality: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  

   const partnerOptions = [
  { value: 'alone', label: 'Alone', icon: <User className="w-6 h-6 text-purple-400" /> },
  { value: 'family', label: 'Family', icon: <Home className="w-6 h-6 text-yellow-700" /> },
  { value: 'friends', label: 'Friends', icon: <Users className="w-6 h-6 text-blue-500" /> },
  { value: 'partner', label: 'Romantic Partner', icon: <Heart className="w-6 h-6 text-pink-500" /> },
  { value: 'colleagues', label: 'Colleagues', icon: <Briefcase className="w-6 h-6 text-gray-700" /> },
  { value: 'others', label: 'Others', icon: <Sparkles className="w-6 h-6 text-indigo-500" /> }
];


  const weatherOptions = [
  { value: 'sunny', label: 'Sunny', icon: <Sun className="w-6 h-6 text-yellow-400" /> },
  { value: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-6 h-6 text-gray-400" /> },
  { value: 'rainy', label: 'Rainy', icon: <CloudRain className="w-6 h-6 text-blue-400" /> },
  { value: 'snowy', label: 'Snowy', icon: <Snowflake className="w-6 h-6 text-cyan-300" /> },
  { value: 'stormy', label: 'Stormy', icon: <CloudLightning className="w-6 h-6 text-purple-600" /> }
];


  const sleepOptions = [
  { value: 'excellent', label: 'Excellent (8+ hours)', icon: <Bed className="w-6 h-6 text-blue-500" /> },
  { value: 'good', label: 'Good (6-8 hours)', icon: <Smile className="w-6 h-6 text-green-400" /> },
  { value: 'fair', label: 'Fair (4-6 hours)', icon: <Meh className="w-6 h-6 text-yellow-500" /> },
  { value: 'poor', label: 'Poor (<4 hours)', icon: <Frown className="w-6 h-6 text-red-500" /> }
];


  const getSupportMessage = () => {
    const messages = {
      excellent: "What a wonderful day! Your positive energy is inspiring. Keep up the great work! ✨",
      good: "You're doing great! It's lovely to see you taking care of yourself and staying positive. 🌟",
      okay: "Every day doesn't have to be perfect. You're doing your best, and that's enough. 💙",
      poor: "It's okay to have difficult days. Remember, you're stronger than you think and tomorrow is a new opportunity. 🌈",
      terrible: "I'm sorry you're having such a tough time. Please be gentle with yourself and consider reaching out for support. 💜"
    };
    return messages[journeyData.mood as keyof typeof messages] || "Thank you for sharing your day with us. 🤗";
  };
  const [hasRecordForToday, setHasRecordForToday] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchTodayRecord = async () => {
      const todayDate = new Date();
      const startOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).toISOString();
      const endOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from('mood_track' as any)
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay)
        .single();

      if (!error && data) {
        setHasRecordForToday(true);
      } else {
        setHasRecordForToday(false);
      }
    };

    fetchTodayRecord();
  }, [user]);

  const insertJourney = async () => {
    if (!user) {
      toast({
        title: "You gotta log in first!",
        variant: "destructive",
      });
      return;
    }

    const todayDate = new Date();
    const startOfDay = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate()
    ).toISOString();

    const endOfDay = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() + 1
    ).toISOString();


  const validPartners = ['family', 'friends', 'colleagues', 'partner', 'others', 'none'];

  let partnerRaw = (journeyData.partner || '').toLowerCase().trim();
  const partnerValue = validPartners.includes(partnerRaw) ? partnerRaw : 'none';

  const interactionArray = [partnerValue];

  const payload = {
    user_id: user.id,
    mood: parseInt(journeyData.dayQuality) || 5,
    sleep_quality: capitalize(journeyData.sleep),
    weather: capitalize(journeyData.weather),
    interaction_with: interactionArray,
    note: journeyData.notes || null,
  };

    console.log('Payload to insert/update:', payload);

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('mood_track' as any)
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay)
        .single();
        //do not do not remove this
        setHasRecordForToday(!!existing);

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing && 'id' in existing) {
        const { error: updateError } = await supabase
          .from('mood_track' as any)
          .update(payload)
          .eq('id', existing.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('mood_track' as any)
          .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString(), reminded: false })
        .eq('id', user.id);

      if (profileError) {
        console.warn("Failed to update last_active_at/reminded:", profileError.message);
      }
      toast({
        title: "Journey saved! 🎉",
        description: "Your mood journey was recorded successfully.",
      });

      setSubmitted(true);
    } catch (error: any) {
      console.error("Supabase error:", error);
      toast({
        title: "Failed to save journey",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    }
    
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    insertJourney();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
          <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
          <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{animationDelay: '1s'}} />
          {/* Glowing orb for dark theme */}
          
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 dark:border-white/20 transition-colors">
              <div className="relative mb-8">
              
                <Heart className="relative h-20 w-20 text-pink-500 mx-auto animate-float" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">Thank You! 🎉</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg transition-colors">Your mood journey has been recorded successfully.</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 mb-8 border border-purple-200/50 dark:border-white/20 transition-colors">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center transition-colors">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Today's Support Message
                </h3>
                <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed transition-colors">"{getSupportMessage()}"</p>
              </div>             
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setJourneyData({ mood: '', partner: '', weather: '', sleep: '', dayQuality: '', notes: '' });
                    navigate('/history');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-glow"
                >
                  See My Journey
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 dark:from-blue-500/20 dark:to-purple-500/20 animate-float"></div>
        <div className="absolute top-60 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300/30 to-red-300/30 dark:from-pink-500/20 dark:to-red-500/20 animate-float" style={{animationDelay: '2s'}}></div>
        
        {/* Glowing orb for dark theme */}
        
        
        <Calendar className="absolute top-32 right-1/4 h-8 w-8 text-blue-400 animate-sparkle" />
        <Sun className="absolute bottom-40 left-20 h-6 w-6 text-yellow-400 animate-sparkle" style={{animationDelay: '1.5s'}} />
        <Moon className="absolute top-80 left-1/3 h-7 w-7 text-indigo-400 animate-sparkle" style={{animationDelay: '3s'}} />
        <Star className="absolute top-1/3 left-10 h-4 w-4 text-yellow-400 animate-sparkle" style={{animationDelay: '2s'}} />
        <Sparkles className="absolute bottom-20 right-10 h-5 w-5 text-purple-400 animate-sparkle" style={{animationDelay: '4s'}} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in relative">
          <div className="flex justify-center items-center mb-6">
          <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 rounded-full blur-xl opacity-60 animate-glow"></div>
                <div className="relative p-6 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/60 dark:border-white/20 group-hover:scale-110 transition-transform duration-500">
        <Calendar className="relative h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto transition-colors" />
      </div>
    </div>
  </div>
  <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
              Your Mood
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 animate-gradient-shift">
                Mood Journey
              </span>
            </h1>
  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium max-w-2xl mx-auto transition-colors">
     Track your daily emotions and receive personalized support on your wellness journey
  </p>
</div>
        

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 dark:border-white/20 animate-fade-in transition-colors">
            {/* Overall Mood */}
            

            {/* Partner Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Users className="h-6 w-6 mr-3 text-emerald-500" />
                Who did you spend most of your day with?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {partnerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, partner: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.partner === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.partner === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.icon}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.partner === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Cloud className="h-6 w-6 mr-3 text-blue-500" />
                What was the weather like?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weatherOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, weather: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.weather === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.weather === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.icon}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.weather === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Bed className="h-6 w-6 mr-3 text-purple-500" />
                How was your sleep?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sleepOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, sleep: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.sleep === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.sleep === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.icon}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.sleep === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Day Quality */}
            <div className="mb-12">
              <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">
                Rate your day overall (1-10):
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={journeyData.dayQuality}
                  onChange={(e) => setJourneyData({...journeyData, dayQuality: e.target.value})}
                  className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                  <span>😢 Poor</span>
                  <span className="font-bold text-2xl text-gray-700 dark:text-white bg-white/80 dark:bg-white/20 px-4 py-2 rounded-full border-2 border-purple-300 dark:border-purple-400 transition-colors">
                    {journeyData.dayQuality || '5'}
                  </span>
                  <span>😄 Great</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-10">
              <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">
                <Sparkles className="inline h-6 w-6 mr-2 text-purple-500" />
                Additional thoughts (optional):
              </label>
              <textarea
                value={journeyData.notes}
                onChange={(e) => setJourneyData({...journeyData, notes: e.target.value})}
                placeholder="How are you feeling? What happened today? Any thoughts you'd like to record... ✨"
                className="w-full p-6 border-2 border-gray-300 dark:border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-400 resize-none bg-white/60 dark:bg-white/10 backdrop-blur-sm text-lg text-gray-700 dark:text-white placeholder-gray-400 transition-colors"
                rows={4}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={ !journeyData.weather || !journeyData.sleep}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 animate-glow"
            >
               {hasRecordForToday ? 'Update My Journey ✨' : 'Save My Journey ✨'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Journey;