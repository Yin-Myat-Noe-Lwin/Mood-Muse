import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap, Sun, CloudRain, Star } from 'lucide-react';
import { QuestionnaireStep } from './QuestionnaireStep';
import { MoodAnalysis } from './MoodAnalysis';
import { FortuneReveal } from './FortuneReveal';

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
    
    // Analyze mood based on answers
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
    
    // Simple mood analysis logic
    if (energyLevel === 'high' && recentFeeling.includes('happy')) return 'energetic';
    if (recentFeeling.includes('anxious') || recentFeeling.includes('worried')) return 'anxious';
    if (recentFeeling.includes('sad') || currentChallenge.includes('difficult')) return 'melancholic';
    if (energyLevel === 'low' && recentFeeling.includes('peaceful')) return 'calm';
    if (recentFeeling.includes('optimistic') || recentFeeling.includes('excited')) return 'hopeful';
    return 'happy';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
              <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
              <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{animationDelay: '1s'}} />
              <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
            </div>

            <Card className="w-full max-w-md text-center shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg">
              <CardHeader className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-journey-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Mystic Fortune
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover your inner wisdom through personalized insights and cosmic guidance
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleStartJourney}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 animate-glow-pulse"
                  size="lg"
                >
                  Begin Your Journey
                  <Star className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
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