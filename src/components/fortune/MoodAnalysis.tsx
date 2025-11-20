import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Zap, Sun, CloudRain, Star, Sparkles } from 'lucide-react';
import { Mood, UserProfile } from './FortuneApp';
import { Progress } from '@/components/ui/progress';

interface MoodAnalysisProps {
  userProfile: UserProfile;
  analyzedMood: Mood | null;
  onContinue: () => void;
}

const moodData = {
  energetic: {
    icon: Zap,
    color: 'text-yellow-400 dark:text-yellow-500', // softened in light mode
    bgColor: 'bg-yellow-400/20 dark:bg-yellow-500/10',
    title: 'Energetic & Dynamic',
    description: 'You radiate vibrant energy and are ready to take on challenges.',
    traits: ['High motivation', 'Action-oriented', 'Optimistic outlook']
  },
  calm: {
    icon: Sun,
    color: 'text-blue-400 dark:text-blue-500',
    bgColor: 'bg-blue-400/20 dark:bg-blue-500/10',
    title: 'Calm & Centered',
    description: 'You possess inner peace and approach life with serenity.',
    traits: ['Inner balance', 'Thoughtful decisions', 'Peaceful mindset']
  },
  anxious: {
    icon: CloudRain,
    color: 'text-gray-400 dark:text-gray-500',
    bgColor: 'bg-gray-400/20 dark:bg-gray-500/10',
    title: 'Thoughtful & Concerned',
    description: 'You care deeply and are processing important thoughts.',
    traits: ['Deep caring', 'Reflective nature', 'Seeking clarity']
  },
  happy: {
    icon: Heart,
    color: 'text-pink-400 dark:text-pink-500',
    bgColor: 'bg-pink-400/20 dark:bg-pink-500/10',
    title: 'Joyful & Content',
    description: 'You embrace life with warmth and positive energy.',
    traits: ['Positive outlook', 'Grateful heart', 'Infectious joy']
  },
  melancholic: {
    icon: Star,
    color: 'text-purple-400 dark:text-purple-500',
    bgColor: 'bg-purple-400/20 dark:bg-purple-500/10',
    title: 'Reflective & Deep',
    description: 'You have a rich inner world and deep emotional understanding.',
    traits: ['Emotional depth', 'Introspective', 'Empathetic soul']
  },
  hopeful: {
    icon: Sparkles,
    color: 'text-green-400 dark:text-green-500',
    bgColor: 'bg-green-400/20 dark:bg-green-500/10',
    title: 'Hopeful & Aspiring',
    description: 'You look toward the future with optimism and determination.',
    traits: ['Future-focused', 'Resilient spirit', 'Growth mindset']
  }
};

export const MoodAnalysis = ({ userProfile, analyzedMood, onContinue }: MoodAnalysisProps) => {
  const progress = 100; // full progress for analysis

  if (!analyzedMood) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
          <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
          <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
        </div>

        <Card className="w-full max-w-md text-center shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="pt-8">
            {/* Progress bar */}
            <Progress
              value={progress}
              className="w-full h-2 mb-4 bg-gray-200 dark:bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-indigo-50 [&>div]:via-purple-50 [&>div]:to-pink-100 dark:[&>div]:from-gray-900 dark:[&>div]:via-purple-900 dark:[&>div]:to-pink-900"
            />
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-journey-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-2">Analyzing Your Energy...</h3>
            <p className="text-gray-600 dark:text-gray-300">The cosmic forces are reading your responses...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mood = moodData[analyzedMood];
  const MoodIcon = mood.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
        <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
        <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
      </div>

      <Card className="w-full max-w-lg shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg animate-fade-in-up">
        <CardHeader className="text-center">
          <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center animate-journey-pulse ${mood.bgColor}`}>
            <MoodIcon className={`w-16 h-16 ${mood.color}`} />
          </div>
          <CardTitle className="text-2xl text-gray-800 dark:text-white mt-4">
            Your Current Energy: {mood.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {mood.description}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">Your Key Traits:</h4>
            <div className="grid gap-2">
              {mood.traits.map((trait, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-300">{trait}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">Personal Insight:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hello {userProfile.name}, based on your responses about {userProfile.currentChallenge.toLowerCase()},
              your energy aligns with a {mood.title.toLowerCase()} state. This suggests you're ready for
              wisdom that matches your current vibration.
            </p>
          </div>

          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600 hover:from-purple-400 hover:to-pink-400 dark:hover:from-purple-700 dark:hover:to-pink-700 text-gray-800 dark:text-white transition-all duration-300"
            size="lg"
          >
            Discover Your Fortune
            <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
