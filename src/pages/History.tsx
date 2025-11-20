import React, { useState, useMemo, useId, Suspense, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Calendar as CalendarIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Heart,
  Clock,
  Smile,
  Frown,
  Meh,
  Laugh,
  PartyPopper,
  Moon,
 

 
  Flower,
  Leaf,
  
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface MoodEntry {
  id: string;
  user_id?: string | null;
  created_at?: string | null; // timestamp with time zone
  mood?: number | null;
  sleep_quality?: string | null;
  weather?: string | null;
  interaction_with?: string[] | null;
  note?: string | null;
}

interface ChartData {
  date: string;
  mood: number;
  weather: string;
  formattedDate: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const FALLBACK_EMOJI_BY_SCORE: Record<number, string> = {
  1: '😭',
  2: '😢',
  3: '😔',
  4: '🙁',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '🤩',
  10: '🌟',
};

function daysAgo(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton Component                                                 */
/* ------------------------------------------------------------------ */

const Skeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-2" />
          <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 animate-pulse dark:bg-white/10 dark:border-white/20">
              <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div className="h-10 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-pulse dark:bg-white/10 dark:border-white/20">
          <div className="h-10 w-1/4 bg-gray-300 dark:bg-gray-700 rounded mb-4 mx-auto" />
          <div className="h-12 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-pulse dark:bg-white/10 dark:border-white/20">
          <div className="h-64 w-full bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border-2 border-white/50 animate-pulse dark:bg-white/10 dark:border-white/20">
          <div className="h-10 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-4 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 w-full bg-gray-300 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const HistoryContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [showNote, setShowNote] = useState<string | null>(null); // State to track which day's note to show
  const getMoodInsights = () => {
    const insights: string[] = [];

    if (moodEntries.length < 6) {
      insights.push("Keep logging your mood consistently to gain more personalized insights.");
      return insights; // Return early if not enough data
    }

    // 🔹 Filter to only recent entries (last 60 days) for meaningful analysis
    const recentCutoff = daysAgo(new Date(), 60);
    const recentEntries = moodEntries.filter(entry => 
      new Date(entry.created_at) >= recentCutoff
    );

    if (recentEntries.length < 3) {
      insights.push("Log more recent entries to get current insights about your mood patterns.");
      return insights;
    }

    // 🔹 Mood by interaction (ONLY RECENT DATA)
    const interactionMoods: Record<string, { moods: number[], count: number, total: number }> = {};

    recentEntries.forEach(entry => {
      if (entry.interaction_with && entry.mood != null) {
        entry.interaction_with.forEach(person => {
          if (!interactionMoods[person]) {
            interactionMoods[person] = { moods: [], count: 0, total: 0 };
          }
          interactionMoods[person].moods.push(entry.mood);
          interactionMoods[person].count++;
          interactionMoods[person].total += entry.mood;
        });
      }
    });

    // Only consider interactions with at least 2 recent entries
    const validInteractions = Object.entries(interactionMoods)
      .filter(([_, data]) => data.count >= 2)
      .map(([person, data]) => ({
        person,
        avg: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avg - a.avg);

    // Generate insights only for statistically significant patterns
    if (validInteractions.length > 0) {
      const topBooster = validInteractions[0];
      const topDrainer = validInteractions[validInteractions.length - 1];

      // Booster: avg > 5.5
      if (topBooster && topBooster.avg > 5.5 && topBooster.count >= 2) {
        const personLower = topBooster.person.toLowerCase();
        if (personLower === "none") {
          insights.push("You seem to be enjoying your own company lately — sometimes solo time is the best recharge.");
        } else if (personLower === "others") {
          insights.push("Spending time with other people outside your usual circle seems to lift your spirits. New connections bring fresh energy!");
        } else {
          const phrases = [
            `Spending time with ${topBooster.person} seems to give your mood a boost. Keep those good vibes rolling!`,
            `${topBooster.person} is like your personal happiness WiFi — your mood spikes when you're with them.`,
            `Notice how your mood perks up around ${topBooster.person}? That's some connection magic!`
          ];
          insights.push(phrases[Math.floor(Math.random() * phrases.length)]);
        }
      }

      // Neutral: avg between 3.5 and 5.5
      if (topBooster && topBooster.avg <= 5.5 && topBooster.avg > 3.5 && topBooster.count >= 2) {
        insights.push(`Spending time with ${topBooster.person} seems to have a neutral effect on your mood. It's neither a big boost nor a drain—just steady company.`);
      }

      // Drainer: avg <= 3.5
      if (topDrainer && 
          topDrainer.person !== topBooster?.person && 
          topDrainer.avg <= 3.5 && 
          topDrainer.count >= 2) {
        const personLower = topDrainer.person.toLowerCase();
        if (personLower === "none") {
          insights.push("Time alone seems to be bringing your mood down lately. Maybe plan some social activities?");
        } else if (personLower === "others") {
          insights.push("Some interactions with people outside your usual circle seem to drain your mood. It's okay to take a break and recharge!");
        } else {
          const phrases = [
            `Spending time with ${topDrainer.person} seems to lower your mood. Maybe limit those encounters?`,
            `${topDrainer.person} might be unintentionally zapping your happiness. Time for some emotional space!`,
            `Notice your mood dips when you're with ${topDrainer.person}? Protect your vibe and take care of yourself.`
          ];
          insights.push(phrases[Math.floor(Math.random() * phrases.length)]);
        }
      }
    }


    // Count sleep qualities
    const sleepCounts: Record<string, number> = {};
    const sleepMoodSums: Record<string, number> = {};
    moodEntries.forEach(entry => {
      if (entry.sleep_quality && entry.mood != null) {
        const key = entry.sleep_quality.toLowerCase();
        sleepCounts[key] = (sleepCounts[key] || 0) + 1;
        sleepMoodSums[key] = (sleepMoodSums[key] || 0) + entry.mood;
      }
    });

    // Calculate average mood per sleep quality
    const sleepAverages = Object.keys(sleepCounts).reduce((acc, key) => {
      acc[key] = sleepMoodSums[key] / sleepCounts[key];
      return acc;
    }, {} as Record<string, number>);

    // Check for alarm on poor sleep frequency
    const totalSleepRecords = Object.values(sleepCounts).reduce((a, b) => a + b, 0);
    const poorSleepRatio = (sleepCounts['poor'] || 0) / totalSleepRecords;

    if (poorSleepRatio > 0.4) {
      insights.push(
        "⚠️ YOU’VE HAD QUITE A FEW POOR SLEEP NIGHTS LATELY! PRIORITIZE REST AND SELF-CARE!!"
      );
    } else {
      if ((sleepCounts['good'] || 0) + (sleepCounts['excellent'] || 0) > (sleepCounts['poor'] || 0) + (sleepCounts['fair'] || 0)) {
        insights.push(
          "YOU SEEM TO BE GETTING DECENT SLEEP OVERALL, WHICH HELPS KEEP YOUR MOOD STABLE. NICE JOB!"
        );
      } else {
        insights.push(
          "SLEEP QUALITY HAS ROOM FOR IMPROVEMENT. BETTER REST CAN BOOST YOUR MOOD A LOT."
        );
      }
    }

    // Sleep quality by weather — specifically for 'excellent'
    const excellentSleepCountsByWeather: Record<string, number> = {};

    moodEntries.forEach(entry => {
      if (entry.sleep_quality?.toLowerCase() === 'excellent' && entry.weather) {
        const weather = entry.weather;
        excellentSleepCountsByWeather[weather] = (excellentSleepCountsByWeather[weather] || 0) + 1;
      }
    });

    // Find the weather with the most 'excellent' sleep counts
    let bestWeather = '';
    let maxExcellentCount = -1;

    Object.entries(excellentSleepCountsByWeather).forEach(([weather, count]) => {
      if (count > maxExcellentCount) {
        maxExcellentCount = count;
        bestWeather = weather;
      }
    });

    if (bestWeather && maxExcellentCount >= 2) {
      insights.push(`You tend to sleep best on ${bestWeather.toUpperCase()} days. Consider syncing your routine to those conditions.`);
    }

    // 🔹 Mood streaks
    const lowMoodStreak = chartData.slice(-5).filter(d => d.mood <= 4).length;
    if (lowMoodStreak >= 3) {
      insights.push("Heads up: your mood's been dipping for a few days. Maybe try a little self-care or chat with a friend?");
    }

// 🔹 Mood trend analysis - use RECENT data only
const recentMoods = recentEntries
    .map(entry => entry.mood)
    .filter(mood => mood != null) as number[];

  let isMostlyDeclining = false;
  let recentMoodAvg = 0;

  if (recentMoods.length > 0) {
    // Calculate differences between consecutive days
    const diffs = recentMoods.slice(1).map((val, i) => val - recentMoods[i]);

    // Count declines
    const declines = diffs.filter(d => d < 0).length;

    // If more than half of differences are negative, consider trend declining
    isMostlyDeclining = declines >= Math.floor(diffs.length / 2);

    // Compute average
    recentMoodAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
  }

    // 🔹 Overall positivity with recent context
    if (recentMoodAvg >= 5.5 && !isMostlyDeclining) {
      const messages = [
        "You're radiating good vibes lately — keep riding that emotional wave!",
        "You've been emotionally glowing lately. Whatever you're doing, keep at it!",
        "Your recent mood trend looks strong and positive. Love that energy!"
      ];
      insights.push(messages[Math.floor(Math.random() * messages.length)]);
    } else if (recentMoodAvg <= 3.5 || (isMostlyDeclining && recentMoodAvg <= 3.5)) {
      insights.push(
        "Looks like you've been facing a tough patch emotionally recently. It's okay to not be okay — reaching out for support can really help."
      );
    } else if (isMostlyDeclining) {
      insights.push(
        "Your mood seems to be trending downward lately. Consider taking small self-care steps to lift your spirits."
      );
    } else {
      // Middle-range mood (3.5 < avg < 5.5)
      insights.push(
        "You're feeling pretty average lately — that's perfectly normal. Keep an eye on your mood and do small things that make you happy."
      );
    }



    // 🔹 Weather correlation
const weatherCompliments = {
  Sunny: [
    "Your mood tends to beam on sunny days. Are you secretly photosynthesizing?",
    "Sunny days really light you up! Keep soaking up that energy.",
    "You shine bright when the sun's out. Sun-kissed vibes!"
  ],
  Cloudy: [
    "You seem to find peace on cloudy days. Cozy vibes = happy vibes!",
    "Cloudy days are your mellow mood moments. Love that chill energy.",
    "Cloud cover doesn't dull your sparkle."
  ],
  Rainy: [
    "Rainy days bring out your best. Maybe you’re just built different… or waterproof.",
    "You maintain your composure even on rainy days—truly a testament to your emotional resilience.",
    "Rainy weather suits you well, like a warm cup on a cold day."
  ],
  Snowy: [
    "You thrive in the snowy stillness. A true winter soul ❄️",
    "Snowy days bring out your calm and cozy side. Beautiful balance!",
    "You're like fresh snow — pure, serene, and uplifting."
  ],
  Stormy: [
    "Surprisingly, stormy skies don't dampen your spirit. You’re basically unshakable.",
    "Storms might rage outside, but you keep your cool inside.",
    "You handle the storm like a champ — resilient and steady."
  ]
};

const weatherWarnings = {
  Sunny: [
    "Sunny days seem to drain you a bit. Shades and some quiet time might help. 🕶️",
    "Too much sun can be tiring — remember to take breaks in the shade.",
    "Sunny skies sometimes exhaust your energy. Stay hydrated!"
  ],
  Cloudy: [
    "Cloudy skies bring a gloom to your mood too. Maybe add a little brightness to your routine?",
    "Cloudy days can feel heavy — try some light therapy or a sunny distraction.",
    "Don’t let the gray skies get you down. Bright moments are coming."
  ],
  Rainy: [
    "Rainy days tend to bring you down. Time to break out the fuzzy socks and comfort shows!",
    "Rainy weather might sap your energy — cozy up and take it slow.",
    "Stormy moods come with rain. Treat yourself kindly during these days."
  ],
  Snowy: [
    "Snowy days are a bit rough for you. Hot drinks and warm thoughts, friend.",
    "Snow chills might be lowering your spirits. Wrap up warm and relax.",
    "Winter’s beauty is tough sometimes — take extra care of yourself."
  ],
  Stormy: [
    "Stormy days throw you off. Maybe unplug and ride out the chaos with calm.",
    "The storm outside might mirror your mood. Find quiet time to regroup.",
    "When the weather rages, find your inner calm — it helps a lot."
  ]
};

  // 🔹 Weather correlation - FIXED VERSION
  const weatherMoods: Record<string, { moods: number[], count: number, total: number }> = {};

  // Use only recent entries (last 60 days) for meaningful analysis
  recentEntries.forEach(entry => {
    if (entry.weather && entry.mood != null) {
      if (!weatherMoods[entry.weather]) {
        weatherMoods[entry.weather] = { moods: [], count: 0, total: 0 };
      }
      weatherMoods[entry.weather].moods.push(entry.mood);
      weatherMoods[entry.weather].count++;
      weatherMoods[entry.weather].total += entry.mood;
    }
  });

  // Only analyze weather patterns with at least 2 recent entries
  const validWeatherPatterns = Object.entries(weatherMoods)
    .filter(([_, data]) => data.count >= 2)
    .map(([weather, data]) => ({
      weather,
      avg: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.avg - a.avg);
 
// Generate insights for statistically significant weather patterns
if (validWeatherPatterns.length > 0) {
  // Only show the highest average weather insight, without calculation details
  const bestWeather = validWeatherPatterns[0];
  if (bestWeather) {
    const { weather, avg } = bestWeather;
    if (avg >= 5.5 && weatherCompliments[weather]) {
      const messages = weatherCompliments[weather];
      insights.push(messages[Math.floor(Math.random() * messages.length)]);
    } else if (avg >= 3.5) {
      insights.push(`Your mood on ${weather} days is moderate. Keep observing how weather affects you.`);
    } else if (weatherWarnings[weather]) {
      const messages = weatherWarnings[weather];
      insights.push(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      insights.push(`Your mood seems low on ${weather} days. Maybe find ways to boost your spirits then.`);
    }
  }
} else {
  // Fallback analysis with all data (not just recent)
  const allWeatherMoods: Record<string, {moods: number[], total: number, count: number}> = {};
  moodEntries.forEach(entry => {
    if (entry.weather && entry.mood != null) {
      if (!allWeatherMoods[entry.weather]) {
        allWeatherMoods[entry.weather] = { moods: [], total: 0, count: 0 };
      }
      allWeatherMoods[entry.weather].moods.push(entry.mood);
      allWeatherMoods[entry.weather].total += entry.mood;
      allWeatherMoods[entry.weather].count++;
    }
  });

  // Show all weather calculations in fallback with detailed math
  const weatherCalculations = Object.entries(allWeatherMoods)
    .map(([weather, data]) => ({
      weather,
      avg: data.total / data.count,
      count: data.count,
      moods: data.moods,
      total: data.total
    }))
    .sort((a, b) => b.avg - a.avg);

  weatherCalculations.forEach(({ weather, avg, count, moods, total }) => {
    const moodList = moods.join(', ');
    const calculationNote = ` [${weather}: ${moods.join(' + ')} = ${total} ÷ ${count} = ${avg.toFixed(1)} avg]`;
    
    if (avg >= 6.5 && weatherCompliments[weather]) {
      const messages = weatherCompliments[weather];
      insights.push(messages[Math.floor(Math.random() * messages.length)] + calculationNote);
    } else if (avg >= 4.5) {
      insights.push(`Your mood on ${weather} days is moderate. Keep observing how weather affects you.` + calculationNote);
    } else if (weatherWarnings[weather]) {
      const messages = weatherWarnings[weather];
      insights.push(messages[Math.floor(Math.random() * messages.length)] + calculationNote);
    } else {
      insights.push(`Your mood seems low on ${weather} days. Maybe find ways to boost your spirits then.` + calculationNote);
    }
  });

  // Add debug info to show which entries are being used
  insights.push(`DEBUG: Using ${moodEntries.length} total entries for fallback analysis`);
  moodEntries.forEach((entry, index) => {
    if (entry.weather && entry.mood != null) {
      insights.push(`DEBUG: Entry ${index+1}: ${entry.created_at} - ${entry.weather} - mood ${entry.mood}`);
    }
  });
}
      // 🔹 Mood volatility
      if (chartData.length > 1) {
        const meanMood = avgMoodNum;
        const variance = chartData.reduce((sum, d) => sum + Math.pow(d.mood - meanMood, 2), 0) / chartData.length;
        const stdDev = Math.sqrt(variance);

        if (avgMoodNum <= 4 && stdDev < 1.5) {
          insights.push("Your mood has been low but stable. Consider gentle ways to lift your spirits—small steps can make a difference.");
        } else if (stdDev >= 1.5) {
          insights.push("Your mood’s been a bit of a rollercoaster lately. Buckle up, and maybe schedule some grounding time.");
        } else {
          insights.push("Your mood has remained consistently stable recently, demonstrating commendable emotional balance.");
        }
      }

      return insights;
    };

    const [showModal, setShowModal] = useState(false);

    const handleConfirm = () => {
      setShowModal(false);
      navigate('/journey');
    };

    const handleCancel = () => {
      setShowModal(false);
    };

  useEffect(() => {
    const checkLastActive = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('last_active_at')
        .eq('id', user.id)
        .single();

      if (error || !data?.last_active_at) return;

      const lastActive = new Date(data.last_active_at);
      const now = new Date();
      const diffInDays = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

      if (diffInDays >= 14) {
        setShowModal(true);
      }
    };

    checkLastActive();
  }, [user]);

const exportMoodChartAsPDF = async (viewType: 'line' | 'bar', username: string) => { 
  const chartEl = document.getElementById('chart-container');
  if (!chartEl) return;

  const canvas = await html2canvas(chartEl);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = 15;
  const maxWidth = pdfWidth - 2 * margin;
  const maxHeight = pdfHeight - 2 * margin;

  let imgWidth = maxWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }

  const x = (pdfWidth - imgWidth) / 2;
  const y = (pdfHeight - imgHeight) / 2;

  // Add chart image
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor('#4F46E5'); 
  pdf.text(`Mood Tracker - ${username}`, pdfWidth / 2, 18, { align: 'center' });

  // Chart type subtitle
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(12);
  pdf.setTextColor('#6B7280'); 
  pdf.text(`Chart Type: ${viewType === 'line' ? 'Line Chart' : 'Bar Chart'}`, pdfWidth / 2, 26, { align: 'center' });

  // Divider line
  pdf.setDrawColor('#A5B4FC');
  pdf.setLineWidth(0.8);
  pdf.line(margin, 30, pdfWidth - margin, 30);

  // Average mood and trend texts (existing code)
  const avgMood = getAverageMood();
  const trend = getTrend();

  let trendMessage = '';
  if (trend === 'improving') {
    trendMessage = "That's fantastic! Your mood is on the rise, keep riding that positive wave!";
  } else if (trend === 'declining') {
    trendMessage = "It's okay to have ups and downs. Keep your chin up; brighter days are ahead!";
  } else {
    trendMessage = "Steady and stable — sometimes that's exactly what we need. Keep going strong!";
  }

  pdf.setFont('times', 'normal');
  pdf.setFontSize(16);
  pdf.setTextColor('#333333');

  let textY = y + imgHeight + 15;

  // Average mood sentence
  const textBefore = "Your mood over the recent period shows an average of ";
  const textAfter = ".";

  pdf.text(textBefore, margin, textY);
  const avgPrefixWidth = pdf.getTextWidth(textBefore);

  pdf.setFont('times', 'bold');
  pdf.setTextColor('#4F46E5');
  pdf.text(`${avgMood}`, margin + avgPrefixWidth + 2 * 2, textY);

  const numberWidth = pdf.getTextWidth(`${avgMood}`);

  pdf.setFont('times', 'normal');
  pdf.setTextColor('#333333');
  pdf.text(textAfter, margin + avgPrefixWidth + numberWidth + 2 * 2, textY);

  textY += 10;

  // Trend sentence
  const beforeTrend = "The trend is currently ";
  const afterTrend = ", reflecting how your feelings have been evolving.";

  pdf.text(beforeTrend, margin, textY);
  const beforeWidth = pdf.getTextWidth(beforeTrend);

  pdf.setFont('times', 'bold');
  pdf.setTextColor('#4F46E5');
  pdf.text(trend, margin + beforeWidth + 2, textY);

  const trendWidth = pdf.getTextWidth(trend);
  pdf.setFont('times', 'normal');
  pdf.setTextColor('#333333');
  pdf.text(afterTrend, margin + beforeWidth + trendWidth + 4, textY);

  textY += 12;

  // Trend message lines
  trendMessage.split('\n').forEach(line => {
    pdf.text(line, margin, textY);
    textY += 10;
  });

    const insights = getMoodInsights();

    pdf.setFont('times', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor('#222222');

    textY += 10;

    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 15;

    // Calculate approx height for title + divider + first paragraph
    const titleHeight = 8;   // approx for title line
    const dividerHeight = 12; // approx for divider line + spacing
    const firstParagraph = insights[0] || '';
    const firstParaLines = pdf.splitTextToSize(firstParagraph, maxWidth);
    const firstParaHeight = firstParaLines.length * 8 + 5; // lines * line height + gap

    const neededHeight = titleHeight + dividerHeight + firstParaHeight;

    // If not enough space, add a new page before title
    if (textY + neededHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      textY = margin;
    }

    // Now add title and divider
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor('#4F46E5');
    pdf.text('Insights', margin, textY);
    textY += titleHeight;

    pdf.setDrawColor('#A5B4FC');
    pdf.setLineWidth(0.8);
    pdf.line(margin, textY, pdfWidth - margin, textY);
    textY += dividerHeight;

    // Then add all insights
    insights.forEach((insight, i) => {
      const splitLines = pdf.splitTextToSize(insight, maxWidth);

      if (textY + splitLines.length * 8 > pageHeight - bottomMargin) {
        pdf.addPage();
        textY = margin;
      }

      pdf.setFont('times', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor('#222222');
      pdf.text(splitLines, margin, textY);
      textY += splitLines.length * 8 + 5;
    });

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD format
    pdf.save(`${username}-${viewType}-chart-${formattedDate}.pdf`);
  };

  /* ----- Data Fetch ----- */
  const {
    data: moodEntries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mood-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mood_track')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to 100 entries initially
      if (error) {
        console.error('Error fetching mood entries:', error);
        throw error;
      }
      return data as MoodEntry[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  /* ----- Filter by Selected Time Range ----- */
  const filteredEntries = useMemo(() => {
    if (!moodEntries.length) return [];
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case 'week':
        cutoff = daysAgo(now, 7);
        break;
      case 'month':
        cutoff = daysAgo(now, 30);
        break;
      case 'year':
        cutoff = daysAgo(now, 365);
        break;
      default:
        cutoff = daysAgo(now, 30);
    }

    return moodEntries.filter((e) => new Date(e.created_at) >= cutoff);
  }, [moodEntries, timeRange]);

  /* ----- Chart Data from Filtered Entries ----- */
  const chartData: ChartData[] = useMemo(
    () =>
      filteredEntries
        .map((entry) => ({
          date: entry.created_at,
          mood: entry.mood,
          weather: entry.weather || 'unknown',
          formattedDate: new Date(entry.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }))
        .reverse(),
    [filteredEntries]
  );
  /* ----- Last Mood Entry Date (not today) ----- */
  const lastMoodEntryDate = useMemo(() => {
    if (!moodEntries.length) return null;
    const lastDate = moodEntries[0].created_at ? new Date(moodEntries[0].created_at) : null;
    if (!lastDate) return null;
    const today = new Date();
    if (
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate()
    ) {
      return null; // Don't show warning if last entry is today
    }
    return lastDate;
  }, [moodEntries]);

  /* ----- Stats ----- */
  const avgMoodNum = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((acc, day) => acc + day.mood, 0) / chartData.length;
  }, [chartData]);

  const getAverageMood = () => avgMoodNum.toFixed(1);

  const getTrend = () => {
    // Always use the most recent 14 days, regardless of selected time period
    if (chartData.length < 14) return "can't determine";
    const recent = chartData.slice(-7);
    const older = chartData.slice(-14, -7);
    if (recent.length < 7 || older.length < 7) return "can't determine";
    const recentAvg = recent.reduce((acc, d) => acc + d.mood, 0) / recent.length;
    const olderAvg = older.reduce((acc, d) => acc + d.mood, 0) / older.length;
    return recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';
  };

  /* ----- Calendar Helpers ----- */
    const getMoodData = (date: Date) => {
      const entry = moodEntries.find((e) => {
        const d = new Date(e.created_at);
        return isSameDay(d, date);
      });
      if (!entry) return null;

      const score = entry.mood;

      const emoji = FALLBACK_EMOJI_BY_SCORE[Math.round(score)] || '●';

      return {
        mood: score,
        emoji,
        moodText: score.toString(), 
        note: entry.note || '',
      };
    };

  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, monthIndex, day));
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      direction === 'prev' ? newMonth.setMonth(prev.getMonth() - 1) : newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  /* ----- Calendar Dot Color ----- */
 const getMoodDotClass = (score: number) => {
  if (score >= 1 && score <= 2) return 'text-red-400 dark:text-rose-200';         // Poor
  if (score >= 3 && score <= 4) return 'text-orange-400 dark:text-amber-200';     // Low
  if (score >= 5 && score <= 6) return ' text-yellow-500 dark:text-yellow-300';    // Okay
  if (score >= 7 && score <= 8) return 'text-green-500 dark:text-emerald-300';  // Good
  if (score >= 9 && score <= 10) return 'text-sky-500 dark:text-sky-300';    // Great
  return 'text-gray-400 dark:text-gray-300'; // fallback for invalid scores
};

  /* ----- Chart Gradient IDs ----- */
  const gradientLineId = useId();
  const gradientBarId = useId();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 dark:from-white/30 dark:to-purple-200/30 animate-float" />
        <div className="absolute top-60 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300/30 to-red-300/30 dark:from-white/30 dark:to-purple-200/30 animate-float" style={{ animationDelay: '2s' }} />
        <CalendarIcon className="absolute top-32 right-1/4 h-8 w-8 text-blue-400 animate-sparkle" />
        <Star className="absolute top-1/3 left-10 h-4 w-4 text-yellow-400 animate-sparkle" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute bottom-20 right-10 h-5 w-5 text-purple-400 animate-sparkle" style={{ animationDelay: '4s' }} />
        <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 dark:text-pink-200 animate-float dark:block hidden" />
        <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 dark:text-yellow-300 animate-sparkle dark:block hidden" />
        <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 dark:text-purple-300 animate-sparkle dark:block hidden" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
         
          {/* Header */}
         <div className="text-center mb-12 animate-fade-in relative">
          <div className="flex justify-center items-center mb-6">
          <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 rounded-full blur-xl opacity-60 animate-glow"></div>
                <div className="relative p-6 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/60 dark:border-white/20 group-hover:scale-110 transition-transform duration-500">
        <Clock className="h-16 w-16 text-purple-600 dark:text-white" />
      </div>
    </div>
  </div>
  <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
              Your Mood
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 animate-gradient-shift">
                Journey History
              </span>
            </h1>
  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium max-w-2xl mx-auto transition-colors">
    Track your emotional patterns and celebrate your beautiful progress over time 
  </p>
</div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Average Mood</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">{getAverageMood()}/10</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-white/30 dark:to-purple-200/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="h-8 w-8 text-purple-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Trend</p>
                  {(() => {
                    const tr = getTrend();
                    const cls = tr === 'improving' ? 'text-green-600 dark:text-emerald-300' : tr === 'declining' ? 'text-red-600 dark:text-rose-300' : 'text-yellow-600 dark:text-amber-300';
                    return <p className={`text-xl font-black capitalize ${cls}`}>{tr}</p>;
                  })()}
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-white/30 dark:to-purple-200/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="h-8 w-8 text-purple-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Days Tracked</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:text-pink-300">{filteredEntries.length}</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-white/30 dark:to-purple-200/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <CalendarIcon className="h-8 w-8 text-pink-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 transition-all duration-500 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-100/60 to-pink-100/60 dark:from-white/30 dark:to-purple-200/30 rounded-xl">
                  <Filter className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-white">View Options:</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex rounded-xl border-2 overflow-hidden shadow-lg border-purple-200 dark:border-white/20">
                  <button
                    onClick={() => setViewType('line')}
                    className={`px-5 py-3 text-base font-bold transition-all duration-300 ${viewType === 'line' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-xl animate-glow' : 'bg-white/70 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl dark:bg-white/10 dark:border-white/30 dark:hover:border-white/50'}`}
                  >
                    Line Chart
                  </button>
                  <button
                    onClick={() => setViewType('bar')}
                    className={`px-5 py-3 text-base font-bold transition-all duration-300 ${viewType === 'bar' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-xl animate-glow' : 'bg-white/70 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl dark:bg-white/10 dark:border-white/30 dark:hover:border-white/50'}`}
                  >
                    Bar Chart
                  </button>
                </div>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center px-5 py-3 text-base font-bold rounded-xl border-2 transition-all duration-500 shadow-lg hover:scale-105 ${showCalendar ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 animate-glow' : 'bg-white text-gray-700 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:bg-white/10 dark:text-purple-100 dark:border-white/20 dark:hover:bg-white/20'}`}
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Mood Calendar
                  <Sparkles className="h-4 w-4 ml-2 animate-sparkle" />
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                  className="px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-base font-medium bg-white/80 backdrop-blur-lg border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 dark:bg-white/10 dark:border-white/20 dark:text-white"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
          {/* Calendar */}
         
      {showCalendar && (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-black text-gray-800 dark:text-white">Mood Calendar </h3>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-3 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-pink-100/40 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
        </button>
        <span className="font-bold text-xl text-gray-800 dark:text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => navigateMonth('next')}
          className="p-3 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-pink-100/40 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
        </button>
      </div>
    </div>

    <div id="calendar-to-export" className="grid grid-cols-7 gap-3">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="text-center text-base font-black p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 dark:from-white/30 dark:to-purple-200/30 dark:text-purple-100"
        >
          {day}
        </div>
      ))}

      {generateCalendarDays(currentMonth).map((day, index) => {
        if (!day) return <div key={index} className="p-3" />;

        const moodData = getMoodData(day);
        const dayKey = day.toISOString();
        const dotClass = moodData ? getMoodDotClass(moodData.mood) : '';
        const isNoteVisible = showNote === dayKey;

        return (
          <div
            key={dayKey}
            className={`relative p-3 text-center rounded-xl transition-all duration-300 cursor-pointer border-2 ${
              moodData
                ? 'hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:border-purple-300 border-transparent shadow-lg hover:shadow-xl hover:scale-105 dark:hover:bg-white/10 dark:hover:border-white/20'
                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-transparent dark:hover:bg-white/10'
            }`}
            onMouseEnter={() => setHoveredDay(dayKey)}
            onMouseLeave={() => {
              if (!isNoteVisible) setHoveredDay(null);
            }}
          >
            <div className="text-base font-bold mb-1 text-gray-800 dark:text-white">{day.getDate()}</div>

            {moodData && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNote(isNoteVisible ? null : dayKey);
                }}
                className="mt-2 focus:outline-none"
              >
                <Smile className={`h-6 w-6 ${dotClass}`} />
              </button>
            )}

            {moodData && isNoteVisible && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNote(null);
                }}
                onMouseEnter={() => setHoveredDay(dayKey)}
                onMouseLeave={() => setHoveredDay(dayKey)} // keep it open
                className="absolute -top-28 left-1/2 transform -translate-x-1/2 p-3 bg-pink-100 dark:bg-pink-900 text-gray-800 dark:text-white rounded-lg shadow-lg border border-pink-200 dark:border-pink-800 w-fit min-w-[120px] max-w-[80%] sm:max-w-[50%] z-50"
              >
                <div className="text-sm font-medium whitespace-normal break-words">
                  {moodData.note || 'No note available'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click again to close</div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-pink-100 dark:border-t-pink-900"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Mood Legend */}
    <div className="mt-6 flex items-center justify-center flex-wrap gap-3 text-base font-medium text-gray-600 dark:text-purple-100">
      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
        <Frown className="h-6 w-6 text-rose-500 dark:text-rose-300" />
        <span>Poor (1-2)</span>
      </div>
      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
        <Meh className="h-6 w-6 text-orange-400 dark:text-amber-300" />
        <span>Low (3-4)</span>
      </div>
      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
        <Smile className="h-6 w-6 text-yellow-500 dark:text-yellow-300" />
        <span>Okay (5-6)</span>
      </div>
      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
        <Laugh className="h-6 w-6 text-green-500 dark:text-emerald-300" />
        <span>Good (7-8)</span>
      </div>
      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
        <PartyPopper className="h-6 w-6 text-sky-500 dark:text-sky-300" />
        <span>Great (9-10)</span>
      </div>
    </div>

    <div className="mt-4 text-center text-base font-medium text-gray-600 dark:text-purple-100">
      Click the face icon to see notes! ✨
    </div>
  </div>
)}

          
           {/* Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-2xl font-black mb-8 text-center text-gray-800 dark:text-white">Your Mood Journey </h3>
            <div className="h-96" id="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={1} className="dark:stroke-[#e0e7ff]" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="currentColor"
                      tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis
                      stroke="currentColor"
                      tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
                      domain={[0, 10]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '2px solid #4b5563',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#111827',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke={`url(#${gradientLineId})`}
                      strokeWidth={4}
                      dot={{ fill: '#3B82F6', strokeWidth: 3, r: 6 }}
                      name="Mood (1-10)"
                    />
                    <defs>
                      <linearGradient id={gradientLineId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={1} className="dark:stroke-[#e0e7ff]" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="currentColor"
                      tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis
                      stroke="currentColor"
                      tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
                      domain={[0, 10]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '2px solid #4b5563',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#111827',
                      }}
                      wrapperClassName="dark:[&>div]:bg-gray-800 dark:[&>div]:text-white dark:[&>div]:border-gray-600"
                    />
                    <Legend />
                    <Bar
                      dataKey="mood"
                      fill={`url(#${gradientBarId})`}
                      name="Mood (1-10)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id={gradientBarId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" className="dark:stop-color-blue-400" />
                        <stop offset="100%" stopColor="#8B5CF6" className="dark:stop-color-purple-400" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

         {/* Insights */}
<div
  className="relative animate-fade-in transition-all duration-700 ease-out p-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-white/50 dark:bg-white/10 dark:border-white/20 group mb-12 overflow-hidden"
  style={{ animationDelay: '0.5s' }}
>
  {/* Decorative Background Icons */}
  <div className="absolute inset-0 pointer-events-none z-0">
    <Sparkles className="absolute top-6 left-6 w-6 h-6 text-purple-300/50 dark:text-purple-200/50 drop-shadow-sm" />
    <Heart className="absolute bottom-8 right-8 w-7 h-7 text-pink-400/50 dark:text-pink-300/60 drop-shadow-sm animate-pulse" />
    <Star className="absolute top-1/3 right-4 w-5 h-5 text-yellow-300/50 dark:text-yellow-200/60 drop-shadow-sm" />
  </div>

  {/* Main Content */}
  <div className="relative z-10">
    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 dark:from-purple-700 dark:to-pink-700 shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-500">
      <Sparkles className="h-10 w-10 text-white group-hover:animate-bounce transition duration-300" />
    </div>

    <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
      Your Beautiful Insights
    </h3>

    <div className="space-y-5 text-gray-800 dark:text-gray-200 text-base font-serif max-w-2xl mx-auto">
      {moodEntries.length < 5 ? (
        <div className="flex items-center space-x-3">
          <Sparkles className="h-6 w-6 text-purple-400 dark:text-purple-300 flex-shrink-0" />
          <p className="inline">" Keep logging your mood consistently to gain more personalized insights. "</p>
        </div>
      ) : (
        getMoodInsights().slice(0, 7).map((insight, i) => {
          const isToughPatch = insight.toLowerCase().includes("tough patch") || insight.toLowerCase().includes("not be okay");
          return (
            <div key={i} className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-purple-400 dark:text-purple-300 flex-shrink-0" />
              <p className={`inline${isToughPatch ? ' text-red-600 dark:text-red-400 font-bold' : ''}`}>" {insight} "</p>
            </div>
          );
        })
      )}
    </div>

    <div className="flex justify-center mt-8">
      <Button className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 text-white font-bold text-lg rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-transform transform hover:scale-105 duration-300"
      onClick={() => exportMoodChartAsPDF(viewType, user?.user_metadata?.username || user?.email || 'user')}>
        <Sparkles className="w-5 h-5 mr-2" />
        Print Your History
      </Button>
    </div>
  </div>
</div>


        </div>
      </div>
                      {showModal && (
                  <ConfirmModal
                    message="Hey! You haven’t tracked your mood in awhile. Want to check in now?"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                  />
                )}

    </div>
  );
};

const History: React.FC = () => (
  <Suspense fallback={<Skeleton />}>
    <HistoryContent />
  </Suspense>
);

export default History;