import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Star,
} from 'lucide-react';
import { QuestionnaireStep } from '../components/fortune/QuestionnaireStep';
import { MoodAnalysis } from '../components/fortune/MoodAnalysis';
import { FortuneReveal } from '../components/fortune/FortuneReveal';

export type Mood = 'energetic' | 'calm' | 'anxious' | 'happy' | 'melancholic' | 'hopeful';

export interface UserProfile {
  name: string;
  age: string;
  currentChallenge: string;
  dreamGoal: string;
  energyLevel: string;
  recentFeeling: string;
  motivation: string;
}

const FortuneApp = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'questionnaire' | 'analysis' | 'fortune'>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analyzedMood, setAnalyzedMood] = useState<Mood | null>(null);

  const handleStartJourney = () => {
    setCurrentStep('questionnaire');
  };

  const handleQuestionnaireComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentStep('analysis');

    const mood = analyzeMood(profile);
    setTimeout(() => {
      setAnalyzedMood(mood);
    }, 2000);
  };

  const handleContinueToFortune = () => {
    setCurrentStep('fortune');
  };

const analyzeMood = (profile: UserProfile): Mood => {
  const { energyLevel, recentFeeling, currentChallenge } = profile;

  if (recentFeeling === 'energetic') return 'energetic';
  if (recentFeeling === 'anxious') return 'anxious';
  if (recentFeeling === 'melancholic') return 'melancholic';
  if (recentFeeling === 'calm') return 'calm';
  if (recentFeeling === 'hopeful') return 'hopeful';
  if (recentFeeling === 'happy') return 'happy';

  return 'calm';
}

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="relative h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-6 overflow-hidden transition-colors">
            {/* Sparkle Particles */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${4 + Math.random() * 5}s`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Glowing Orb for dark theme, softened for light */}
            <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full
              bg-gradient-to-r from-purple-300/40 to-pink-300/40
              dark:from-white/30 dark:to-purple-200/30
              animate-pulse-glow blur-sm dark:block hidden z-0">
            </div>

            {/* Center Card */}
            <Card className="w-full max-w-2xl text-center rounded-3xl shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg transition-all duration-500 hover:shadow-3xl z-10">
              <CardHeader className="space-y-6 py-10">
                <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center
                  bg-gradient-to-r from-purple-300 to-pink-300
                  dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600
                  animate-journey-pulse shadow-xl">
                  <Sparkles className="w-12 h-12 text-purple-400 dark:text-white animate-sparkle" />
                </div>
                <CardTitle className="text-4xl font-extrabold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mystic Fortune
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-base px-4 max-w-lg mx-auto">
                  Discover your inner wisdom through personalized questions and cosmic guidance.
                </p>
              </CardHeader>

              <CardContent className="py-6 px-8 space-y-4">
                <Button
                  onClick={handleStartJourney}
                  className="w-full
                    bg-gradient-to-r from-purple-300 to-pink-300
                    dark:from-purple-600 dark:to-pink-600
                    hover:from-purple-400 hover:to-pink-400
                    dark:hover:from-purple-700 dark:hover:to-pink-700
                    transition-all duration-300 animate-journey-pulse
                    text-gray-800 dark:text-white font-semibold text-lg py-4 rounded-xl"
                  size="lg"
                >
                  Begin Your Journey
                  <Star className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  ✨ Answer a few questions, discover your mood, and reveal a cosmic quote just for you.
                </p>
              </CardContent>
            </Card>

            {/* Bottom Message */}
            <div className="absolute bottom-6 text-gray-600 dark:text-gray-300 text-sm text-center w-full opacity-70 z-10">
              Your fortune awaits...
            </div>
          </div>
        );

      case 'questionnaire':
        return <QuestionnaireStep onComplete={handleQuestionnaireComplete} />;

      case 'analysis':
        return (
          <MoodAnalysis
            userProfile={userProfile!}
            analyzedMood={analyzedMood}
            onContinue={handleContinueToFortune}
          />
        );

      case 'fortune':
        return (
          <FortuneReveal
            mood={analyzedMood!}
            userName={userProfile?.name || 'Seeker'}
          />
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export default FortuneApp;
