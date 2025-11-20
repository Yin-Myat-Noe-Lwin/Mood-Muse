import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  CloudLightning,
  Flower,
  Leaf,
  Sparkles,
  CheckCircle,
  PlusCircle,
  Heart,
  Star,
  Trees,
  Bug,
  Trash2,
  Moon,
  X,
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Utility function to format date to 'YYYY-MM-DD' for consistent querying
const formatDateForQuery = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MoodGarden = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState<Database['public']['Tables']['goals']['Row'][]>([]);
  const [moodData, setMoodData] = useState<{
    mood: number | null;
    weather: string | null;
    sleep_quality: string | null;
    interaction_with: string[] | null;
    note: string | null;
    created_at: string | null;
  }>({
    mood: null,
    weather: null,
    sleep_quality: null,
    interaction_with: null,
    note: null,
    created_at: null,
  });
  const [hasRecordForToday, setHasRecordForToday] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [previousDate, setPreviousDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNoMoodPopup, setShowNoMoodPopup] = useState(false);
  const [moodDates, setMoodDates] = useState<Date[]>([]);
  const [dismissedPopupForDate, setDismissedPopupForDate] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const noMoodPopupRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (noMoodPopupRef.current && !noMoodPopupRef.current.contains(event.target as Node)) {
        setShowNoMoodPopup(false);
        setDismissedPopupForDate(formatDateForQuery(selectedDate));
        setSelectedDate(new Date(previousDate));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [previousDate, selectedDate]);

  // Update previousDate when selectedDate changes
  useEffect(() => {
    if (!showDatePicker) {
      setPreviousDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Fetch dates with mood data
  useEffect(() => {
    if (!user?.id) return;

    const fetchMoodDates = async () => {
      try {
        const { data, error } = await supabase
          .from('mood_track')
          .select('created_at')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching mood dates:', error.message);
          toast({
            title: 'Error fetching mood dates',
            description: 'Could not load dates with mood data.',
            variant: 'destructive',
          });
          return;
        }

        const dates = [...new Set(data.map(record => {
          const date = new Date(record.created_at);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }))];
        setMoodDates(dates);
      } catch (err) {
        console.error('Unexpected error fetching mood dates:', err);
        toast({
          title: 'Unexpected error',
          description: 'An unexpected issue occurred while fetching mood dates.',
          variant: 'destructive',
        });
      }
    };

    fetchMoodDates();
  }, [user?.id, toast]);

  // Fetch mood and goals data for the selected date
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const selectedDateStr = formatDateForQuery(selectedDate);
        console.log('Fetching data for date:', selectedDateStr);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Query range:', {
          start: startOfDay.toISOString(),
          end: endOfDay.toISOString(),
        });

        const { count: moodCount, error: moodCountError } = await supabase
          .from('mood_track')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());

        if (moodCountError) {
          console.error('Error counting mood records:', moodCountError.message);
          toast({
            title: 'Error fetching mood record count',
            description: 'No mood data available.',
            variant: 'destructive',
          });
          setMoodData({
            mood: null,
            weather: null,
            sleep_quality: null,
            interaction_with: null,
            note: null,
            created_at: selectedDate.toISOString(),
          });
          setHasRecordForToday(false);
          if (dismissedPopupForDate !== selectedDateStr) {
            setShowNoMoodPopup(true);
          }
          return;
        }

        const moodQuery = supabase
          .from('mood_track')
          .select('mood, weather, sleep_quality, interaction_with, note, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        const { data: moodDataResp, error: moodError } = await moodQuery;

        if (moodError) {
          console.error('Supabase fetch error for mood:', moodError.message);
          toast({
            title: 'Error fetching mood data',
            description: 'No mood data available for this date.',
            variant: 'destructive',
          });
          setHasRecordForToday(false);
          setMoodData({
            mood: null,
            weather: null,
            sleep_quality: null,
            interaction_with: null,
            note: null,
            created_at: selectedDate.toISOString(),
          });
          if (dismissedPopupForDate !== selectedDateStr) {
            setShowNoMoodPopup(true);
          }
        } else if (moodDataResp && moodDataResp.length > 0) {
          const record = moodDataResp[0] as Database['public']['Tables']['mood_track']['Row'];
          const sleepQuality = typeof record.sleep_quality === 'string' ? record.sleep_quality.toLowerCase() : null;
          console.log('Fetched Mood Data:', record);
          console.log('Sleep Quality:', sleepQuality);
          setHasRecordForToday(true);
          setMoodData({
            mood: typeof record.mood === 'number' ? record.mood : null,
            weather: typeof record.weather === 'string' ? record.weather.toLowerCase() : null,
            sleep_quality: sleepQuality,
            interaction_with: Array.isArray(record.interaction_with) ? record.interaction_with : null,
            note: typeof record.note === 'string' ? record.note : null,
            created_at: record.created_at || selectedDate.toISOString(),
          });
          setShowNoMoodPopup(false);
        } else {
          setHasRecordForToday(false);
          setMoodData({
            mood: null,
            weather: null,
            sleep_quality: null,
            interaction_with: null,
            note: null,
            created_at: selectedDate.toISOString(),
          });
          if (dismissedPopupForDate !== selectedDateStr) {
            setShowNoMoodPopup(true);
          }
        }

        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });

        if (goalsError) {
          console.error('Supabase fetch error for goals:', goalsError.message);
          toast({
            title: 'Error fetching goals',
            description: 'Could not load your goals. Using empty list.',
            variant: 'destructive',
          });
          setGoals([]);
        } else {
          setGoals(goalsData || []);
          if (!goalsData || goalsData.length === 0) {
            toast({
              title: 'No goals found',
              description: `No goals recorded for ${selectedDateStr}.`,
              variant: 'default',
            });
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast({
          title: 'Unexpected error',
          description: 'An unexpected issue occurred. No mood data available.',
          variant: 'destructive',
        });
        setHasRecordForToday(false);
        setMoodData({
          mood: null,
          weather: null,
          sleep_quality: null,
          interaction_with: null,
          note: null,
          created_at: selectedDate.toISOString(),
        });
        if (dismissedPopupForDate !== formatDateForQuery(selectedDate)) {
          setShowNoMoodPopup(true);
        }
        setGoals([]);
      }
    };

    fetchData();
  }, [user?.id, toast, selectedDate, dismissedPopupForDate]);

  const handleAddGoal = async () => {
    if (!user?.role || !newGoal.trim()) return;

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        description: newGoal,
        is_completed: false,
        created_at: selectedDate.toISOString(),
      });

    if (error) {
      console.error('Error adding goal:', error.message);
      toast({
        title: "Error adding goal",
        description: "Failed to add your goal.",
        variant: "destructive",
      });
    } else {
      setGoals(prev => [...prev, { id: crypto.randomUUID(), user_id: user.id, description: newGoal, is_completed: false, created_at: selectedDate.toISOString(), completed_at: null }]);
      setNewGoal('');
      toast({ title: "Goal added successfully! 🌟" });
    }
  };

  const handleToggleGoal = async (goalId: string) => {
    if (!user?.role) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newCompleted = !goal.is_completed;
    const { error } = await supabase
      .from('goals')
      .update({ is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling goal:', error.message);
      toast({
        title: "Error updating goal",
        description: "Failed to update your goal.",
        variant: "destructive",
      });
    } else {
      setGoals(goals.map(g =>
        g.id === goalId ? { ...g, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null } : g
      ));
      toast({ 
        title: `Goal ${newCompleted ? 'completed' : 'reopened'}! ${newCompleted ? '✨' : '🔄'}` 
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.role) return;
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error.message);
      toast({
        title: "Error deleting goal",
        description: "Failed to delete your goal.",
        variant: "destructive",
      });
    } else {
      setGoals(goals.filter(g => g.id !== goalId));
      toast({ title: "Goal deleted! 🗑️" });
    }
  };

  const getWeatherIcon = (weather: string | null) => {
    if (!weather) return null;
    const iconClass = "w-16 h-16 drop-shadow-lg";
    switch (weather.toLowerCase()) {
      case 'sunny':
        return (
          <Sun
            className={`${iconClass} text-yellow-400 animate-pulse`}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))' }}
          />
        );
      case 'cloudy':
        return <Cloud className={`${iconClass} text-muted-foreground`} />;
      case 'rainy':
        return <CloudRain className={`${iconClass} text-primary`} />;
      case 'snowy':
        return <Snowflake className={`${iconClass} text-blue-200`} />;
      case 'stormy':
        return <CloudLightning className={`${iconClass} text-destructive animate-pulse`} />;
      default:
        return null;
    }
  };

  const getGardenElements = (mood: number | null, weather: string | null, sleep_quality: string | null) => {
    if (!mood || !weather || !sleep_quality) {
      return { flowers: [], leaves: [], bugs: [], flowerCount: 0, leafCount: 0 };
    }

    const flowerCount = Math.max(2, Math.floor(mood / 2));
    const sleepQualityMap = {
      excellent: 12,
      good: 7,
      fair: 5,
      poor: 3,
    };
    const normalizedSleepQuality = sleep_quality?.toLowerCase();
    const leafCount = sleepQualityMap[normalizedSleepQuality] || 0;
    console.log('getGardenElements Input:', { mood, weather, sleep_quality: normalizedSleepQuality, leafCount });
    console.log('Generating leaves:', leafCount);
    const bugCount = mood || 0; // Bug count equals mood value (or 0 if null)
    console.log('Bug Count:', bugCount);
    const animationSpeed = 1 - (mood - 1) / 20;
    const scaleFactor = 0.8 + (mood - 1) / 20;

    const flowerColors = ['text-pink-500', 'text-purple-500', 'text-yellow-500', 'text-orange-400'];
    const leafColors = ['text-green-400', 'text-emerald-500', 'text-teal-500', 'text-lime-500'];

    const flowers = Array.from({ length: flowerCount }).map((_, i) => (
      <Flower
        key={`flower-${i}`}
        className={`w-10 h-10 ${flowerColors[i % flowerColors.length]} absolute animate-pulse drop-shadow-md`}
        style={{
          left: `${15 + i * 18}%`,
          bottom: `${20 + Math.sin(i) * 15}%`,
          animationDuration: `${animationSpeed}s`,
          transform: `scale(${scaleFactor}) rotate(${Math.random() * 30 - 15}deg)`,
        }}
      />
    ));

    const leaves = Array.from({ length: leafCount }).map((_, i) => {
      const left = 5 + Math.random() * 90;
      const top = 5 + Math.random() * 90;
      console.log(`Leaf ${i}: left=${left.toFixed(2)}%, top=${top.toFixed(2)}%`);
      return (
        <Leaf
          key={`leaf-${i}`}
          className={`w-7 h-7 ${leafColors[i % leafColors.length]} absolute animate-pulse`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDuration: `${animationSpeed}s`,
            transform: `scale(${scaleFactor}) rotate(${Math.random() * 60}deg)`,
            zIndex: 10,
          }}
        />
      );
    });

    const bugs = Array.from({ length: bugCount }).map((_, i) => {
      const baseLeft = 20 + (i * 60) / Math.max(1, bugCount - 1); // Base position in 20–80% range
      const randomOffset = (Math.random() * 10 - 5); // ±5% for scatter
      const left = Math.min(80, Math.max(20, baseLeft + randomOffset)); // Clamp to 20–80%
      const top = 10 + Math.random() * 30; // Random top between 10% and 40%
      return (
        <div
          key={`bug-${i}`}
          data-testid={`bug-${i}`}
          className="absolute animate-float"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDuration: `${2 + Math.random()}s`,
            transform: `scale(${scaleFactor}) rotate(${Math.random() * 45}deg)`,
            zIndex: 30,
          }}
        >
          <Bug
            className="w-6 h-6 text-pink-400 dark:text-pink-200 opacity-90"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 182, 193, 0.7))',
              backgroundColor: 'rgba(255, 182, 193, 0.2)', // Fallback background
            }}
          />
        </div>
      );
    });

    console.log('Rendering bugs:', bugs.length, bugs.map(b => b.props.style));

    return { flowers, leaves, bugs, flowerCount, leafCount };
  };

  const getBackgroundStyle = (weather: string | null) => {
    if (!weather) return 'from-gray-100/50 via-gray-50/30 to-gray-100/40';
    switch (weather.toLowerCase()) {
      case 'sunny':
        return 'from-sky-100/50 via-green-50/30 to-emerald-100/40';
      case 'cloudy':
        return 'from-gray-200/50 via-gray-300/30 to-gray-400/40';
      case 'rainy':
        return 'from-blue-200/50 via-blue-300/30 to-blue-400/40';
      case 'snowy':
        return 'from-white/50 via-gray-200/30 to-gray-300/40';
      case 'stormy':
        return 'from-gray-700/50 via-gray-600/30 to-gray-500/40';
      default:
        return 'from-gray-100/50 via-gray-50/30 to-gray-100/40';
    }
  };

  const getWeatherEffect = (weather: string | null) => {
    if (!weather) return null;
    switch (weather.toLowerCase()) {
      case 'rainy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-2 bg-blue-400 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * -50 - 50}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        );
      case 'snowy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 bg-blue-300 rounded-full animate-snow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * -50 - 50}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        );
      case 'stormy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-16 bg-yellow-300 animate-lightning"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * -50}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${0.5 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const getGoalIcon = (description: string) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('walk')) return <Heart className="w-6 h-6 text-pink-500" />;
    if (lowerDesc.includes('water')) return <Star className="w-6 h-6 text-yellow-500" />;
    if (lowerDesc.includes('gratitude')) return <Sparkles className="w-6 h-6 text-purple-500" />;
    return <Star className="w-6 h-6 text-yellow-500" />;
  };

  const { flowers, leaves, bugs, flowerCount, leafCount } = getGardenElements(moodData.mood, moodData.weather, moodData.sleep_quality);
  const completedGoals = goals.filter(goal => goal.is_completed).length;
  const totalGoals = goals.length;
  const completionRatio = totalGoals > 0 ? completedGoals / totalGoals : 0;
  const sparkleCount = moodData.mood === null ? 0 : completionRatio < 0.5 ? 2 : completionRatio === 0.5 ? 4 : 5;

  const getMoodColor = (mood: number | null) => {
    if (!mood) return 'text-gray-500';
    if (mood >= 8) return 'text-green-500';
    if (mood >= 6) return 'text-primary';
    if (mood >= 4) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getMoodEmoji = (mood: number | null) => {
    if (!mood) return '—';
    if (mood >= 8) return '🌟';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    return '😔';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return formatDateForQuery(new Date());
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowDatePicker(false);
      setShowNoMoodPopup(false);
      setDismissedPopupForDate(null);
    }
  };

  // Function to format interaction_with display
  const formatInteractionWith = (interaction: string[] | null) => {
    if (!interaction || interaction.length === 0) {
      return 'None';
    }
    return interaction.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 dark:from-blue-500/20 dark:to-purple-500/20 animate-float"></div>
        <div className="absolute top-60 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300/30 to-red-300/30 dark:from-pink-500/20 dark:to-red-500/20 animate-float" style={{ animationDelay: '2s' }}></div>
        <Sparkles className="absolute top-32 right-1/4 h-8 w-8 text-purple-400 animate-sparkle" />
        <Star className="absolute bottom-40 left-20 h-6 w-6 text-yellow-400 animate-sparkle" style={{ animationDelay: '1.5s' }} />
      </div>

      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={datePickerRef}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-purple-500/40 p-6 w-full max-w-sm relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              onClick={() => setShowDatePicker(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                Select Date
              </h2>
            </div>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="w-full"
              modifiers={{
                hasMood: moodDates,
                selected: selectedDate,
                today: new Date(),
              }}
              modifiersClassNames={{
                hasMood: 'rdp-day_has-mood',
                selected: 'rdp-day_selected',
                today: 'rdp-day_today',
              }}
              classNames={{
                head_cell: "text-gray-800 dark:text-gray-200 font-semibold",
                caption_label: "text-gray-900 dark:text-gray-100 font-semibold",
              }}
            />
          </div>
        </div>
      )}

      {showNoMoodPopup && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div
            ref={noMoodPopupRef}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-300/50 dark:border-purple-500/30 p-8 w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              onClick={() => {
                setShowNoMoodPopup(false);
                setDismissedPopupForDate(formatDateForQuery(selectedDate));
                setSelectedDate(new Date(previousDate));
              }}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                No Mood Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg leading-relaxed">
                There is no mood journey for the Mood Garden on {formatDate(selectedDate.toISOString())}.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => {
                    setShowNoMoodPopup(false);
                    setDismissedPopupForDate(formatDateForQuery(selectedDate));
                    setSelectedDate(new Date(previousDate));
                  }}
                  className="w-36 px-6 py-3 shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowNoMoodPopup(false);
                    setDismissedPopupForDate(formatDateForQuery(selectedDate));
                    setShowDatePicker(true);
                  }}
                  className="w-36 px-6 py-3 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-200 hover:shadow-xl"
                >
                  Select Another Date
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center mb-12 animate-fade-in relative">
            <div className="flex justify-center items-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 rounded-full blur-xl opacity-60 animate-glow"></div>
                <div className="relative p-6 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/60 dark:border-white/20 group-hover:scale-110 transition-transform duration-500">
                  {getWeatherIcon(moodData.weather)}
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
              Your Mood
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 animate-gradient-shift">
                Garden
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium max-w-2xl mx-auto transition-colors">
              A beautiful reflection of your inner world 🌸
              Tend to your garden each day by setting goals and checking in with your mood.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 animate-fade-in dark:bg-white/10 dark:border-white/20">
                <CardContent className="p-0 relative">
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 1000 400"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,350 C150,300 250,350 400,300 S600,350 750,300 1000,350 1000,350"
                      fill="none"
                      stroke="url(#vineGradient)"
                      strokeWidth="4"
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient id="vineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.7 }} />
                        <stop offset="50%" style={{ stopColor: '#34D399', stopOpacity: 0.9 }} />
                        <stop offset="100%" style={{ stopColor: '#6EE7B7', stopOpacity: 0.7 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className={`relative h-96 bg-gradient-to-b ${getBackgroundStyle(moodData.weather)} overflow-hidden rounded-xl`}>
                    <div className="absolute inset-0 z-0">
                      {getWeatherEffect(moodData.weather)}
                      <div className="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-b from-blue-200/10 via-purple-200/5 to-transparent" />
                      <Cloud className="absolute top-6 right-12 w-12 h-12 text-blue-300/30 dark:text-blue-200/30 animate-pulse z-5" style={{ animationDelay: '2s' }} />
                      <Cloud className="absolute top-12 left-16 w-8 h-8 text-purple-200/20 dark:text-purple-100/20 animate-pulse z-5" style={{ animationDelay: '3s' }} />
                      <Cloud className="absolute top-20 right-20 w-10 h-10 text-blue-200/25 dark:text-blue-100/25 animate-pulse z-5" style={{ animationDelay: '1s' }} />
                    </div>
                    <div className="relative h-full z-10">
                      {flowers.map((flower, i) => (
                        <div key={`flower-wrap-${i}`} className="animate-wind z-15" style={{ animationDelay: `${i * 0.2}s` }}>
                          {flower}
                        </div>
                      ))}
                      {leaves.map((leaf, i) => (
                        <div key={`leaf-wrap-${i}`} className="animate-wind z-15" style={{ animationDelay: `${i * 0.3}s` }}>
                          {leaf}
                        </div>
                      ))}
                      {bugs}
                      {Array.from({ length: sparkleCount }).map((_, i) => (
                        <Sparkles
                          key={`sparkle-${i}`}
                          className="absolute w-5 h-5 text-yellow-400 dark:text-yellow-300 animate-pulse z-20"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${15 + Math.random() * 10}%`,
                            animationDelay: `${i * 0.5}s`,
                            filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))',
                          }}
                        />
                      ))}
                      <Trees className="absolute left-4 bottom-12 w-16 h-16 text-emerald-500/60 dark:text-emerald-300/40 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute right-8 bottom-16 w-20 h-20 text-emerald-500/50 dark:text-emerald-300/30 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute left-20 bottom-10 w-18 h-18 text-emerald-500/55 dark:text-emerald-300/35 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute right-24 bottom-14 w-14 h-14 text-emerald-500/60 dark:text-emerald-300/45 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute left-10 bottom-8 w-12 h-12 text-emerald-500/65 dark:text-emerald-300/50 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute right-16 bottom-10 w-16 h-16 text-emerald-500/55 dark:text-emerald-300/35 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute left-30 bottom-12 w-15 h-15 text-emerald-500/60 dark:text-emerald-300/40 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <Trees className="absolute right-30 bottom-8 w-13 h-13 text-emerald-500/65 dark:text-emerald-300/45 z-5" style={{ filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-300/30 via-lime-200/20 to-transparent z-5">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={`grass-${i}`}
                            className="absolute w-1 h-4 bg-gradient-to-t from-emerald-400/50 to-emerald-300/30"
                            style={{
                              left: `${(i * 5) % 100}%`,
                              bottom: '0',
                              transform: `rotate(${Math.random() * 10 - 5}deg)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="flex flex-col justify-between h-[28rem] bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border-2 border-white/50 animate-fade-in dark:bg-white/10 dark:border-white/20">
                <CardHeader className="pb-0.5">
                  <CardTitle className="text-lg flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>Today's Garden</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 p-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300">Mood</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-xs sm:text-sm ${getMoodColor(moodData.mood)}`}>
                          {moodData.mood !== null ? `${moodData.mood}/10` : '—'}
                        </span>
                        <span className="text-base">{getMoodEmoji(moodData.mood)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300">Flowers Bloomed</span>
                      <div className="flex items-center space-x-2">
                        <Flower className="w-4 h-4 text-pink-500" />
                        <span className="font-bold text-xs sm:text-sm text-pink-500">{flowerCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300">Leaves Grown</span>
                      <div className="flex items-center space-x-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-xs sm:text-sm text-emerald-500">{leafCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300">Goals Completed</span>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-xs sm:text-sm text-yellow-500">{completedGoals}/{goals.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">Sleep Quality</span>
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-xs sm:text-sm capitalize text-purple-600 dark:text-purple-300">
                          {moodData.sleep_quality || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">Weather Mood</span>
                      <p className="font-semibold text-xs sm:text-sm capitalize text-purple-600 dark:text-purple-300">
                        {moodData.weather || '—'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">Connected With</span>
                      <p className="font-semibold text-xs sm:text-sm text-purple-600 dark:text-purple-300">
                        {formatInteractionWith(moodData.interaction_with)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 rounded-lg dark:from-emerald-900/20 dark:to-pink-900/20">
                      <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">Date</span>
                      <p
                        className="font-semibold text-xs sm:text-sm text-purple-600 dark:text-purple-300 cursor-pointer hover:text-pink-500"
                        onClick={() => setShowDatePicker(true)}
                      >
                        {formatDate(moodData.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent dark:from-pink-300 dark:via-purple-300 dark:to-yellow-300">
                <PlusCircle className="w-6 h-6 text-pink-500" />
                <span>Today's Goals</span>
                <div className="ml-auto text-sm font-normal bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
                  {completedGoals} of {goals.length} completed
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-3">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Plant a new goal for today..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                  className="flex-1 bg-gradient-to-r from-emerald-50/50 to-pink-50/30 border-primary/20 focus:border-purple-500/40 text-purple-600 dark:text-purple-300"
                />
                <Button onClick={handleAddGoal} className="shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {goals.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl text-yellow-500">🌱</div>
                    <p className="text-lg bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300">
                      Plant your first goal for today!
                    </p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group ${
                        goal.is_completed
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-accent/10 border border-accent/20 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-pink-50/30 dark:hover:from-emerald-900/20 dark:hover:to-pink-900/20'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <CheckCircle
                          className={`w-6 h-6 transition-all duration-300 cursor-pointer ${
                            goal.is_completed
                              ? 'text-pink-500 scale-110'
                              : 'text-muted-foreground group-hover:text-purple-500 group-hover:scale-105'
                          }`}
                          onClick={() => handleToggleGoal(goal.id)}
                        />
                      </div>
                      <span
                        className={`flex-1 transition-all duration-300 ${
                          goal.is_completed
                            ? 'line-through text-muted-foreground'
                            : 'text-purple-600 dark:text-purple-300 group-hover:text-pink-500'
                        }`}
                      >
                        {goal.description}
                      </span>
                      {goal.is_completed && (
                        <span className="text-2xl animate-bounce text-yellow-500">✨</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal.id);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 animate-fade-in dark:bg-white/10 dark:border-white/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-clip-text text-transparent dark:from-green-300 dark:via-teal-300 dark:to-blue-300">
                <Flower className="w-6 h-6 text-emerald-500" />
                <span>About Your Mood Garden</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Welcome to your <span className="font-semibold text-purple-600 dark:text-purple-300">Mood Garden</span>, a vibrant reflection of your inner world! 🌱 Each element in your garden tells a story about your day:
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <Flower className="w-5 h-5 text-pink-500 mt-1" />
                  <span>
                    <span className="font-medium text-pink-500">Flowers</span> bloom based on your mood—higher moods create more vibrant blooms!
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Leaf className="w-5 h-5 text-emerald-500 mt-1" />
                  <span>
                    <span className="font-medium text-emerald-500">Leaves</span> reflect your sleep quality: 12 for excellent, 7 for good, 5 for fair, and 3 for poor sleep.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Bug className="w-5 h-5 text-purple-400 mt-1" />
                  <span>
                    <span className="font-medium text-purple-400">Butterflies</span> appear equal to your mood value: 1 butterfly for mood 1, 2 for mood 2, and so on.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Cloud className="w-5 h-5 text-blue-400 mt-1" />
                  <span>
                    <span className="font-medium text-blue-400">Weather</span> mirrors your emotional sky, from sunny days to stormy moments.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500 mt-1" />
                  <span>
                    <span className="font-medium text-yellow-500">Sparkles</span> represent your goal completion: 2 for under half, 4 for half, and 5 for over half completed.
                  </span>
                </li>
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Keep nurturing your garden by setting daily goals and reflecting on your mood. Watch it grow more beautiful with every step you take! ✨
              </p>
              <div className="text-center">
                <Button
                  onClick={() => navigate('/Journey')}
                  className="shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Mood Journey
                </Button>
              </div>
            </CardContent>
          </Card>

          {moodData.note && (
            <Card className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent dark:from-pink-300 dark:via-purple-300 dark:to-yellow-300">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>Today's Reflection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent dark:from-green-300 dark:to-teal-300 italic leading-relaxed">
                  "{moodData.note}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS animations and styles
const styles = `
  @keyframes rain {
    0% { transform: translateY(-100vh); opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0.5; }
  }
  @keyframes snow {
    0% { transform: translateY(-100vh); opacity: 0.7; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes lightning {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0; }
    100% { opacity: 0; }
  }
  @keyframes fadeIn {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0); }
  }
  .animate-rain { animation: rain 1.5s linear infinite; }
  .animate-snow { animation: snow 3s linear infinite; }
  .animate-lightning { animation: lightning 0.5s ease-in-out infinite; }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .rdp {
    font-family: inherit;
    background: transparent;
    padding: 0.5rem;
  }
  .rdp-caption {
    background: linear-gradient(to right, #8b5cf6, #ec4899);
    color: white;
    padding: 0.5rem;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  .rdp-head_cell {
    color: white;
    font-weight: 600;
  }
  .rdp-day {
    color: #6b7280;
    border-radius: 0.25rem;
    position: relative;
  }
  .rdp-day:hover {
    background: rgba(139, 92, 246, 0.2);
    color: #8b5cf6;
  }
  .rdp-day_selected {
    background: #8b5cf6;
    color: white;
  }
  .rdp-day_today {
    font-weight: bold;
    color: #ec4899;
  }
  .rdp-day_has-mood {
    position: relative;
  }
  .rdp-day_has-mood::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2c-1.5 0-2.7 1.2-2.7 2.7 0 1.2.8 2.2 1.9 2.6-.7 2.3-2.6 4-4.8 4.8-.4-1.1-1.4-1.9-2.6-1.9-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7c1.2 0 2.2-.8 2.6-1.9 2.2.7 3.9 2.6 4.8 4.8 1-.4 1.9-1.4 1.9-2.6 0-1.5-1.2-2.7-2.7-2.7s-2.7 1.2-2.7 2.7 1.2 2.7 2.7 2.7c1.2 0 2.2-.8 2.6-1.9 2.2.7 3.9 2.6 4.8 4.8.4-1.1 1.4-1.9 2.6-1.9 1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7c-1.2 0-2.2-.8-2.6-1.9-.9-2.2-2.6-3.9-4.8-4.8.4 1.1 1.4 1.9 2.6 1.9 1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7c-1.2 0-2.2.8-2.6 1.9-2.2-.7-3.9-2.6-4.8-4.8-.4 1.1-1.4 1.9-2.6 1.9-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7z'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
  }
  .dark .rdp {
    background: transparent;
    color: #d1d5db;
  }
  .dark .rdp-caption {
    background: linear-gradient(to right, #a78bfa, #f472b6);
  }
  .dark .rdp-head_cell {
    color: #d1d5db;
  }
  .dark .rdp-day {
    color: #d1d5db;
  }
  .dark .rdp-day:hover {
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
  }
  .dark .rdp-day_selected {
    background: #a78bfa;
    color: white;
  }
  .dark .rdp-day_today {
    color: #f472b6;
  }
  .dark .rdp-day_has-mood::after {
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2c-1.5 0-2.7 1.2-2.7 2.7 0 1.2.8 2.2 1.9 2.6-.7 2.3-2.6 4-4.8 4.8-.4-1.1-1.4-1.9-2.6-1.9-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7c1.2 0 2.2-.8 2.6-1.9 2.2.7 3.9 2.6 4.8 4.8 1-.4 1.9-1.4 1.9-2.6 0-1.5-1.2-2.7-2.7-2.7s-2.7 1.2-2.7 2.7 1.2 2.7 2.7 2.7c1.2 0 2.2-.8 2.6-1.9 2.2.7 3.9 2.6 4.8 4.8.4-1.1 1.4-1.9 2.6-1.9 1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7c-1.2 0-2.2-.8-2.6-1.9-.9-2.2-2.6-3.9-4.8-4.8.4 1.1 1.4 1.9 2.6 1.9 1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7c-1.2 0-2.2.8-2.6 1.9-2.2-.7-3.9-2.6-4.8-4.8-.4 1.1-1.4 1.9-2.6 1.9-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7z'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
  }
`;

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

export default MoodGarden;